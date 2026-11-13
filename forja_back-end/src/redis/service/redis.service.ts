import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: ReturnType<typeof createClient>;

  constructor(config: ConfigService) {
    this.client = createClient({
      url: config.getOrThrow<string>('REDIS_URL'),
      socket: { connectTimeout: 5000, reconnectStrategy: false },
      disableOfflineQueue: true,
    });
    this.client.on('error', () => this.logger.error('Redis no disponible'));
  }

  async onModuleInit() { await this.client.connect(); }
  onModuleDestroy() { if (this.client.isOpen) this.client.destroy(); }
}
