import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: pg.Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(config: ConfigService) {
    const get = (principal: string, respaldo: string) =>
      config.get<string>(principal) ?? config.get<string>(respaldo);

    this.pool = new pg.Pool({
      host: get('DB_HOST', 'POSTGRES_HOST'),
      port: Number(get('DB_PORT', 'POSTGRES_PORT') ?? '5432'),
      user: get('DB_USER', 'POSTGRES_USER'),
      password: get('DB_PASSWORD', 'POSTGRES_PASSWORD'),
      database: get('DB_NAME', 'POSTGRES_DB'),
    });

    // Evita que un reinicio de Postgres tumbe el backend
    this.pool.on('error', (err) =>
      this.logger.error(`Conexión a la base perdida: ${err.message}`),
    );
  }

  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<pg.QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}