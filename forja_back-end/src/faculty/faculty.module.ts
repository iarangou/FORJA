import { Module } from "@nestjs/common"
import { FacultyController } from "./controller/faculty.controller.js";
import { FacultyService } from "./service/faculty.service.js"

@Module({
    imports: [],
    controllers: [FacultyController],
    providers: [FacultyService],
    exports: [FacultyService]
})

export class FacultyModule{}