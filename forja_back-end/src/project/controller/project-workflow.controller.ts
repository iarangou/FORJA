import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards,
} from '@nestjs/common';
import { ProjectWorkflowService } from '../service/project-workflow.service.js';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { CreatePeriodDto, UpdatePeriodDto, ReviewPeriodDto, SavePeriodResultsDto } from '../dto/period.dto.js';
import { SaveEthicsDto } from '../dto/ethics.dto.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

interface AuthenticatedRequest { user: PayloadJwt }

@Controller('project')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectWorkflowController {
  constructor(private readonly workflow: ProjectWorkflowService) {}

  @Get(':projectId/periods')
  @Roles(1, 2, 3)
  getPeriods(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.getPeriods(projectId,request.user);
  }

  @Post(':projectId/periods')
  @Roles(1, 2, 3)
  createPeriod(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreatePeriodDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.createPeriod(projectId,dto,request.user);
  }

  @Patch(':projectId/periods/:periodId')
  @Roles(1, 3)
  updatePeriod(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('periodId', ParseIntPipe) periodId: number,
    @Body() dto: UpdatePeriodDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.updatePeriod(projectId, periodId, dto, request.user);
  }

  @Put(':projectId/periods/:periodId/results')
  @Roles(3)
  saveResults(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Body() dto:SavePeriodResultsDto,
    @Req() request:AuthenticatedRequest,
  ){
    return this.workflow.saveResults(projectId,periodId,dto,request.user);
  }

  @Post(':projectId/periods/:periodId/close')
  @Roles(1)
  closePeriod(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Req() request:AuthenticatedRequest,
  ){
    return this.workflow.closePeriod(projectId,periodId,request.user);
  }

  @Post(':projectId/finalize')
  @Roles(1)
  finalizeProject(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Req() request:AuthenticatedRequest,
  ){
    return this.workflow.finalizeProject(projectId,request.user);
  }

  @Get(':projectId/periods/:periodId/reviews')
  @Roles(1, 2, 3)
  getReviews(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('periodId', ParseIntPipe) periodId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.getReviews(projectId, periodId, request.user);
  }

  @Get(':projectId/ethics')
  @Roles(1, 2, 3)
  getEthics(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.getEthics(projectId,request.user);
  }

  @Put(':projectId/ethics')
  @Roles(1, 3)
  saveEthics(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: SaveEthicsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.saveEthics(projectId,dto,request.user);
  }

  @Post(':projectId/periods/:periodId/submit')
  @Roles(3)
  submitPeriod(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('periodId', ParseIntPipe) periodId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.submitPeriod(projectId,periodId,request.user);
  }

  @Post(':projectId/periods/:periodId/review')
  @Roles(1)
  reviewPeriod(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('periodId', ParseIntPipe) periodId: number,
    @Body() dto: ReviewPeriodDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workflow.reviewPeriod(projectId,periodId,dto,request.user);
  }
}
