import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/service/database.service.js';
import { CreateProjectDTO } from '../dto/project.dto.js';
import type { PayloadJwt } from '../../shared/types/auth.types.js';

@Injectable()
export class ProjectService {
  constructor(private readonly db: DatabaseService) {}

  async getAll(user: PayloadJwt) {
    // Admin (1) y monitor (2) consultan los proyectos para gestion y digitalizacion.
    // Profesor (3) solo consulta los que creo o los que tiene asignados.
    const privileged = user.rol_id === 1 || user.rol_id === 2;
    const { rows } = await this.db.query(
      `SELECT p.id, p.code, p.title, p.general_problem, p.general_objective,
              p.registration_type, p.general_status, p.justification, p.community_name, p.community_contact, p.community_location, p.ods_ids, p.prior_project_id, p.duration, p.start_date,
              p.end_date, p.created_by, p.created_at, p.updated_at
         FROM project p
        WHERE $1::boolean
           OR p.created_by = $2
           OR EXISTS (
                SELECT 1 FROM project_teacher pt
                INNER JOIN teacher t ON t.id = pt.teacher_id
                WHERE pt.project_id = p.id AND t.user_id = $2
              )
        ORDER BY p.created_at DESC, p.id DESC`,
      [privileged, user.sub],
    );
    return rows;
  }

  async getById(id: number, user: PayloadJwt) {
    const { rows } = await this.db.query(
      `SELECT p.id, p.code, p.title, p.general_problem, p.general_objective,
              p.registration_type, p.general_status, p.justification, p.community_name, p.community_contact, p.community_location, p.ods_ids, p.prior_project_id, p.duration, p.start_date,
              p.end_date, p.created_by, p.created_at, p.updated_at
         FROM project p
        WHERE p.id = $1
          AND ($2::boolean OR p.created_by = $3
            OR EXISTS (
              SELECT 1 FROM project_teacher pt
              INNER JOIN teacher t ON t.id = pt.teacher_id
              WHERE pt.project_id = p.id AND t.user_id = $3
            ))`,
      [id, user.rol_id === 1 || user.rol_id === 2, user.sub],
    );
    if (!rows[0]) throw new NotFoundException('Proyecto no encontrado');
    return rows[0];
  }

  async createProject(dto: CreateProjectDTO, user: PayloadJwt) {
    if (dto.start_date && dto.end_date && dto.end_date < dto.start_date) {
      throw new BadRequestException('La fecha final no puede ser anterior a la inicial');
    }

    const registrationType = dto.registration_type ?? 'NUEVO';
    if (user.rol_id === 2 && registrationType !== 'HISTORICO') {
      throw new ForbiddenException('El monitor solo puede digitalizar proyectos historicos');
    }
    if (user.rol_id === 3 && registrationType !== 'NUEVO') {
      throw new ForbiddenException('El profesor debe registrar los periodos actuales');
    }

    return this.db.transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO project
           (title, general_problem, general_objective, registration_type,
            duration, start_date, end_date, created_by,
            justification, community_name, community_contact, community_location,
            prior_project_id, ods_ids)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                 $9, $10, $11, $12, $13, $14)
         RETURNING id, code, title, general_problem, general_objective,
                   registration_type, general_status, duration, start_date,
                   end_date, created_by, justification, community_name,
                   community_contact, community_location, prior_project_id,
                   ods_ids, created_at, updated_at`,
        [dto.title.trim(), dto.general_problem?.trim() ?? null,
          dto.general_objective?.trim() ?? null, registrationType,
          dto.duration ?? null, dto.start_date ?? null, dto.end_date ?? null, user.sub,
          dto.justification?.trim() ?? null, dto.community_name?.trim() ?? null,
          dto.community_contact?.trim() ?? null, dto.community_location?.trim() ?? null,
          dto.prior_project_id ?? null, dto.ods_ids ?? []],
      );
      const project = rows[0];
      // Si el profesor crea el proyecto, asociarlo como responsable.
      if (user.rol_id === 3) {
        const teacher = await client.query<{ id: number }>(
          'SELECT id FROM teacher WHERE user_id = $1', [user.sub],
        );
        if (!teacher.rows[0]) {
          throw new BadRequestException('El profesor no tiene un perfil academico');
        }
        await client.query(
          `INSERT INTO project_teacher (project_id, teacher_id, is_responsible)
           VALUES ($1, $2, TRUE)`,
          [project.id, teacher.rows[0].id],
        );
      }
      return project;
    });
  }
}
