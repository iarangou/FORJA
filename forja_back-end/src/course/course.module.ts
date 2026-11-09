import { Module } from "@nestjs/common"
import { CourseService } from "./service/course.service.js";
import { CourseController } from "./controller/course.controller.js";

@Module({
    imports: [],
    controllers: [CourseController],
    providers: [CourseService],
    exports: [CourseService]
})

export class CourseModule{}