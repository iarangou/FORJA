import {
  BadRequestException, Body, Controller, Get, Param, ParseIntPipe,
  Post, Put, Req, UseGuards,
} from '@nestjs/common';
import { ArrayMaxSize, IsArray, IsInt, IsString, MaxLength, Min } from 'class-validator';
import { AuthGuard } from '../../auth/guard/auth.guard.js';
import { RolesGuard } from '../../auth/guard/roles.guard.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import {
  ProjectClassificationsService, type ClassificationKind,
} from '../service/project-classifications.service.js';

class SelectionDto {
  @IsArray() @ArrayMaxSize(25) @IsInt({each:true}) @Min(1,{each:true})
  ids:number[];
}
class NameDto {
  @IsString() @MaxLength(180)
  name:string;
}
interface Authed {user:PayloadJwt}

@Controller('project-classifications')
@UseGuards(AuthGuard,RolesGuard)
export class ProjectClassificationsController {
  constructor(private readonly svc:ProjectClassificationsService){}

  private kind(input:string):ClassificationKind{
    if(input!=='zones'&&input!=='commitments')
      throw new BadRequestException('Catálogo desconocido');
    return input;
  }

  @Get(':kind')
  @Roles(1,2,3)
  list(@Param('kind') kind:string){return this.svc.list(this.kind(kind));}

  @Post(':kind')
  @Roles(1)
  create(@Param('kind') kind:string,@Body() dto:NameDto,@Req() req:Authed){
    return this.svc.create(this.kind(kind),dto.name,req.user);
  }

  @Get('project/:projectId/:kind')
  @Roles(1,2,3)
  selected(
    @Param('projectId',ParseIntPipe) projectId:number,
    @Param('kind') kind:string,@Req() req:Authed,
  ){return this.svc.getSelected(projectId,this.kind(kind),req.user);}

  @Put('project/:projectId/:kind')
  @Roles(1,2,3)
  save(@Param('projectId',ParseIntPipe) projectId:number,
    @Param('kind') kind:string,@Body() dto:SelectionDto,@Req() req:Authed,
  ){return this.svc.replace(projectId,this.kind(kind),dto.ids,req.user);}
}
