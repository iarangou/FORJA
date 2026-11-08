import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

import { DatabaseService } from "../../database/service/database.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { PayloadJwt } from "../../shared/types/auth.types.js";
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
            rol_id: number
        }>(
            `
            SELECT u.id, u.username, u.password_hash, u.email, u.rol_id FROM users u
                WHERE u.username = $1
                ORDER BY u.id
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
            username: user.username
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {id: user.id, username: user.username, rol: user.rol_id},
        };
    }

    async register(dto: RegisterDto) {
        const { rows } = await this.db.query<{
            username: string,
            email: string,
        }>(
            `
            SELECT bool_or(u.username = $1) AS username, bool_or(u.email    = $2) AS email
            FROM users u
            WHERE u.username = $1 OR u.email = $2
            `,
            [dto.username, dto.email],
        )

        console.log(rows);

        const { username, email} = rows[0];
        if(username && email) {
            throw new ConflictException('The username and the email is already taken.');
        }

        if(username) {
            throw new ConflictException('The username is taken.');
        };

        if(email) {
            throw new ConflictException('The email is taken.');
        }

        const password_hash = await bcrypt.hash(dto.password, 12);

        await this.db.query(
            `
            INSERT INTO users (username, email, full_name, password_hash)
                VALUES ($1, $2, $3, $4);
            `,
            [dto.username, dto.email, dto.full_name, password_hash]
        )

        return this.login({
            username: dto.username,
            password: dto.password
        })
    }
}