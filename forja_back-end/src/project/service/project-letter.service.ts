import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

interface IncomingPdf { originalname:string; mimetype:string;size:number;buffer:Buffer }
type Letter = {id:number;original_filename:string;file_size:number;uploaded_at:string;uploaded_by_name:string};

/**
 * Carta comunitaria final: una sola versión firmada por proyecto. El documento
 * está asociado a uno de sus períodos para reutilizar project_documents, pero
 * todas las consultas son por proyecto (no por semestre).
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
  private async canReadProject(projectId:number,user:PayloadJwt){
    this.checkPermission(user);
    const {rows}=await this.db.query(
      `SELECT p.id FROM project p WHERE p.id=$1 AND
       ($2::boolean OR p.created_by=$3 OR EXISTS(
          SELECT 1 FROM project_teacher pt
          JOIN teacher t ON t.id=pt.teacher_id
          WHERE pt.project_id=p.id AND t.user_id=$3
       ))`,
      [projectId,user.rol_id===1||user.rol_id===2,user.sub],
    );
    if(!rows[0])throw new NotFoundException('Proyecto no encontrado o sin acceso');
  }
  async get(projectId:number,user:PayloadJwt):Promise<Letter|null>{
    await this.canReadProject(projectId,user);
    const {rows}=await this.db.query<Letter>(
      `SELECT d.id,d.original_filename,d.file_size,d.uploaded_at,
              u.full_name AS uploaded_by_name
       FROM project_documents d
       JOIN project_periods pp ON pp.id=d.project_period_id
       JOIN users u ON u.id=d.uploaded_by
       WHERE pp.project_id=$1 AND d.document_kind='CARTA_FIRMADA'
       ORDER BY d.id DESC LIMIT 1`,[projectId],
    );
    return rows[0]??null;
  }
  async upload(projectId:number,user:PayloadJwt,file:IncomingPdf|undefined){
    this.checkPermission(user,true);
    if(!file?.buffer || file.size<8 || file.size>this.maxBytes ||
       path.extname(file.originalname).toLowerCase()!=='.pdf' ||
       file.mimetype!=='application/pdf' ||
       file.buffer.subarray(0,5).toString('ascii')!=='%PDF-'){
      throw new BadRequestException('Adjunta únicamente la carta final firmada en PDF, máximo 20 MB');
    }
    const storageKey=randomUUID()+'.pdf';
    const filename=path.basename(file.originalname).replace(/[\u0000-\u001f]/g,'').slice(0,255);
    let filePath:string|null=null;
    try {
      return await this.db.transaction(async client=>{
        const {rows:projects}=await client.query<{id:number;registration_type:string}>(
          'SELECT id,registration_type FROM project WHERE id=$1 FOR UPDATE',[projectId],
        );
        if(!projects[0])throw new NotFoundException('Proyecto no encontrado');
        const {rows:periods}=await client.query<{id:number;record_type:string;approval_status:string;execution_status:string}>(
          `SELECT id,record_type,approval_status,execution_status FROM project_periods
           WHERE project_id=$1 ORDER BY academic_year DESC,academic_semester DESC,id DESC`,[projectId],
        );
        if(!periods.length){
          throw new ConflictException('Registra al menos un período antes de guardar la carta');
        }
        if(periods.some(p=>p.record_type==='ACTUAL' &&
            (p.approval_status!=='APROBADO'||p.execution_status!=='CERRADO'))){
          throw new ConflictException('Los períodos actuales deben estar cerrados antes de adjuntar la carta final');
        }
        const existing=await client.query(
          `SELECT d.id FROM project_documents d JOIN project_periods pp ON pp.id=d.project_period_id
           WHERE pp.project_id=$1 AND d.document_kind='CARTA_FIRMADA' LIMIT 1`,[projectId],
        );
        if(existing.rows.length){
          throw new ConflictException('Ya hay una carta final firmada para este proyecto; no se admiten duplicados');
        }
        await fs.mkdir(this.directory,{recursive:true,mode:0o700});
        filePath=path.join(this.directory,storageKey);
        await fs.writeFile(filePath,file.buffer,{flag:'wx',mode:0o600});
        const {rows}=await client.query(
          `INSERT INTO project_documents
           (project_period_id,document_kind,original_filename,storage_key,mime_type,file_size,uploaded_by)
           VALUES($1,'CARTA_FIRMADA',$2,$3,'application/pdf',$4,$5)
           RETURNING id,original_filename,file_size,uploaded_at`,
          [periods[0].id,filename,storageKey,file.size,user.sub],
        );
        return rows[0];
      });
    }catch(e){
      if(filePath)await fs.unlink(filePath).catch(()=>undefined);
      throw e;
    }
  }
  async download(projectId:number,letterId:number,user:PayloadJwt){
    await this.canReadProject(projectId,user);
    const {rows}=await this.db.query<{storage_key:string}>(
      `SELECT d.storage_key FROM project_documents d
       JOIN project_periods pp ON pp.id=d.project_period_id
       WHERE pp.project_id=$1 AND d.id=$2 AND d.document_kind='CARTA_FIRMADA'`,
      [projectId,letterId],
    );
    const key=rows[0]?.storage_key;
    if(!key || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/.test(key)){
      throw new NotFoundException('Carta final no encontrada');
    }
    try {return await fs.readFile(path.join(this.directory,key));}
    catch {throw new NotFoundException('Archivo no disponible');}
  }
}
