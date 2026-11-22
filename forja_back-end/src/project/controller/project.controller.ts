import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from '../service/project.service.js';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { CreateProjectDTO } from '../dto/project.dto.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

interface AuthenticatedRequest { user: PayloadJwt }

@Controller('project')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Roles(1, 2, 3)
  getAll(@Req() request: AuthenticatedRequest) {
    return this.projectService.getAll(request.user);
  }

  @Get(':id')
  @Roles(1, 2, 3)
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectService.getById(id, request.user);
  }

  @Post()
  @Roles(1, 2, 3)
  createProject(
    @Body() dto: CreateProjectDTO,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectService.createProject(dto, request.user);
  }
}
