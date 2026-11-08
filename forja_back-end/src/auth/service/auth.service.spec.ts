import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import type { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

it('firma el rol obtenido de la base de datos al iniciar sesión', async () => {
  const password_hash = await bcrypt.hash('test-password', 4);
  const query = vi.fn()
    .mockResolvedValueOnce({ rows: [{ id: 7, username: 'profesor', password_hash, email: 'test@example.com', rol_id: 3 }] })
    .mockResolvedValueOnce({ rows: [] });
  const jwt = new JwtService({ secret: 'login-test-secret' });
  const service = new AuthService({ query } as unknown as DatabaseService, jwt);
  const result = await service.login({ username: 'profesor', password: 'test-password' });
  const payload = await jwt.verifyAsync<PayloadJwt>(result.access_token);
  expect(payload).toMatchObject({ sub: 7, username: 'profesor', rol_id: 3 });
  expect(payload).not.toHaveProperty('password_hash');
  expect(query.mock.calls[0][0]).toContain('u.rol_id');
});
