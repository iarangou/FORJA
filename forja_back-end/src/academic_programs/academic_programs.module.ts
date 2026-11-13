import { Module } from '@nestjs/common';
import { AcademicProgramsController } from './controller/academic_programs.controller.js';
import { AcademicProgramsService } from './service/academic_programs.service.js';

@Module({
    imports: [],
    controllers: [AcademicProgramsController],
    providers: [AcademicProgramsService],
    exports: [AcademicProgramsService]
})
export class AcademicProgramsModule {}