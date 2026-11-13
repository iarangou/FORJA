import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';

import { CourseModule } from './course/course.module.js';
import { FacultyModule } from './faculty/faculty.module.js';
import { RedisModule } from './redis/redis.module.js';
import { MailModule } from './mail/mail.module.js';
import { UsersModule } from './users/users.module.js';
import { AcademicProgramsModule } from './academic_programs/academic_programs.module.js';
import { ProjectModule } from './project/project.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TestModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    CourseModule,
    FacultyModule,
    AcademicProgramsModule,
    RedisModule,
    MailModule,
    ProjectModule
  ],
})
export class AppModule {}
