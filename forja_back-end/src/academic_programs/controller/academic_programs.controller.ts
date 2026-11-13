import { Controller, Get, UseGuards } from '@nestjs/common';
import { AcademicProgramsService } from '../service/academic_programs.service.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';

@Controller('academic-programs/')
export class AcademicProgramsController {
    constructor(
        private readonly ap: AcademicProgramsService
    ) {}

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1, 2, 3)
    getAll() {
        return this.ap.getAll();
    }
}