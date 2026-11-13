import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "../../database/service/database.service.js";

import { CourseCreateDto } from "../dto/course.dto.js";
import { DatabaseError } from "pg";

@Injectable()
export class CourseService {
    constructor(
        private readonly db: DatabaseService,
    ) { }

    async create(dto: CourseCreateDto) {
        try {
            await this.db.query(
                `
            INSERT INTO course (name)
            VALUES ($1)
            `,
                [dto.name],
            );
        } catch (error: unknown) {
            if (!(error instanceof DatabaseError)) {
                throw error;
            }

            if(error.code === '23505' && error.constraint === 'course_name_key') {
                throw new ConflictException('El curso ya existe');
            }

            throw error;
        }


        return {
            message: 'Course created successfully',
        }
    }
}
