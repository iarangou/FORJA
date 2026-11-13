import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/service/database.service.js';

@Injectable()
export class AcademicProgramsService {
    constructor (
        private readonly db: DatabaseService,
    ) {}

    async getAll() {
        const { rows } = await this.db.query(
            `
            SELECT ap.id, ap.name, ap.snies_code, f.name AS faculty_name
            FROM academic_programs ap
                INNER JOIN faculty f 
                    ON ap.faculty_id = f.id
            `
        );

        return rows;
    }
}