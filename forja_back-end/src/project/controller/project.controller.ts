import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from '../service/project.service.js';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { CreateProjectDTO, UpdateProjectDTO } from '../dto/project.dto.js';
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

  @Get('report-periods')
  @Roles(1)
  getReportPeriods(@Req() request:AuthenticatedRequest){
    return this.projectService.getReportPeriods(request.user);
  }

  @Get(':id')
  @Roles(1, 2, 3)
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectService.getById(id, request.user);
  }

  @Post(':id/responsible-teacher')
  @Roles(1)
  assignResponsibleTeacher(
    @Param('id',ParseIntPipe) id:number,
    @Body() dto:{user_id:number},
    @Req() request:AuthenticatedRequest,
  ){
    if(!Number.isInteger(dto.user_id)||dto.user_id<1){
      throw new BadRequestException('Selecciona un docente válido');
    }
    return this.projectService.assignResponsibleTeacher(id,dto.user_id,request.user);
  }

  @Patch(':id')
  @Roles(1, 2, 3)
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDTO,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectService.updateProject(id, dto, request.user);
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
