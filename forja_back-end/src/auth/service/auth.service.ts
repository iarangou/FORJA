import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

import { DatabaseService } from "../../database/service/database.service.js";
import { LoginDto } from "../dto/login.dto.js";
import type { PayloadJwt } from "../../shared/types/auth.types.js";
import { RegisterDto } from "../dto/register.dto.js";

@Injectable()
export class AuthService {
    constructor(
        private readonly db: DatabaseService,
        private readonly jwtService: JwtService
    ) {}

    async login(dto: LoginDto) {
        const { rows } = await this.db.query<{
            id: number,
            username: string,
            password_hash: string,
            email: string,
            rol_id: number,
            active: boolean
        }>(
            `
            SELECT u.id, u.username, u.password_hash, u.email, u.rol_id, u.active
                FROM users u
                WHERE u.username = $1
                LIMIT 1
            `,
            [dto.username],
        ) 

        // El email es para una implementacion futura en el que permita el `username` + `email` (NO OLVIDARME) 
        // att: Alejandro

        const user = rows[0];
        if(!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        if(!user.active) {
            throw new UnauthorizedException('Usuario inactivo');
        }
        
        const isValid = await bcrypt.compare(dto.password, user.password_hash)
        if(!isValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        await this.db.query(
            `
            UPDATE users SET last_login_at = NOW() WHERE id = $1
            `,
            [user.id]
        );
        
        const payload: PayloadJwt = {
            sub: user.id,
            username: user.username,
            rol_id: user.rol_id
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {id: user.id, username: user.username, rol: user.rol_id},
        };
    }

    async register(dto: RegisterDto) {
        const { rows } = await this.db.query<{
            email: string,
        }>(
            `
            SELECT bool_or(u.email = $1) AS email
            FROM users u
            WHERE u.email = $1
            `,
            [dto.email],
        )

        const {email} = rows[0];

        if(email) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }

        const password_hash = await bcrypt.hash(dto.password, 12);

        const username = dto.email.split('@')[0].toLowerCase();

        await this.db.query(
            `
            INSERT INTO users (username, email, full_name, password_hash)
                VALUES ($1, $2, $3, $4);
            `,
            [username, dto.email, dto.full_name, password_hash]
        )

        return {
            message: 'User registered successfully',
        }
    }
}
