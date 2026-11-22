import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CourseService } from "../service/course.service.js";
import { CourseCreateDto } from "../dto/course.dto.js";
import { AuthGuard } from "../../auth/guard/auth.guard.js";
import { RolesGuard } from "../../auth/guard/roles.guard.js";
import { Roles } from "../../shared/decorator/roles.decorator.js";


@Controller("course/")
export class CourseController {
    constructor (
        private courseService: CourseService
    ) {}

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1, 2, 3)
    getAll() {
        return this.courseService.getAll();
    }

    @Post("create")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    create(@Body() dto: CourseCreateDto) {
        return this.courseService.create(dto);
    }
}