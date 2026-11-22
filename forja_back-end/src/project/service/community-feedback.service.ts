import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

export interface CommunityAnswer {
  organization_name?:string;
  relationship_to_project?:string;
  objectives_rating:number;
  usefulness_rating:number;
  participation_rating:number;
  comments?:string;
  consent_confirmed:boolean;
}
const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');

@Injectable()
export class CommunityFeedbackService {
  constructor(private readonly db:DatabaseService){}

  private async checkProject(projectId:number,user:PayloadJwt){
    if(![1,2,3].includes(user.rol_id))throw new ForbiddenException('Acceso no permitido');
    const {rows}=await this.db.query(
      `SELECT p.id,p.code,p.title,p.general_status FROM project p
       WHERE p.id=$1 AND ($2::boolean OR p.created_by=$3 OR EXISTS(
         SELECT 1 FROM project_teacher pt JOIN teacher t ON t.id=pt.teacher_id
         WHERE pt.project_id=p.id AND t.user_id=$3
       ))`,
      [projectId,user.rol_id===1||user.rol_id===2,user.sub],
    );
    if(!rows[0])throw new NotFoundException('Proyecto no encontrado o sin permisos');
    return rows[0];
  }

  async getSummary(projectId:number,user:PayloadJwt){
    await this.checkProject(projectId,user);
    const [feedback,link]=await Promise.all([
      this.db.query(`SELECT id,organization_name,relationship_to_project,ratings,
        comments,consent_confirmed,submitted_at FROM community_feedback
        WHERE project_id=$1`,[projectId]),
      this.db.query(`SELECT created_at,expires_at,used_at FROM community_feedback_links
        WHERE project_id=$1`,[projectId]),
    ]);
    return {feedback:feedback.rows[0]??null,link:link.rows[0]??null};
  }

  async createLink(projectId:number,user:PayloadJwt){
    if(user.rol_id!==1)throw new ForbiddenException('Solo el administrador genera enlaces comunitarios');
    return this.db.transaction(async client=>{
      const {rows}=await client.query<{id:number;general_status:string}>(
        'SELECT id,general_status FROM project WHERE id=$1 FOR UPDATE',[projectId],
      );
      if(!rows[0])throw new NotFoundException('Proyecto no encontrado');
      const prior=await client.query('SELECT 1 FROM community_feedback WHERE project_id=$1',[projectId]);
      if(prior.rows.length)throw new ConflictException('La comunidad ya respondió este proyecto');
      const token=randomBytes(32).toString('hex');
      const hash=hashToken(token);
      const expiry=new Date(Date.now()+14*24*60*60*1000);
      await client.query(
        `INSERT INTO community_feedback_links(project_id,token_hash,created_by,expires_at)
         VALUES($1,$2,$3,$4)
         ON CONFLICT(project_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,
           created_by=EXCLUDED.created_by,expires_at=EXCLUDED.expires_at,used_at=NULL,
           created_at=NOW()`,
        [projectId,hash,user.sub,expiry],
      );
      return {token,expires_at:expiry.toISOString()};
    });
  }

  async inspect(token:string){
    if(!/^[0-9a-f]{64}$/.test(token))throw new NotFoundException('Enlace inválido');
    const {rows}=await this.db.query<{
      project_id:number;title:string;code:string;expires_at:string;used_at:string|null;
      answered:boolean;
    }>(
      `SELECT l.project_id,p.title,p.code,l.expires_at,l.used_at,
       EXISTS(SELECT 1 FROM community_feedback f WHERE f.project_id=l.project_id) AS answered
       FROM community_feedback_links l JOIN project p ON p.id=l.project_id
       WHERE l.token_hash=$1`,[hashToken(token)],
    );
    const link=rows[0];
    if(!link)throw new NotFoundException('Enlace inválido');
    if(link.used_at||link.answered||new Date(link.expires_at)<=new Date()){
      throw new ConflictException('Este enlace ya se utilizó o venció');
    }
    return {title:link.title,code:link.code,expires_at:link.expires_at};
  }

  async submit(token:string,dto:CommunityAnswer){
    if(!/^[0-9a-f]{64}$/.test(token))throw new NotFoundException('Enlace inválido');
    if(dto.consent_confirmed!==true){
      throw new BadRequestException('Debes autorizar el almacenamiento de tu evaluación');
    }
    return this.db.transaction(async client=>{
      const {rows}=await client.query<{
        project_id:number;expires_at:string;used_at:string|null;
      }>(
        `SELECT project_id,expires_at,used_at FROM community_feedback_links
         WHERE token_hash=$1 FOR UPDATE`,[hashToken(token)],
      );
      const link=rows[0];
      if(!link)throw new NotFoundException('Enlace inválido');
      if(link.used_at||new Date(link.expires_at)<=new Date()){
        throw new ConflictException('El enlace ya se utilizó o venció');
      }
      const exists=await client.query('SELECT 1 FROM community_feedback WHERE project_id=$1',[link.project_id]);
      if(exists.rows.length)throw new ConflictException('El proyecto ya cuenta con evaluación comunitaria');
      const ratings={
        objectives:dto.objectives_rating,usefulness:dto.usefulness_rating,
        participation:dto.participation_rating,
      };
      await client.query(
        `INSERT INTO community_feedback
         (project_id,organization_name,relationship_to_project,ratings,comments,consent_confirmed)
         VALUES($1,$2,$3,$4::jsonb,$5,TRUE)`,
        [link.project_id,dto.organization_name?.trim()||null,
         dto.relationship_to_project?.trim()||null,JSON.stringify(ratings),
         dto.comments?.trim()||null],
      );
      await client.query(
        'UPDATE community_feedback_links SET used_at=NOW() WHERE project_id=$1',
        [link.project_id],
      );
      return {message:'Evaluación comunitaria registrada correctamente'};
    });
  }
}
