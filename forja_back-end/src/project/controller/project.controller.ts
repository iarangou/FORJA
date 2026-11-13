import { Controller, Get, Req, UseGuards, Post } from "@nestjs/common";
import { ProjectService } from "../service/project.service.js";
import { AuthGuard } from "../../auth/guard/auth.guard.js";
import { Roles } from "../../shared/decorator/roles.decorator.js";
import { CreateProjectDTO } from "../dto/project.dto.js";
import type { PayloadJwt } from "../../shared/types/auth.types.js";

@Controller("project/")
export class ProjectController {
    constructor( 
        private readonly projectService: ProjectService
    ) {}

    @Get()
    @UseGuards(AuthGuard)
    @Roles(1, 2)
    getAll(@Req() request: any) {
        return this.projectService.getAll();
    }

    @Post()
    @UseGuards(AuthGuard)
    @Roles(1, 2, 3)
    createProject(@Req() request: PayloadJwt) {
        return this.projectService.createProject(request);
    }
}