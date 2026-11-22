import {
  BadRequestException, ConflictException, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../../database/service/database.service.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';
import { CreatePeriodDto, UpdatePeriodDto, ReviewPeriodDto, SavePeriodResultsDto } from '../dto/period.dto.js';
import { SaveEthicsDto } from '../dto/ethics.dto.js';

@Injectable()
export class ProjectWorkflowService {
  constructor(private readonly db: DatabaseService) {}

  private async accessibleProject(projectId: number, user: PayloadJwt) {
    const { rows } = await this.db.query<{ id: number; created_by: number; general_status: string }>(
      `SELECT p.id, p.created_by, p.general_status
       FROM project p
       WHERE p.id=$1 AND (
         $2::boolean OR p.created_by=$3
         OR EXISTS (
           SELECT 1 FROM project_teacher pt
           JOIN teacher t ON t.id=pt.teacher_id
           WHERE pt.project_id=p.id AND t.user_id=$3
         )
       )`,
      [projectId, user.rol_id === 1 || user.rol_id === 2, user.sub],
    );
    if (!rows[0]) throw new NotFoundException('Proyecto no encontrado o sin acceso');
    return rows[0];
  }

  async createPeriod(projectId: number, dto: CreatePeriodDto, user: PayloadJwt) {
    const project = await this.accessibleProject(projectId, user);
    if (project.general_status === 'FINALIZADO') {
      throw new ConflictException('El proyecto está finalizado');
    }
    const recordType = dto.record_type ?? (user.rol_id === 2 ? 'HISTORICO' : 'ACTUAL');
    if (user.rol_id === 2 && recordType !== 'HISTORICO') {
      throw new ForbiddenException('El monitor solo digitaliza períodos históricos');
    }
    if (user.rol_id === 3 && recordType !== 'ACTUAL') {
      throw new ForbiddenException('El profesor registra períodos actuales');
    }
    if (recordType === 'HISTORICO') {
      const {rows}=await this.db.query<{registration_type:string}>(
        'SELECT registration_type FROM project WHERE id=$1',[projectId],
      );
      if(rows[0]?.registration_type!=='HISTORICO'){
        throw new BadRequestException('Los períodos históricos deben pertenecer a un proyecto histórico');
      }
      const now=new Date();
      const currentYear=now.getUTCFullYear();
      const currentSemester=now.getUTCMonth()<6?1:2;
      if(dto.academic_year>currentYear ||
         (dto.academic_year===currentYear && dto.academic_semester>=currentSemester)){
        throw new BadRequestException('Solo pueden digitalizarse semestres anteriores al semestre actual');
      }
    }
    if (dto.start_date && dto.end_date && dto.end_date < dto.start_date) {
      throw new BadRequestException('La fecha final es anterior al inicio');
    }

    try {
      return await this.db.transaction(async (client) => {
        const { rows: teacher } = await client.query<{ id: number }>(
          'SELECT id FROM teacher WHERE user_id=$1', [user.sub],
        );
        if (recordType === 'ACTUAL' && user.rol_id === 3 && !teacher[0]) {
          throw new BadRequestException('No existe un perfil docente asociado a la cuenta');
        }
        const { rows } = await client.query(
          `INSERT INTO project_periods
           (project_id,academic_year,academic_semester,record_type,
            teacher_id,course_id,faculty_id,academic_program_id,objectives,
            activities,budget,student_count,start_date,end_date,
            community_population_description,territory_name,missing_information,historical_teacher_name)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           RETURNING *`,
          [projectId,dto.academic_year,dto.academic_semester,recordType,
            teacher[0]?.id ?? null,dto.course_id ?? null,dto.faculty_id ?? null,
            dto.academic_program_id ?? null,dto.objectives ?? null,
            dto.activities ?? null,dto.budget ?? null,dto.student_count ?? null,
            dto.start_date ?? null,dto.end_date ?? null,
            dto.community_population_description ?? null,
            dto.territory_name ?? null,dto.missing_information ?? null,
            recordType==='HISTORICO'?(dto.historical_teacher_name?.trim()||null):null],
        );
        if (dto.course_id) {
          await client.query(
            'INSERT INTO project_period_courses (project_period_id,course_id) VALUES ($1,$2)',
            [rows[0].id,dto.course_id],
          );
        }
        return rows[0];
      });
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23505') {
        throw new ConflictException('Ya existe un registro de este semestre para el proyecto');
      }
      throw error;
    }
  }

  async updateHistoricalPeriod(projectId:number,periodId:number,dto:UpdatePeriodDto,user:PayloadJwt){
    if(user.rol_id!==1 && user.rol_id!==2){
      throw new ForbiddenException('La digitalización corresponde al monitor o administrador');
    }
    const project=await this.accessibleProject(projectId,user);
    if(project.general_status!=='ACTIVO') {
      throw new ConflictException('El proyecto está finalizado');
    }
    return this.db.transaction(async client=>{
      const {rows}=await client.query<{
        id:number;start_date:string|null;end_date:string|null;record_type:string;
      }>(
        `SELECT id,start_date,end_date,record_type FROM project_periods
          WHERE id=$1 AND project_id=$2 FOR UPDATE`,[periodId,projectId],
      );
      const period=rows[0];
      if(!period)throw new NotFoundException('Período no encontrado');
      if(period.record_type!=='HISTORICO'){
        throw new ConflictException('Solo se editan períodos históricos por esta ruta');
      }
      const start=dto.start_date??period.start_date;
      const end=dto.end_date??period.end_date;
      if(start&&end&&String(end).slice(0,10)<String(start).slice(0,10)){
        throw new BadRequestException('La fecha final no puede ser anterior a la inicial');
      }
      const {rows:updated}=await client.query(
        `UPDATE project_periods SET
         course_id=COALESCE($2,course_id),
         objectives=COALESCE($3,objectives),
         activities=COALESCE($4,activities),
         student_count=COALESCE($5,student_count),
         budget=COALESCE($6,budget),
         start_date=COALESCE($7,start_date),
         end_date=COALESCE($8,end_date),
         community_population_description=COALESCE($9,community_population_description),
         territory_name=COALESCE($10,territory_name),
         missing_information=$11,
         faculty_id=$12,
         academic_program_id=$13,
         historical_teacher_name=$14,
         updated_at=NOW()
         WHERE id=$1 RETURNING *`,
        [periodId,dto.course_id??null,dto.objectives??null,dto.activities??null,
         dto.student_count??null,dto.budget??null,dto.start_date??null,dto.end_date??null,
         dto.community_population_description??null,dto.territory_name??null,
         dto.missing_information??null,
         dto.faculty_id??null,dto.academic_program_id??null,
         dto.historical_teacher_name?.trim()||null],
      );
      if(dto.course_id!==undefined){
        await client.query('DELETE FROM project_period_courses WHERE project_period_id=$1',[periodId]);
        await client.query('INSERT INTO project_period_courses(project_period_id,course_id) VALUES($1,$2)',
          [periodId,dto.course_id]);
      }
      return updated[0];
    });
  }

  async updatePeriod(projectId: number, periodId: number, dto: UpdatePeriodDto, user: PayloadJwt) {
    const project = await this.accessibleProject(projectId, user);
    if (project.general_status === 'FINALIZADO') {
      throw new ConflictException('El proyecto ya está finalizado');
    }
    if (user.rol_id === 2) {
      throw new ForbiddenException('La digitalización de históricos se modifica mediante un flujo separado');
    }
    return this.db.transaction(async (client) => {
      const { rows } = await client.query<{
        id: number; record_type: string; approval_status: string;
        teacher_id: number | null; start_date: string | null; end_date: string | null;
      }>(
        `SELECT pp.id,pp.record_type,pp.approval_status,pp.teacher_id,
                pp.start_date,pp.end_date FROM project_periods pp
         WHERE pp.id=$1 AND pp.project_id=$2 FOR UPDATE`,
        [periodId, projectId],
      );
      const period = rows[0];
      if (!period) throw new NotFoundException('Período no encontrado');
      if (period.record_type !== 'ACTUAL' ||
          !['BORRADOR','DEVUELTO'].includes(period.approval_status)) {
        throw new ConflictException('Solo se modifican períodos actuales en borrador o devueltos');
      }
      if (user.rol_id === 3) {
        const teacher = await client.query<{ id: number }>(
          'SELECT id FROM teacher WHERE user_id=$1', [user.sub],
        );
        if (!teacher.rows[0] || teacher.rows[0].id !== period.teacher_id) {
          throw new ForbiddenException('El período pertenece a otro profesor responsable');
        }
      }
      const start = dto.start_date ?? period.start_date;
      const end = dto.end_date ?? period.end_date;
      if (start && end && String(end).slice(0,10) < String(start).slice(0,10)) {
        throw new BadRequestException('La fecha final es anterior a la inicial');
      }
      const { rows: updated } = await client.query(
        `UPDATE project_periods SET
          course_id=COALESCE($2,course_id),
          faculty_id=COALESCE($3,faculty_id),
          academic_program_id=COALESCE($4,academic_program_id),
          objectives=COALESCE($5,objectives),
          activities=COALESCE($6,activities),
          budget=COALESCE($7,budget),
          student_count=COALESCE($8,student_count),
          start_date=COALESCE($9,start_date),
          end_date=COALESCE($10,end_date),
          community_population_description=COALESCE($11,community_population_description),
          territory_name=COALESCE($12,territory_name),
          missing_information=COALESCE($13,missing_information),
          updated_at=NOW()
         WHERE id=$1 RETURNING *`,
        [periodId,dto.course_id??null,dto.faculty_id??null,
          dto.academic_program_id??null,dto.objectives??null,dto.activities??null,
          dto.budget??null,dto.student_count??null,dto.start_date??null,
          dto.end_date??null,dto.community_population_description??null,
          dto.territory_name??null,dto.missing_information??null],
      );
      if (dto.course_id !== undefined) {
        await client.query('DELETE FROM project_period_courses WHERE project_period_id=$1',[periodId]);
        await client.query(
          'INSERT INTO project_period_courses(project_period_id,course_id) VALUES($1,$2)',
          [periodId,dto.course_id],
        );
      }
      return updated[0];
    });
  }

  async saveResults(projectId: number, periodId: number, dto: SavePeriodResultsDto, user: PayloadJwt) {
    if (user.rol_id !== 3) throw new ForbiddenException('Solo el profesor responsable registra resultados');
    const project=await this.accessibleProject(projectId,user);
    if(project.general_status!=='ACTIVO') throw new ConflictException('El proyecto está finalizado');
    const teacher=await this.db.query<{id:number}>('SELECT id FROM teacher WHERE user_id=$1',[user.sub]);
    if(!teacher.rows[0])throw new ForbiddenException('No hay perfil docente asociado');
    const {rows}=await this.db.query(
      `UPDATE project_periods SET results=$1,conclusions=$2,updated_at=NOW()
       WHERE id=$3 AND project_id=$4 AND teacher_id=$5
         AND record_type='ACTUAL' AND approval_status='APROBADO'
         AND execution_status<>'CERRADO'
       RETURNING id,results,conclusions,execution_status`,
      [dto.results.trim(),dto.conclusions.trim(),periodId,projectId,teacher.rows[0].id],
    );
    if(!rows[0])throw new ConflictException('Solo el profesor responsable puede actualizar resultados de un período aprobado y abierto');
    return rows[0];
  }

  async closePeriod(projectId:number,periodId:number,user:PayloadJwt) {
    if(user.rol_id!==1)throw new ForbiddenException('Solo el administrador cierra semestres');
    return this.db.transaction(async client=>{
      const {rows}=await client.query(
        `SELECT pp.id,pp.approval_status,pp.execution_status,pp.record_type,
                pp.results,pp.conclusions,p.general_status
           FROM project_periods pp JOIN project p ON p.id=pp.project_id
          WHERE pp.id=$1 AND pp.project_id=$2 FOR UPDATE OF pp`,
        [periodId,projectId],
      );
      const period=rows[0];
      if(!period)throw new NotFoundException('Período no encontrado');
      if(period.general_status!=='ACTIVO'||period.record_type!=='ACTUAL'||
         period.approval_status!=='APROBADO'||period.execution_status==='CERRADO'){
        throw new ConflictException('El semestre debe estar aprobado, activo y sin cerrar');
      }
      if(!period.results?.trim()||!period.conclusions?.trim()){
        throw new BadRequestException('El profesor debe registrar resultados y conclusiones');
      }
      const {rows:counts}=await client.query<{approved:string;pending:string}>(
        `SELECT COUNT(*) FILTER(WHERE review_status='APROBADA')::text AS approved,
                COUNT(*) FILTER(WHERE review_status='PENDIENTE')::text AS pending
         FROM project_documents
         WHERE project_period_id=$1 AND document_kind='EVIDENCIA'`,
        [periodId],
      );
      if(Number(counts[0]?.approved??0)<1){
        throw new BadRequestException('Debe existir al menos una evidencia PDF aprobada');
      }
      if(Number(counts[0]?.pending??0)>0){
        throw new BadRequestException('Hay evidencias pendientes de revisión');
      }
      const {rows:updated}=await client.query(
        `UPDATE project_periods SET execution_status='CERRADO',updated_at=NOW()
         WHERE id=$1 RETURNING id,execution_status,approval_status`,
        [periodId],
      );
      return updated[0];
    });
  }

  async finalizeProject(projectId: number, user: PayloadJwt) {
    if(user.rol_id!==1) {
      throw new ForbiddenException('Solo el administrador puede finalizar un proyecto');
    }
    return this.db.transaction(async client=>{
      const {rows:projects}=await client.query<{
        id:number;general_status:string;registration_type:string;
      }>(
        'SELECT id,general_status,registration_type FROM project WHERE id=$1 FOR UPDATE',
        [projectId],
      );
      const project=projects[0];
      if(!project)throw new NotFoundException('Proyecto no encontrado');
      if(project.general_status!=='ACTIVO'){
        throw new ConflictException('El proyecto ya está finalizado');
      }

      const {rows:periods}=await client.query<{
        record_type:string;approval_status:string;execution_status:string;
      }>(
        'SELECT record_type,approval_status,execution_status FROM project_periods WHERE project_id=$1 FOR SHARE',
        [projectId],
      );
      if(!periods.length) {
        throw new BadRequestException('No puede finalizarse un proyecto sin períodos académicos');
      }
      const current=periods.filter(p=>p.record_type==='ACTUAL');
      const unfinished=current.filter(p=>
        p.approval_status!=='APROBADO'||p.execution_status!=='CERRADO'
      );
      if(unfinished.length) {
        throw new ConflictException('Existen semestres actuales que aún no están aprobados y cerrados');
      }
      if(project.registration_type==='NUEVO' && !current.length){
        throw new BadRequestException('Debe existir al menos un semestre actual aprobado y cerrado');
      }

      const {rows:updated}=await client.query(
        `UPDATE project
           SET general_status='FINALIZADO',updated_at=NOW()
         WHERE id=$1 RETURNING id,code,title,general_status,updated_at`,
        [projectId],
      );
      return updated[0];
    });
  }

  async getReviews(projectId: number, periodId: number, user: PayloadJwt) {
    await this.accessibleProject(projectId,user);
    const period = await this.db.query(
      'SELECT id FROM project_periods WHERE id=$1 AND project_id=$2',[periodId,projectId],
    );
    if (!period.rows[0]) throw new NotFoundException('Período no encontrado');
    const {rows} = await this.db.query(
      `SELECT r.id,r.decision,r.notes,r.reviewed_at,u.full_name AS reviewer
       FROM project_period_reviews r JOIN users u ON u.id=r.reviewer_id
       WHERE r.project_period_id=$1 ORDER BY r.reviewed_at DESC,r.id DESC`,[periodId],
    );
    return rows;
  }

  async getPeriods(projectId: number, user: PayloadJwt) {
    await this.accessibleProject(projectId,user);
    const { rows } = await this.db.query(
      `SELECT id, project_id, academic_year, academic_semester, record_type,
              teacher_id, course_id, faculty_id, academic_program_id,
              historical_teacher_name, objectives, activities, budget, student_count, start_date, end_date,
              community_population_description, territory_name, missing_information,
              approval_status, execution_status, results, conclusions, last_submitted_at
       FROM project_periods WHERE project_id=$1
       ORDER BY academic_year DESC, academic_semester DESC`, [projectId],
    );
    return rows;
  }

  async saveEthics(projectId: number, dto: SaveEthicsDto, user: PayloadJwt) {
    const project = await this.accessibleProject(projectId,user);
    if (user.rol_id === 2) {
      throw new ForbiddenException('El monitor registra históricos, pero no valida su análisis ético');
    }
    if (project.general_status === 'FINALIZADO') {
      throw new ConflictException('No se modifica el análisis de un proyecto finalizado');
    }
    const locked = await this.db.query(
      `SELECT 1 FROM project_periods
       WHERE project_id=$1 AND approval_status IN ('EN_REVISION','APROBADO') LIMIT 1`,
      [projectId],
    );
    if (locked.rows.length) {
      throw new ConflictException('El análisis ético está bloqueado durante la revisión o tras la aprobación');
    }
    const { rows } = await this.db.query(
      `INSERT INTO project_ethics
        (project_id,external_population,university_population,
         external_population_other,university_population_other,
         handles_personal_data,involves_vulnerable_population,identifiable_media,
         privacy_measures,risk_mitigation,truthful_declaration,notes,updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (project_id) DO UPDATE SET
         external_population=EXCLUDED.external_population,
         university_population=EXCLUDED.university_population,
         external_population_other=EXCLUDED.external_population_other,
         university_population_other=EXCLUDED.university_population_other,
         handles_personal_data=EXCLUDED.handles_personal_data,
         involves_vulnerable_population=EXCLUDED.involves_vulnerable_population,
         identifiable_media=EXCLUDED.identifiable_media,
         privacy_measures=EXCLUDED.privacy_measures,
         risk_mitigation=EXCLUDED.risk_mitigation,
         truthful_declaration=EXCLUDED.truthful_declaration,
         notes=EXCLUDED.notes,
         updated_by=EXCLUDED.updated_by, updated_at=NOW()
       RETURNING id,project_id,external_population,university_population,
         handles_personal_data,involves_vulnerable_population,identifiable_media,
         truthful_declaration,updated_at`,
      [projectId,dto.external_population ?? null,dto.university_population ?? null,
        dto.external_population_other ?? null,dto.university_population_other ?? null,
        dto.handles_personal_data ?? null,dto.involves_vulnerable_population ?? null,
        dto.identifiable_media ?? null,dto.privacy_measures ?? null,
        dto.risk_mitigation ?? null,dto.truthful_declaration ?? false,
        dto.notes ?? null,user.sub],
    );
    return rows[0];
  }

  async getEthics(projectId: number, user: PayloadJwt) {
    await this.accessibleProject(projectId,user);
    const { rows } = await this.db.query(
      `SELECT project_id,external_population,university_population,
         external_population_other,university_population_other,handles_personal_data,
         involves_vulnerable_population,identifiable_media,privacy_measures,
         risk_mitigation,truthful_declaration,notes,requested_at,updated_at
       FROM project_ethics WHERE project_id=$1`, [projectId],
    );
    return rows[0] ?? null;
  }

  async submitPeriod(projectId: number, periodId: number, user: PayloadJwt) {
    if (user.rol_id !== 3) {
      throw new ForbiddenException('Solo el profesor presenta períodos actuales');
    }
    await this.accessibleProject(projectId,user);
    return this.db.transaction(async client => {
      const { rows } = await client.query(
        `SELECT pp.*, p.title,p.general_problem,p.general_objective,p.community_name,
                e.external_population,e.university_population,e.truthful_declaration
         FROM project_periods pp JOIN project p ON p.id=pp.project_id
         LEFT JOIN project_ethics e ON e.project_id=p.id
         WHERE pp.id=$1 AND pp.project_id=$2 FOR UPDATE OF pp`,
        [periodId,projectId],
      );
      const p=rows[0];
      if (!p) throw new NotFoundException('Período no encontrado');
      if (p.record_type !== 'ACTUAL') throw new ForbiddenException('Los registros históricos no se someten a este flujo');
      const teacher = await client.query<{ id: number }>(
        'SELECT id FROM teacher WHERE user_id=$1', [user.sub],
      );
      if (!teacher.rows[0] || teacher.rows[0].id !== p.teacher_id) {
        throw new ForbiddenException('Solo el profesor responsable puede presentar este período');
      }
      if (!['BORRADOR','DEVUELTO'].includes(p.approval_status)) {
        throw new ConflictException('El período no se encuentra editable');
      }
      const missing: string[]=[];
      if (!p.general_problem?.trim()) missing.push('Problemática');
      if (!p.general_objective?.trim()) missing.push('Objetivo general');
      if (!p.community_name?.trim()) missing.push('Comunidad u organización');
      if (!p.objectives?.trim()) missing.push('Objetivos del período');
      if (!p.activities?.trim()) missing.push('Actividades');
      if (!p.course_id) missing.push('Asignatura');
      if (!p.teacher_id) missing.push('Profesor responsable');
      if (!p.start_date || !p.end_date) missing.push('Fechas');
      if (p.budget === null) missing.push('Presupuesto');
      if (p.student_count === null) missing.push('Cantidad de estudiantes');
      if (!p.external_population || !p.university_population || !p.truthful_declaration) {
        missing.push('Análisis ético y declaración de veracidad');
      }
      if (missing.length) {
        throw new BadRequestException({
          message:'Faltan requisitos para enviar a revisión',
          missing,
        });
      }
      const {rows:updated}=await client.query(
        `UPDATE project_periods SET approval_status='EN_REVISION',
          last_submitted_at=NOW(),updated_at=NOW()
         WHERE id=$1 RETURNING *`,[periodId],
      );
      return updated[0];
    });
  }

  async reviewPeriod(projectId: number, periodId: number, dto: ReviewPeriodDto, user: PayloadJwt) {
    if (user.rol_id !== 1) throw new ForbiddenException('Solo el administrador puede decidir');
    await this.accessibleProject(projectId,user);
    if (dto.decision === 'DEVUELTO' && !dto.notes?.trim()) {
      throw new BadRequestException('Debe indicar las correcciones solicitadas');
    }
    return this.db.transaction(async client => {
      const {rows}=await client.query(
        `SELECT * FROM project_periods WHERE id=$1 AND project_id=$2 FOR UPDATE`,
        [periodId,projectId],
      );
      if (!rows[0]) throw new NotFoundException('Período no encontrado');
      if (rows[0].approval_status !== 'EN_REVISION') {
        throw new ConflictException('Solo se revisan períodos que están EN_REVISION');
      }
      await client.query(
        `INSERT INTO project_period_reviews (project_period_id,reviewer_id,decision,notes)
         VALUES ($1,$2,$3,$4)`,
        [periodId,user.sub,dto.decision,dto.notes?.trim() ?? null],
      );
      const {rows:updated}=await client.query(
        `UPDATE project_periods SET approval_status=$1,updated_at=NOW()
         WHERE id=$2 RETURNING *`,
        [dto.decision,periodId],
      );
      return updated[0];
    });
  }
}
