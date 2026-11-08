import 'reflect-metadata';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '../decorator/roles.decorator.js';
import { RolesGuard } from './roles.guard.js';
import { AuthGuard } from './auth.guard.js';
import type { PayloadJwt, RoleId } from '../../shared/types/auth.types.js';

@Roles(1)
class ProtectedController {
  admin(this: void) {}
  @Roles(3, 2)
  review(this: void) {}
}
class PublicController { index(this: void) {} }
const jwt = new JwtService({ secret: 'unit-test-secret' });
function context(controller: typeof ProtectedController | typeof PublicController, handler: () => void, authorization?: string) {
  const request: { headers: { authorization?: string }; user?: PayloadJwt } = { headers: { authorization } };
  const ctx = {
    getClass: () => controller,
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { request, ctx };
}
const auth = new AuthGuard(jwt);
const roles = new RolesGuard(new Reflector());

describe('autenticación y roles', () => {
  it('permite admin desde un JWT firmado', async () => {
    const token = await jwt.signAsync({ sub: 1, username: 'admin', rol_id: 1 }, { expiresIn: 60 });
    const { ctx, request } = context(ProtectedController, ProtectedController.prototype.admin, `Bearer ${token}`);
    await expect(auth.canActivate(ctx)).resolves.toBe(true);
    expect(request.user?.rol_id).toBe(1);
    expect(roles.canActivate(ctx)).toBe(true);
  });
  it.each<RoleId>([3, 2])('rechaza %s en una ruta admin', async (rol_id) => {
    const token = await jwt.signAsync({ sub: 2, username: 'user', rol_id });
    const { ctx } = context(ProtectedController, ProtectedController.prototype.admin, `Bearer ${token}`);
    await auth.canActivate(ctx);
    expect(() => roles.canActivate(ctx)).toThrow(ForbiddenException);
  });
  it.each<RoleId>([3, 2])('permite %s cuando el método sobrescribe los roles del controlador', (rol_id) => {
    const { ctx, request } = context(ProtectedController, ProtectedController.prototype.review);
    request.user = { sub: 2, username: 'user', rol_id };
    expect(roles.canActivate(ctx)).toBe(true);
  });
  it('rechaza tokens antiguos sin rol en rutas restringidas', async () => {
    const token = await jwt.signAsync({ sub: 1, username: 'admin' });
    const { ctx } = context(ProtectedController, ProtectedController.prototype.admin, `Bearer ${token}`);
    await auth.canActivate(ctx);
    expect(() => roles.canActivate(ctx)).toThrow(ForbiddenException);
  });
  it('permite rutas sin metadatos de roles', () => {
    const { ctx } = context(PublicController, PublicController.prototype.index);
    expect(roles.canActivate(ctx)).toBe(true);
  });
  it.each(['missing', 'expired', 'forged'])('rechaza token %s antes de comprobar el rol', async (kind) => {
    const payload = { sub: 1, username: 'admin', rol_id: 1 };
    const token = kind === 'forged'
      ? await new JwtService({ secret: 'another-secret' }).signAsync(payload)
      : await jwt.signAsync(payload, { expiresIn: -1 });
    const { ctx } = context(ProtectedController, ProtectedController.prototype.admin, kind === 'missing' ? undefined : `Bearer ${token}`);
    await expect(auth.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
