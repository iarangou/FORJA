import { BadRequestException, HttpException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, randomUUID } from 'node:crypto';
import { RedisService } from '../../redis/service/redis.service.js';
import { MailService } from '../../mail/service/mail.service.js';

export interface PendingRegistration {
  email: string;
  username: string;
  full_name: string;
  password_hash: string;
}

interface StoredRegistration extends PendingRegistration {
  id: string;
  hash: string;
  attempts: number;
}

// Comprueba que el registro no cambió entre GET y EVAL y cuenta errores atómicamente.
export const VERIFY_CODE_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
    if not raw then 
        return false 
    end
local record = cjson.decode(raw)

if record.id ~= ARGV[1] or record.attempts >= 5 then 
    return false 
end

if record.hash == ARGV[2] then 
    return raw 
end

record.attempts = record.attempts + 1
redis.call('SET', KEYS[1], cjson.encode(record), 'KEEPTTL')
return false
`;

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly secret: string;

  constructor(private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {
    this.secret = config.getOrThrow<string>('EMAIL_VERIFICATION_SECRET');
    if (this.secret.length < 32) throw new Error('EMAIL_VERIFICATION_SECRET debe tener al menos 32 caracteres');
  }

  private key(email: string) {
    const digest = createHmac('sha256', this.secret).update(email.trim().toLowerCase()).digest('hex');
    return `forja:pending-registration:${digest}`;
  }

  private hash(id: string, code: string) {
    return createHmac('sha256', this.secret).update(`${id}:${code}`).digest('hex');
  }

  async generate(data: PendingRegistration, expectedId?: string): Promise<void> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const id = randomUUID();
    const record: StoredRegistration = {
      id, email: data.email.trim().toLowerCase(), username: data.username,
      full_name: data.full_name, password_hash: data.password_hash,
      hash: this.hash(id, code), attempts: 0,
    };

    const key = this.key(record.email);
    const saved = Number(await this.redis.client.eval(`
      if ARGV[2] ~= '' then
        local raw = redis.call('GET', KEYS[1])
        if not raw or cjson.decode(raw).id ~= ARGV[2] then return -1 end
      end
      if redis.call('EXISTS', KEYS[2]) == 1 then 
        return 0 
      end
      
      redis.call('SET', KEYS[1], ARGV[1], 'EX', 600)
      redis.call('SET', KEYS[2], '1', 'EX', 60)
      
      return 1
    `, {
      keys: [key, `${key}:cooldown`],
      arguments: [JSON.stringify(record), expectedId ?? ''],
    }));

    if (saved === -1) {
      throw new BadRequestException('Registro vencido o reemplazado. Inicia el registro nuevamente');
    }

    if (saved === 0) {
      throw new HttpException('Espera 60 segundos antes de solicitar otro código', 429);
    }

    try {
      await this.mail.sendVerificationCode(record.email, code);
    } catch {
      try {
        await this.redis.client.eval(`
      local raw = redis.call('GET', KEYS[1])

      if raw and cjson.decode(raw).id == ARGV[1] then
        return redis.call('DEL', KEYS[1], KEYS[2])
      end

      return 0
    `, {
          keys: [key, `${key}:cooldown`],
          arguments: [id],
        });
      } catch {
        this.logger.error('No se pudo limpiar el registro pendiente');
      }

      this.logger.error('No se pudo enviar el correo de verificación');

      throw new ServiceUnavailableException(
        'No se pudo enviar el código. Intenta nuevamente',
      );
    }
  }

  async resend(email: string): Promise<void> {
    const raw = await this.redis.client.get(this.key(email));
    if (!raw) throw new BadRequestException('Registro vencido o inexistente. Inicia el registro nuevamente');
    const pending = JSON.parse(raw) as StoredRegistration;
    await this.generate(pending, pending.id);
  }

  async verify(email: string, code: string): Promise<StoredRegistration> {
    const key = this.key(email);
    const raw = await this.redis.client.get(key);
    if (!raw) throw new BadRequestException('Código inválido, vencido o sin intentos disponibles');
    const pending = JSON.parse(raw) as StoredRegistration;
    const valid = await this.redis.client.eval(VERIFY_CODE_SCRIPT, {
      keys: [key], arguments: [pending.id, this.hash(pending.id, code)],
    });
    if (typeof valid !== 'string') throw new BadRequestException('Código inválido, vencido o sin intentos disponibles');
    return JSON.parse(valid) as StoredRegistration;
  }

  async consume(email: string, id: string): Promise<void> {
    // Solo borrar la solicitud que se insertó; conservar un reemplazo concurrente.
    await this.redis.client.eval(`
      local raw = redis.call('GET', KEYS[1])
      if raw and cjson.decode(raw).id == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      end
      return 0
    `, { keys: [this.key(email)], arguments: [id] });
  }
}
