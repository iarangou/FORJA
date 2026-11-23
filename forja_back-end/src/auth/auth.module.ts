import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controller/auth.controller.js';
import { AuthService } from './service/auth.service.js';
import { AuthGuard } from './guard/auth.guard.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const lifetime = Number(config.get<string>('JWT_EXPIRES_IN_SECONDS') ?? '7200');
        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET debe contener al menos 32 caracteres');
        }
        if (!Number.isFinite(lifetime) || lifetime < 60) {
          throw new Error('JWT_EXPIRES_IN_SECONDS debe ser un número válido >= 60');
        }
        return { secret, signOptions: { expiresIn: lifetime } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
