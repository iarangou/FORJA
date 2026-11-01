
import { NestFactory } from '@nestjs/core';
import { AppModule } from "./app.module.js";
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const port = Number(config.get<string>('BACKEND_PORT', '3001'));

  const origins = config.get<string>('CORS_ORIGINS','').split(',').map((origin) => origin.trim()).filter(Boolean);


  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
}

bootstrap();
