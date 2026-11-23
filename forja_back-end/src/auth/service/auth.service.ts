import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VerificationService } from './verification.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { VerifyEmailDto } from '../dto/verify-email.dto.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto.js';
import { UsersService } from '../../users/service/users.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly verification: VerificationService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.is_active || user.registration_status !== 'APPROVED') {
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
  async register(dto: RegisterDto) {
    const email=dto.email.trim().toLowerCase();
    const username=email.split('@')[0];
    await this.usersService.assertAvailable(email,username);
    const password_hash=await bcrypt.hash(dto.password,12);
    await this.verification.generate({
      email,username,full_name:dto.full_name.trim(),password_hash
    });
    return {message:'Te enviamos un código para verificar tu correo.',expires_in:600};
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const pending=await this.verification.verify(dto.email.trim().toLowerCase(),dto.code);
    await this.usersService.createVerified(pending);
    await this.verification.consume(pending.email,pending.id);
    return {message:'Correo verificado. Tu cuenta está pendiente de aprobación del administrador.'};
  }

  async resendVerification(email:string) {
    await this.verification.resend(email.trim().toLowerCase());
    return {message:'Código enviado nuevamente.',expires_in:600};
  }
}
