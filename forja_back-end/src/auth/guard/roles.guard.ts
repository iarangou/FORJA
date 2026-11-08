import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PayloadJwt, RoleId } from '../../shared/types/auth.types.js';
import { ROLES_KEY } from '../decorator/roles.decorator.js';

interface RequestHttp {
  user?: PayloadJwt;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleId[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);


    if (!requiredRoles) return true;

    // 3. Lee el usuario que puso el AuthGuard
    const request = context.switchToHttp().getRequest<RequestHttp>();
    const user = request.user;

    if (!user?.rol_id) {
      throw new ForbiddenException('No tienes rol asignado');
    }

    // 4. ¿Tiene alguno de los roles requeridos?
    const allowed = requiredRoles.includes(user.rol_id);
    if (!allowed) {
      throw new ForbiddenException('No tienes permiso para esta ruta');
    }

    return true;
  }
}
