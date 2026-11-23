import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DatabaseError } from "pg";
import { DatabaseService } from "../../database/service/database.service.js";
import { UserCreateDto, UserDeleteDto, UserUpdateDto, UserProfileUpdateDto } from "../dto/users.dto.js";

interface RegistrationData {
    email: string;
    username: string;
    full_name: string;
    password_hash: string;
}

@Injectable()
export class UsersService {
    constructor(
        private readonly db: DatabaseService,
    ) { }

    async assertFacultyExists(faculty_id: number) {
        if (!Number.isInteger(faculty_id) || faculty_id < 1) {
            throw new BadRequestException('La facultad es obligatoria para los profesores');
        }

        const { rows } = await this.db.query(
            'SELECT id FROM faculty WHERE id = $1', [faculty_id]);
        if (!rows[0]) {
            throw new BadRequestException('La facultad indicada no existe');
        }
    }

    async assertAvailable(email: string, username: string) {
        const { rows } = await this.db.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR username = $2 LIMIT 1',
            [email, username],
        );

        if (rows.length) {
            throw new ConflictException('El correo o nombre de usuario ya está registrado');
        }
    }

    async findByUsername(username: string) {
        const { rows } = await this.db.query<{
            id: number;
            username: string;
            password_hash: string;
            email: string;
            rol_id: number;
            is_active: boolean;
            registration_status:string;
        }>(
            `SELECT id, username, password_hash, email, rol_id, is_active,registration_status FROM users 
                WHERE username = $1 OR LOWER(email) = LOWER($1) LIMIT 1`,
            [username],
        );

        return rows[0];
    }

    async updateLastLogin(id: number) {
        await this.db.query(
            'UPDATE users SET last_login_at = NOW() WHERE id = $1',
            [id],
        );
    }

    async createVerified(data:RegistrationData) {
        try{
            return await this.db.query(
                `INSERT INTO users (username,email,full_name,password_hash,rol_id,is_active,registration_status)
                 VALUES ($1,$2,$3,$4,3,FALSE,'PENDING') RETURNING id`,
                [data.username,data.email,data.full_name,data.password_hash],
            );
        }catch(error:unknown){
            this.handleDatabaseError(error);
        }
    }

    async reviewRegistration(id:number,decision:'APPROVE'|'REJECT',rolId?:number,facultyId?:number) {
        if(decision==='APPROVE'&&![2,3].includes(rolId??0)){
            throw new BadRequestException('Selecciona Profesor o Monitor antes de aprobar');
        }
        if(decision==='APPROVE'&&rolId===3&&(!Number.isInteger(facultyId)||!facultyId)){
            throw new BadRequestException('El profesor necesita una facultad');
        }
        return this.db.transaction(async client=>{
            const {rows}=await client.query<{id:number;registration_status:string}>(
                "SELECT id,registration_status FROM users WHERE id=$1 FOR UPDATE",[id],
            );
            if(!rows[0])throw new NotFoundException('Usuario no encontrado');
            if(rows[0].registration_status!=='PENDING')
                throw new ConflictException('La solicitud ya fue revisada');
            if(decision==='REJECT'){
                await client.query(
                    "UPDATE users SET registration_status='REJECTED',is_active=FALSE,updated_at=NOW() WHERE id=$1",
                    [id],
                );
                return {message:'Solicitud rechazada'};
            }
            if(rolId===3){
                const {rows:faculty}=await client.query('SELECT id FROM faculty WHERE id=$1',[facultyId]);
                if(!faculty[0])throw new BadRequestException('La facultad seleccionada no existe');
                await client.query(
                    'INSERT INTO teacher(user_id,faculty_id) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET faculty_id=EXCLUDED.faculty_id',
                    [id,facultyId],
                );
            }
            await client.query(
                "UPDATE users SET rol_id=$2,registration_status='APPROVED',is_active=TRUE,updated_at=NOW() WHERE id=$1",
                [id,rolId],
            );
            return {message:'Cuenta activada correctamente'};
        });
    }

    async getAll() {
        const { rows } = await this.db.query(
            `
            SELECT u.id, u.username, u.email, u.full_name, u.rol_id,
                   r.name AS rol, u.is_active,u.registration_status,u.last_login_at,
                   u.created_at, u.updated_at
            FROM users u
            INNER JOIN rol r ON r.id = u.rol_id
            ORDER BY u.id
            `
        );

        return rows;
    }

    async getProfile(id: number) {
        const { rows } = await this.db.query(
            `SELECT u.id, u.username, u.full_name, u.email, u.rol_id,
                    t.faculty_id, f.name AS faculty_name
             FROM users u
             LEFT JOIN teacher t ON t.user_id = u.id
             LEFT JOIN faculty f ON f.id = t.faculty_id
             WHERE u.id = $1`,
            [id],
        );

        if (!rows[0]) throw new NotFoundException('Usuario no encontrado');
        return rows[0];
    }

    async updateProfile(id: number, dto: UserProfileUpdateDto) {
        if (dto.full_name === undefined && dto.faculty_id === undefined) {
            throw new BadRequestException('Debes enviar al menos un campo para actualizar');
        }

        try {
            await this.db.transaction(async (client) => {
                const { rows } = await client.query<{ rol_id: number }>(
                    'SELECT rol_id FROM users WHERE id = $1 FOR UPDATE', [id],
                );

                if (!rows[0]) {
                    throw new NotFoundException('Usuario no encontrado');
                }

                if (rows[0].rol_id === 3 && dto.faculty_id === undefined) {
                    const profile = await client.query('SELECT faculty_id FROM teacher WHERE user_id = $1', [id]);
                    if (!profile.rows[0]?.faculty_id) {
                        throw new BadRequestException('Debes seleccionar una facultad para completar tu perfil de profesor');
                    }
                }

                if (dto.faculty_id !== undefined) {
                    if (rows[0].rol_id !== 3) {
                        throw new ForbiddenException('Solo los profesores pueden cambiar su facultad');
                    }
                    await client.query(
                        `INSERT INTO teacher (user_id, faculty_id) VALUES ($1, $2)
                         ON CONFLICT (user_id) DO UPDATE SET faculty_id = EXCLUDED.faculty_id`,
                        [id, dto.faculty_id],
                    );
                }

                await client.query(
                    `UPDATE users SET full_name = COALESCE($1, full_name), updated_at = NOW()
                     WHERE id = $2`,
                    [dto.full_name, id],
                );
            });
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23503' &&
                error.constraint === 'teacher_faculty_id_fkey') {
                throw new BadRequestException('La facultad indicada no existe');
            }
            throw error;
        }

        return { message: 'Perfil actualizado exitosamente.', user: await this.getProfile(id) };
    }

    async getById(id: number) {
        const { rows } = await this.db.query(
            `
            SELECT u.id, u.username, u.email, u.full_name, u.rol_id,
                   r.name AS rol, u.is_active, u.last_login_at,
                   u.created_at, u.updated_at
            FROM users u
            INNER JOIN rol r ON r.id = u.rol_id
            WHERE u.id = $1
            LIMIT 1
            `,
            [id],
        );

        const user = rows[0];

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    async create(dto: UserCreateDto) {
        if (dto.rol_id === 3) {
            await this.assertFacultyExists(dto.faculty_id as number);
        } else if (dto.faculty_id !== undefined) {
            throw new BadRequestException('La facultad solo aplica a profesores');
        }
        const email = dto.email.trim().toLowerCase();
        const username = email.split('@')[0];
        const password_hash = await bcrypt.hash(dto.password, 12);

        try {
            return await this.db.transaction(async (client) => {
            const { rows } = await client.query(
                `
                INSERT INTO users (username, email, full_name, password_hash, rol_id, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, username, email, full_name, rol_id, is_active,
                          created_at, updated_at
                `,
                [username, email, dto.full_name, password_hash, dto.rol_id, dto.is_active],
            );

            if (rows[0].rol_id === 3) {
                await client.query('INSERT INTO teacher (user_id, faculty_id) VALUES ($1, $2)', [rows[0].id, dto.faculty_id]);
            }

            return {
                message: 'Usuario creado exitosamente.',
                user: rows[0],
            };
            });
        } catch (error: unknown) {
            this.handleDatabaseError(error);
        }
    }

    async update(dto: UserUpdateDto) {
        try {
        return await this.db.transaction(async (client) => {
        const { rows } = await client.query(
            `
            UPDATE users
            SET full_name = COALESCE($1, full_name),
                rol_id = COALESCE($2, rol_id),
                is_active = COALESCE($3, is_active),
                updated_at = NOW()
            WHERE id = $4
            RETURNING id, username, email, full_name, rol_id, is_active,
                      last_login_at, created_at, updated_at
            `,
            [dto.full_name, dto.rol_id, dto.is_active, dto.id],
        );

        const user = rows[0];

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (user.rol_id === 3) {
            if (dto.faculty_id !== undefined) {
                await client.query(
                    `INSERT INTO teacher (user_id, faculty_id) VALUES ($1, $2)
                     ON CONFLICT (user_id) DO UPDATE SET faculty_id = EXCLUDED.faculty_id`,
                    [user.id, dto.faculty_id],
                );
            } else {
                const profile = await client.query('SELECT faculty_id FROM teacher WHERE user_id = $1', [user.id]);
                if (!profile.rows[0]?.faculty_id) {
                    throw new BadRequestException('La facultad es obligatoria para los profesores');
                }
            }
        } else if (dto.faculty_id !== undefined) {
            throw new BadRequestException('La facultad solo aplica a profesores');
        }

        return {
            message: 'Usuario actualizado exitosamente.',
            user,
        };
        });
        } catch (error: unknown) {
            this.handleDatabaseError(error);
        }
    }

    async delete(dto: UserDeleteDto) {
        try {
            const { rows } = await this.db.query(
                `
                DELETE FROM users
                WHERE id = $1
                RETURNING id
                `,
                [dto.id],
            );

            if (!rows[0]) {
                throw new NotFoundException('Usuario no encontrado');
            }
        } catch (error: unknown) {
            if (error instanceof DatabaseError && error.code === '23503') {
                throw new ConflictException('No se puede eliminar el usuario porque tiene registros asociados');
            }

            throw error;
        }

        return {
            message: 'Usuario eliminado exitosamente.',
        };
    }

    private handleDatabaseError(error: unknown): never {
        if (error instanceof DatabaseError && error.code === '23503' &&
            error.constraint === 'teacher_faculty_id_fkey') {
            throw new BadRequestException('La facultad indicada no existe');
        }
        if (error instanceof DatabaseError && error.code === '23505') {
            if (error.constraint === 'users_email_key') {
                throw new ConflictException('El correo electrónico ya está registrado');
            }

            if (error.constraint === 'users_username_key') {
                throw new ConflictException('El nombre de usuario ya está registrado');
            }
        }

        throw error;
    }
}
