import {
  Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import { CommunityFeedbackService } from '../service/community-feedback.service.js';

class CommunityAnswerDto {
  @IsOptional() @IsString() @MaxLength(200)
  organization_name?:string;

  @IsOptional() @IsString() @MaxLength(300)
  relationship_to_project?:string;

  @IsInt() @Min(1) @Max(5)
  objectives_rating:number;

  @IsInt() @Min(1) @Max(5)
  usefulness_rating:number;

  @IsInt() @Min(1) @Max(5)
  participation_rating:number;

  @IsOptional() @IsString() @MaxLength(3000)
  comments?:string;

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
