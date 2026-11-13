import { SetMetadata } from '@nestjs/common';
import type { RoleId } from '../../shared/types/auth.types.ts';

export const ROLES_KEY = 'roles';

/** Permite cualquiera de los roles indicados; requiere AuthGuard primero. */
export const Roles = (...roles: RoleId[]) => SetMetadata(ROLES_KEY, roles);

