import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/service/database.service.js";
import { CreateProjectDTO } from "../dto/project.dto.js";

@Injectable()
export class ProjectService {
    constructor(
        private readonly db: DatabaseService
    ) { }

    async getAll() {
        const { rows } = await this.db.query(
            `
            SELECT * FROM project p
            `
        )

        return rows;
    }

    async createProject(request: any) {
        // console.log(request)
        return true;
    }
}