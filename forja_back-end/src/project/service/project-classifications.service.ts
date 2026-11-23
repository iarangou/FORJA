import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

export type ClassificationKind='zones'|'commitments';

@Injectable()
export class ProjectClassificationsService {
  constructor(private readonly db:DatabaseService){}

  private source(kind:ClassificationKind) {
    return kind==='zones'?'forja_territories':'forja_sustainability_commitments';
  }
  private junction(kind:ClassificationKind) {
    return kind==='zones'
      ?{table:'project_territories',column:'territory_id'}
      :{table:'project_sustainability_commitments',column:'commitment_id'};
  }

  async list(kind:ClassificationKind){
    const {rows}=await this.db.query<{id:number;name:string}>(
      `SELECT id,name FROM ${this.source(kind)} ORDER BY id`,
    );
    return rows;
  }

  async create(kind:ClassificationKind,name:string,user:PayloadJwt){
    if(user.rol_id!==1)throw new ForbiddenException('Solo el administrador configura los catálogos');
    if(typeof name!=='string'||!name.trim()||name.trim().length>180){
      throw new BadRequestException('Escribe un nombre válido');
    }
    if(kind==='zones'&&name.trim().length>160)throw new BadRequestException('La zona no puede superar 160 caracteres');
    const {rows}=await this.db.query(
      `INSERT INTO ${this.source(kind)}(name) VALUES($1)
       ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id,name`,
      [name.trim()],
    );
    return rows[0];
  }

  private async checkEditableProject(projectId:number,user:PayloadJwt){
    const {rows}=await this.db.query<{registration_type:string;general_status:string}>(
      `SELECT p.registration_type,p.general_status FROM project p WHERE p.id=$1
       AND ($2::boolean OR p.created_by=$3 OR EXISTS(
         SELECT 1 FROM project_teacher pt JOIN teacher t ON t.id=pt.teacher_id
         WHERE pt.project_id=p.id AND t.user_id=$3))`,
      [projectId,user.rol_id===1||user.rol_id===2,user.sub],
    );
    if(!rows[0])throw new NotFoundException('Proyecto no encontrado o sin permisos');
    if(user.rol_id===2&&rows[0].registration_type!=='HISTORICO')
      throw new ForbiddenException('El monitor solo modifica proyectos históricos');
  }

  async getSelected(projectId:number,kind:ClassificationKind,user:PayloadJwt){
    await this.checkEditableProject(projectId,user);
    const j=this.junction(kind);
    const {rows}=await this.db.query<{id:number}>(
      `SELECT ${j.column} AS id FROM ${j.table} WHERE project_id=$1 ORDER BY ${j.column}`,
      [projectId],
    );
    return rows.map(r=>r.id);
  }

  async replace(projectId:number,kind:ClassificationKind,ids:number[],user:PayloadJwt){
    if(![1,2,3].includes(user.rol_id))throw new ForbiddenException('No tienes acceso');
    if(!Array.isArray(ids)||ids.length>25||ids.some(id=>!Number.isInteger(id)||id<1)
       ||new Set(ids).size!==ids.length){
      throw new BadRequestException('La selección contiene identificadores inválidos');
    }
    const j=this.junction(kind);
    return this.db.transaction(async client=>{
      const {rows:projects}=await client.query<{registration_type:string;general_status:string}>(
        `SELECT p.registration_type,p.general_status FROM project p WHERE p.id=$1
         AND ($2::boolean OR p.created_by=$3 OR EXISTS(
           SELECT 1 FROM project_teacher pt JOIN teacher t ON t.id=pt.teacher_id
           WHERE pt.project_id=p.id AND t.user_id=$3)) FOR UPDATE OF p`,
        [projectId,user.rol_id===1||user.rol_id===2,user.sub],
      );
      const project=projects[0];
      if(!project)throw new NotFoundException('Proyecto no encontrado o sin permisos');
      if(user.rol_id===2&&project.registration_type!=='HISTORICO'){
        throw new ForbiddenException('El monitor solo modifica proyectos históricos');
      }
      if(project.general_status!=='ACTIVO')throw new BadRequestException('El proyecto está finalizado');
      const {rows:locks}=await client.query(
        `SELECT 1 FROM project_periods WHERE project_id=$1
           AND record_type='ACTUAL' AND approval_status IN ('EN_REVISION','APROBADO') LIMIT 1`,
        [projectId],
      );
      if(locks.length)throw new BadRequestException('Los datos generales están bloqueados durante la revisión o aprobación');
      if(ids.length){
        const {rows:found}=await client.query(
          `SELECT id FROM ${this.source(kind)} WHERE id=ANY($1::smallint[])`,[ids],
        );
        if(found.length!==ids.length)throw new BadRequestException('Seleccionaste elementos que no existen en el catálogo');
      }
      await client.query(`DELETE FROM ${j.table} WHERE project_id=$1`,[projectId]);
      if(ids.length){
        await client.query(
          `INSERT INTO ${j.table}(project_id,${j.column})
           SELECT $1,UNNEST($2::smallint[])`,[projectId,ids],
        );
      }
      return {ids};
    });
  }
}
