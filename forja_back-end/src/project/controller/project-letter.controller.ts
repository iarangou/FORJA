import { BadRequestException, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { ProjectLetterService } from '../service/project-letter.service.js';

interface AuthenticatedRequest {user:PayloadJwt}
interface UploadedPdf {originalname:string;mimetype:string;size:number;buffer:Buffer}

@Controller('project/:projectId/final-letter')
@UseGuards(AuthGuard,RolesGuard)
export class ProjectLetterController {
  constructor(private readonly letters:ProjectLetterService){}

  @Get()
  @Roles(1,2,3)
  get(@Param('projectId',ParseIntPipe) projectId:number,
      @Req() req:AuthenticatedRequest){
    return this.letters.get(projectId,req.user);
  }

  @Post()
  @Roles(1,2)
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:20*1024*1024,files:1}}))
  upload(@Param('projectId',ParseIntPipe) projectId:number,
         @UploadedFile() file:UploadedPdf|undefined,
         @Req() req:AuthenticatedRequest){
    if(!file)throw new BadRequestException('Adjunta la carta final PDF firmada');
    return this.letters.upload(projectId,req.user,file);
  }

  @Get(':letterId/download')
  @Roles(1,2,3)
  async download(@Param('projectId',ParseIntPipe) projectId:number,
      @Param('letterId',ParseIntPipe) letterId:number,
      @Req() req:AuthenticatedRequest,@Res() res:Response){
    const buffer=await this.letters.download(projectId,letterId,req.user);
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename="forja-carta-firmada-${projectId}.pdf"`);
    res.setHeader('Cache-Control','private, no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy','sandbox');
    return res.send(buffer);
  }
}
