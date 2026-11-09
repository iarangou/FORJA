import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';

import { CourseModule } from './course/course.module.js';
import { FacultyModule } from './faculty/faculty.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TestModule,
    DatabaseModule,
    AuthModule,
    CourseModule,
    FacultyModule
  ],
})
export class AppModule {}
