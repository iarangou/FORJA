import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import { DatabaseService } from '../../database/service/database.service.js';

interface RequestHttp {
  headers: Record<string, string | undefined>;
  user?: PayloadJwt;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly db: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestHttp>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token');
    }

    let payload: PayloadJwt;
    try {
      payload = await this.jwtService.verifyAsync<PayloadJwt>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    };

    const { rows } = await this.db.query<{
      id: number;
      username: string;
      rol_id: number;
      is_active: boolean;
      registration_status:string;
    }>(
      `SELECT u.id, u.username, u.rol_id, u.is_active,u.registration_status FROM users u
       WHERE u.id = $1`,
      [payload.sub],
    );

    const user = rows[0];

    if(!user || !user.is_active || user.registration_status!=='APPROVED') {
      throw new UnauthorizedException('Usuario inactivo o inexistente');
    }

    request.user = {
      ...payload,
      sub: user.id,
      username: user.username,
      rol_id: user.rol_id,
    };

    return true;
  }
}