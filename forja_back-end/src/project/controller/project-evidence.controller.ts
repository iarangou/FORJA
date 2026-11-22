import {
  BadRequestException, Body, Controller, Get, Param, ParseIntPipe,
  Post, Req, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Response } from 'express';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { ProjectEvidenceService } from '../service/project-evidence.service.js';

class ReviewEvidenceDto {
  @IsIn(['APROBADA','DEVUELTA'])
  decision: 'APROBADA' | 'DEVUELTA';

  @IsOptional() @IsString() @MaxLength(3000)
  notes?: string;
}

interface AuthenticatedRequest { user:PayloadJwt }
interface UploadedPdf { originalname:string; mimetype:string; size:number; buffer:Buffer }

@Controller('project/:projectId/periods/:periodId/evidences')
@UseGuards(AuthGuard,RolesGuard)
export class ProjectEvidenceController {
  constructor(private readonly evidence:ProjectEvidenceService){}

  @Get()
  @Roles(1,2,3)
  list(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Req() request:AuthenticatedRequest,
  ){
    return this.evidence.list(projectId,periodId,request.user);
  }

  @Post()
  @Roles(1,2,3)
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:20*1024*1024,files:1}}))
  upload(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @UploadedFile() file:UploadedPdf|undefined,
    @Req() request:AuthenticatedRequest,
  ){
    if(!file) throw new BadRequestException('Debes elegir un archivo PDF');
    return this.evidence.upload(projectId,periodId,request.user,file);
  }

  @Get(':evidenceId/download')
  @Roles(1,2,3)
  async download(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Param('evidenceId',ParseIntPipe) evidenceId:number,
    @Req() request:AuthenticatedRequest,
    @Res() response:Response,
  ){
    const {buffer}=await this.evidence.download(projectId,periodId,evidenceId,request.user);
    response.setHeader('Content-Type','application/pdf');
    response.setHeader('Content-Disposition',`attachment; filename="forja-evidencia-${evidenceId}.pdf"`);
    response.setHeader('X-Content-Type-Options','nosniff');
    response.setHeader('Cache-Control','private, no-store');
    response.setHeader('Content-Security-Policy',"sandbox");
    return response.send(buffer);
  }

  @Post(':evidenceId/review')
  @Roles(1)
  review(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('periodId',ParseIntPipe) periodId:number,
    @Param('evidenceId',ParseIntPipe) evidenceId:number,
    @Body() dto:ReviewEvidenceDto,
    @Req() request:AuthenticatedRequest,
  ){
    return this.evidence.review(projectId,periodId,evidenceId,dto.decision,dto.notes,request.user);
  }
}
