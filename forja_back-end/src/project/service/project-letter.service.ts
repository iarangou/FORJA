import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

interface IncomingPdf { originalname:string; mimetype:string; size:number; buffer:Buffer }
type Letter = {
  id:number; original_filename:string; file_size:number; uploaded_at:string;
  uploaded_by_name:string;
};
interface PeriodStatus {
  id:number; record_type:string; approval_status:string; execution_status:string;
}

/**
 * Una carta de cierre firmada por cada semestre académico (project_periods.id).
 * La carta se firma fuera de FORJA y se guarda como un PDF privado.
 */
@Injectable()
export class ProjectLetterService {
  private readonly directory:string;
  private readonly maxBytes=20*1024*1024;

  constructor(private readonly db:DatabaseService,config:ConfigService){
    this.directory=config.get<string>('FORJA_UPLOAD_DIR')??'/var/lib/forja/uploads';
  }

  private checkPermission(user:PayloadJwt, upload=false){
    if(upload ? ![1,2].includes(user.rol_id) : ![1,2,3].includes(user.rol_id)){
      throw new ForbiddenException('No tienes permisos para esta carta');
    }
  }

  private async canReadPeriod(projectId:number,periodId:number,user:PayloadJwt){
    this.checkPermission(user);
    const {rows}=await this.db.query(
      `SELECT pp.id FROM project_periods pp
       JOIN project p ON p.id=pp.project_id
       WHERE pp.project_id=$1 AND pp.id=$2
         AND ($3::boolean OR p.created_by=$4 OR EXISTS (
            SELECT 1 FROM project_teacher pt JOIN teacher t ON t.id=pt.teacher_id
            WHERE pt.project_id=p.id AND t.user_id=$4
         ))`,
      [projectId,periodId,user.rol_id===1||user.rol_id===2,user.sub],
    );
    if(!rows[0])throw new NotFoundException('Semestre no encontrado o sin acceso');
  }

  async get(projectId:number,periodId:number,user:PayloadJwt):Promise<Letter|null>{
    await this.canReadPeriod(projectId,periodId,user);
    const {rows}=await this.db.query<Letter>(
      `SELECT d.id,d.original_filename,d.file_size,d.uploaded_at,
              u.full_name AS uploaded_by_name
       FROM project_documents d
       JOIN users u ON u.id=d.uploaded_by
       WHERE d.project_period_id=$1 AND d.document_kind='CARTA_FIRMADA'
       ORDER BY d.id DESC LIMIT 1`,[periodId],
    );
    return rows[0]??null;
  }

  async upload(projectId:number,periodId:number,user:PayloadJwt,file:IncomingPdf|undefined){
    this.checkPermission(user,true);
    if(!file?.buffer || file.size<8 || file.size>this.maxBytes ||
       path.extname(file.originalname).toLowerCase()!=='.pdf' ||
       file.mimetype!=='application/pdf' ||
       file.buffer.subarray(0,5).toString('ascii')!=='%PDF-'){
      throw new BadRequestException('Adjunta la carta de cierre firmada en PDF, máximo 20 MB');
    }
    const storageKey=randomUUID()+'.pdf';
    const filename=path.basename(file.originalname).replace(/[\u0000-\u001f]/g,'').slice(0,255);
    let filePath:string|null=null;

    try{
      return await this.db.transaction(async client=>{
        // El bloqueo del período impide dos cartas concurrentes en el mismo semestre.
        const {rows:periods}=await client.query<PeriodStatus>(
          `SELECT id,record_type,approval_status,execution_status
           FROM project_periods WHERE id=$1 AND project_id=$2 FOR UPDATE`,
          [periodId,projectId],
        );
        const period=periods[0];
        if(!period)throw new NotFoundException('Semestre no encontrado');
        if(period.record_type==='ACTUAL' &&
           (period.approval_status!=='APROBADO'||period.execution_status!=='CERRADO')){
          throw new ConflictException('La carta del semestre actual se archiva después de su cierre');
        }
        // Los semestres históricos ya ocurrieron; no necesitan cierre retroactivo.
        const existing=await client.query(
          `SELECT 1 FROM project_documents
           WHERE project_period_id=$1 AND document_kind='CARTA_FIRMADA' LIMIT 1`,
          [periodId],
        );
        if(existing.rows.length){
          throw new ConflictException('Este semestre ya tiene una carta final firmada');
        }
        await fs.mkdir(this.directory,{recursive:true,mode:0o700});
        filePath=path.join(this.directory,storageKey);
        await fs.writeFile(filePath,file.buffer,{flag:'wx',mode:0o600});
        const {rows}=await client.query(
          `INSERT INTO project_documents
           (project_period_id,document_kind,original_filename,storage_key,mime_type,file_size,uploaded_by)
           VALUES($1,'CARTA_FIRMADA',$2,$3,'application/pdf',$4,$5)
           RETURNING id,original_filename,file_size,uploaded_at`,
          [periodId,filename,storageKey,file.size,user.sub],
        );
        return rows[0];
      });
    }catch(error){
      if(filePath)await fs.unlink(filePath).catch(()=>undefined);
      throw error;
    }
  }

  async download(projectId:number,periodId:number,letterId:number,user:PayloadJwt){
    await this.canReadPeriod(projectId,periodId,user);
    const {rows}=await this.db.query<{storage_key:string}>(
      `SELECT storage_key FROM project_documents
       WHERE project_period_id=$1 AND id=$2 AND document_kind='CARTA_FIRMADA'`,
      [periodId,letterId],
    );
    const key=rows[0]?.storage_key;
    if(!key || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/.test(key)){
      throw new NotFoundException('Carta del semestre no encontrada');
    }
    try{return await fs.readFile(path.join(this.directory,key));}
    catch{throw new NotFoundException('Archivo no disponible');}
  }
}
