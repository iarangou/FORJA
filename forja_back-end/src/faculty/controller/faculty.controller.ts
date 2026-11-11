import { Body, Controller, Post, UseGuards, Get } from "@nestjs/common";
import { FacultyCreateDto, FacultyUpdateDto, FacultyDeleteDto } from "../dto/faculty.dto.js";
import { AuthGuard } from "../../auth/guard/auth.guard.js";
import { RolesGuard } from "../../auth/guard/roles.guard.js";
import { Roles } from "../../shared/decorator/roles.decorator.js";
import { FacultyService } from "../service/faculty.service.js";


@Controller("faculties/")
export class FacultyController {
    constructor (
        private facultyService: FacultyService
    ) {}

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1, 2, 3)
    getAll() {
        return this.facultyService.getAll();
    }

    @Post("create")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(1)
    create(@Body() dto: FacultyCreateDto) {
        return this.facultyService.create(dto);
    }

    // @Post("update")
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles(1)
    // update(@Body() dto: FacultyUpdateDto) {
    //     return this.facultyService.update(dto);
    // }

    // @Post("delete")
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles(1)
    // delete(@Body() dto: FacultyUpdateDto) {
    //     return this.facultyService.delete(dto);
    // }
}