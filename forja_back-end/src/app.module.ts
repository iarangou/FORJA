import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller.js';
import { AppService } from './app/app.service.js';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TestModule,
  ],
})
export class AppModule {}
