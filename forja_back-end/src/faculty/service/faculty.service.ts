import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "../../database/service/database.service.js";

import { FacultyCreateDto, FacultyUpdateDto, FacultyDeleteDto } from "../dto/faculty.dto.js";
import { DatabaseError } from "pg";
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class FacultyService {
    constructor(
        private readonly db: DatabaseService,
    ) { }
    
    async getAll() {
        const { rows } = await this.db.query(
            `
            SELECT f.id, f.name, f.code FROM faculty f
            `
        );

        return rows;
    }

    async create(dto: FacultyCreateDto) {
        // pendiente
    }


    // async update(dto: FacultyUpdateDto) {
    //     const { rows } = await this.db.query(
    //         `UPDATE faculty
    //         SET name = $1
    //         WHERE id = $2  
    //         `,
    //         [dto.name, dto.id]
    //     );

    //     const faculty = rows[0];

    //     if (!faculty) {
    //         throw new NotFoundException(`Faculty not found`)
    //     }

    //     return {
    //         message: 'faculty has been updated',
    //     };
    // }

    // async delete(dto: FacultyDeleteDto) {
    //     const { rows } = await this.db.query(
    //         `DELETE FROM faculty
    //         WHERE id = $1
    //         `, [dto.id]
    //     )

    //     const { faculty } = rows[0];

    //     if (!faculty) {
    //         throw new NotFoundException(`Faculty not found`)
    //     }

    //     return {
    //         message: 'Faculty has been deleted successfully',
        // }
    // }
}