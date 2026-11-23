import {
  Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import { CommunityFeedbackService } from '../service/community-feedback.service.js';

class CommunityAnswerDto {
  @IsString() @MaxLength(180)
  respondent_name:string;

  @IsString() @MaxLength(300)
  contact_details:string;

  @IsIn(['SOCIO_COMUNITARIO','ALIADO_INSTITUCIONAL'])
  respondent_type:'SOCIO_COMUNITARIO'|'ALIADO_INSTITUCIONAL';

  @IsString() @MaxLength(500)
  organization_location:string;

  @IsString() @MaxLength(300)
  teacher_or_course:string;

  @IsString() @MaxLength(300)
  project_identification:string;

  @IsString() @MaxLength(3000)
  addressed_problem:string;

  @IsString() @MaxLength(500)
  student_participation:string;

  @IsString() @MaxLength(500)
  community_participation:string;

  @IsString() @MaxLength(5000)
  meetings_activities:string;

  @IsString() @MaxLength(5000)
  achievements_products:string;

  @IsString() @MaxLength(5000)
  impact_benefits:string;

  @IsObject()
  likert:Record<string,number>;

  @IsIn(['salud_bienestar','desarrollo_humano','habitat','cultura_creacion','industria_biotecnologia'])
  action_line:string;

  @IsString() @MaxLength(5000)
  obstacles:string;

  @IsString() @MaxLength(5000)
  continuity_actions:string;

  @IsString() @MaxLength(5000)
  other_projects:string;

  @IsOptional() @IsString() @MaxLength(3000)
  additional_comments?:string;

  @IsBoolean()
  consent_confirmed:boolean;
}
interface AuthenticatedRequest { user:PayloadJwt }

@Controller('community-feedback')
export class CommunityFeedbackController {
  constructor(private readonly feedback:CommunityFeedbackService){}

  // Las rutas con token no requieren cuenta, pero solo aceptan un token
  // aleatorio de 256 bits, cuyo hash se guarda en PostgreSQL.
  @Get('form/:token')
  inspect(@Param('token') token:string){
    return this.feedback.inspect(token);
  }

  @Post('form/:token')
  submit(@Param('token') token:string,@Body() dto:CommunityAnswerDto){
    return this.feedback.submit(token,dto);
  }

  @Get('project/:projectId/periods/:periodId')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(1,2,3)
  summary(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Req() req:AuthenticatedRequest,
  ){
    return this.feedback.getSummary(projectId,periodId,req.user);
  }

  @Post('project/:projectId/periods/:periodId/link')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(1)
  createLink(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Req() req:AuthenticatedRequest,
  ){
    return this.feedback.createLink(projectId,periodId,req.user);
  }
}
