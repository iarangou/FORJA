import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

import { DatabaseService } from "../../database/service/database.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { PayloadJwt } from "../../shared/types/auth.types.js";

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
        }>(
            `
            SELECT u.id, u.username, u.password_hash, u.email FROM users u
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
            user: {id: user.id, username: user.username},
        };
    }
}