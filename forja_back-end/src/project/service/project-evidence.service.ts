import {
  BadRequestException, ConflictException, ForbiddenException, Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

interface IncomingPdf {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
interface PeriodAccess {
  approval_status: string;
  record_type: string;
  execution_status: string;
  general_status: string;
  teacher_user_id: number | null;
  assigned_teacher: boolean;
}

@Injectable()
export class ProjectEvidenceService {
  private readonly directory: string;
  readonly maxBytes = 20 * 1024 * 1024;

  constructor(
    private readonly db: DatabaseService,
    config: ConfigService,
  ) {
    this.directory = config.get<string>('FORJA_UPLOAD_DIR') ?? '/var/lib/forja/uploads';
  }

  private async checkPeriod(projectId: number, periodId: number, user: PayloadJwt) {
    if (![1,2,3].includes(user.rol_id)) {
      throw new ForbiddenException('No tienes acceso a evidencias de proyectos');
    }
    const { rows } = await this.db.query<PeriodAccess>(
      `SELECT pp.approval_status,pp.record_type,pp.execution_status,p.general_status,
              t.user_id AS teacher_user_id,
              EXISTS(SELECT 1 FROM project_teacher pt
                     JOIN teacher assigned ON assigned.id=pt.teacher_id
                     WHERE pt.project_id=pp.project_id AND assigned.user_id=$3) AS assigned_teacher
       FROM project_periods pp
       JOIN project p ON p.id=pp.project_id
       LEFT JOIN teacher t ON t.id=pp.teacher_id
       WHERE pp.id=$1 AND pp.project_id=$2`,
      [periodId,projectId,user.sub],
    );
    const period=rows[0];
    if(!period ||
       (user.rol_id===2 && period.record_type!=='HISTORICO') ||
       (user.rol_id===3 && period.teacher_user_id!==user.sub &&
        !(period.record_type==='HISTORICO' && period.assigned_teacher))) {
      throw new NotFoundException('Período no encontrado o sin acceso');
    }
    return period;
  }

  private validatePdf(file: IncomingPdf | undefined) {
    if(!file?.buffer?.length || file.size<8 || file.size>this.maxBytes) {
      throw new BadRequestException('Selecciona un PDF de máximo 20 MB');
    }
    const extension=path.extname(file.originalname).toLowerCase();
    const signature=file.buffer.subarray(0,5).toString('ascii');
    if(extension!=='.pdf' || file.mimetype!=='application/pdf' || signature!=='%PDF-') {
      throw new BadRequestException('Solo se aceptan documentos PDF válidos (.pdf)');
    }
  }

  private readableFilename(filename:string) {
    // Algunos clientes multipart transportan nombres UTF-8 interpretados como latin1.
    // Corregir solo secuencias de codificación errónea y conservar el original si
    // la conversión introduce caracteres de reemplazo.
    if (!/[ÃÂâ][\x80-\xff]?/.test(filename)) return filename;
    const decoded=Buffer.from(filename,'latin1').toString('utf8');
    return decoded.includes('\uFFFD')?filename:decoded;
  }

  async list(projectId:number,periodId:number,user:PayloadJwt) {
    await this.checkPeriod(projectId,periodId,user);
    const {rows}=await this.db.query(
      `SELECT d.id,d.original_filename,d.file_size,d.review_status,
              d.uploaded_at,d.review_notes,d.reviewed_at,
              u.full_name AS uploaded_by_name
       FROM project_documents d
       JOIN users u ON u.id=d.uploaded_by
       WHERE d.project_period_id=$1 AND d.document_kind='EVIDENCIA'
       ORDER BY d.uploaded_at DESC,d.id DESC`,
      [periodId],
    );
    return rows.map(row=>({
      ...row,
      original_filename:this.readableFilename(String(row.original_filename)),
    }));
  }

  async upload(projectId:number,periodId:number,user:PayloadJwt,file:IncomingPdf|undefined) {
    const period=await this.checkPeriod(projectId,periodId,user);
    const historical=period.record_type==='HISTORICO';
    if(historical){
      if(user.rol_id!==1 && user.rol_id!==2){
        throw new ForbiddenException('Solo el administrador o monitor digitaliza evidencias históricas');
      }
    }else{
      if(user.rol_id!==3)throw new ForbiddenException('Solo el profesor responsable carga evidencias actuales');
      if(period.general_status!=='ACTIVO' || period.approval_status!=='APROBADO' ||
         period.execution_status==='CERRADO'){
        throw new ConflictException('El período actual debe estar aprobado, activo y sin cerrar');
      }
    }
    this.validatePdf(file);
    if(!file)throw new BadRequestException('Falta el PDF');
    const safeName=path.basename(this.readableFilename(file.originalname)).replace(/[\u0000-\u001f]/g,'').slice(0,255);
    const storageKey=randomUUID()+'.pdf';
    await fs.mkdir(this.directory,{recursive:true,mode:0o700});
    const absolutePath=path.join(this.directory,storageKey);
    await fs.writeFile(absolutePath,file.buffer,{flag:'wx',mode:0o600});
    try {
      const {rows}=await this.db.query(
        `INSERT INTO project_documents
           (project_period_id,document_kind,original_filename,storage_key,mime_type,file_size,uploaded_by)
         VALUES($1,'EVIDENCIA',$2,$3,'application/pdf',$4,$5)
         RETURNING id,original_filename,file_size,review_status,uploaded_at`,
        [periodId,safeName,storageKey,file.size,user.sub],
      );
      return rows[0];
    }catch(error){
      await fs.unlink(absolutePath).catch(()=>undefined);
      throw error;
    }
  }

  private async findEvidence(projectId:number,periodId:number,id:number,user:PayloadJwt) {
    await this.checkPeriod(projectId,periodId,user);
    const {rows}=await this.db.query<{storage_key:string;original_filename:string}>(
      `SELECT storage_key,original_filename
       FROM project_documents
       WHERE id=$1 AND project_period_id=$2 AND document_kind='EVIDENCIA'`,
      [id,periodId],
    );
    if(!rows[0])throw new NotFoundException('Evidencia no encontrada');
    return rows[0];
  }

  async download(projectId:number,periodId:number,id:number,user:PayloadJwt) {
    const record=await this.findEvidence(projectId,periodId,id,user);
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/.test(record.storage_key)){
      throw new NotFoundException('Archivo no disponible');
    }
    try {
      const buffer=await fs.readFile(path.join(this.directory,record.storage_key));
      return {buffer};
    }catch{
      throw new NotFoundException('Archivo no disponible');
    }
  }

  async review(projectId:number,periodId:number,id:number,
    decision:'APROBADA'|'DEVUELTA',notes:string|undefined,user:PayloadJwt) {
    if(user.rol_id!==1)throw new ForbiddenException('Solo el administrador revisa evidencias');
    const period=await this.checkPeriod(projectId,periodId,user);
    if(period.record_type==='HISTORICO') {
      throw new ConflictException('Las evidencias históricas se archivan sin revisión retroactiva');
    }
    await this.findEvidence(projectId,periodId,id,user);
    if(decision==='DEVUELTA' && !notes?.trim()){
      throw new BadRequestException('Escribe una observación para devolver la evidencia');
    }
    const {rows}=await this.db.query(
      `UPDATE project_documents
       SET review_status=$1,reviewed_by=$2,reviewed_at=NOW(),review_notes=$3
       WHERE id=$4 AND project_period_id=$5
         AND document_kind='EVIDENCIA' AND review_status='PENDIENTE'
       RETURNING id,review_status,review_notes,reviewed_at`,
      [decision,user.sub,notes?.trim()||null,id,periodId],
    );
    if(!rows[0]) {
      throw new ConflictException('Esta evidencia ya fue revisada. Para corregirla, sube un nuevo PDF.');
    }
    return rows[0];
  }
}
