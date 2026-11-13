import { HttpStatus, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/service/database.service.js";

@Injectable()
export class TestService {
    constructor(
        private readonly db: DatabaseService
    ) { }
    async test() {
        const { rows } = await this.db.query(
            'SELECT * FROM docker_test WHERE id = $1',
            [1],
        );
        
        return rows;
    }
}