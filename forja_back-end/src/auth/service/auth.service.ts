import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto.js';
import { UsersService } from '../../users/service/users.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    await this.usersService.updateLastLogin(user.id);
    const payload: PayloadJwt = {
      sub: user.id, username: user.username, rol_id: user.rol_id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, username: user.username, rol: user.rol_id },
    };
  }
}
