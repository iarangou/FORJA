import { Module } from "@nestjs/common";
import { ProjectController } from "./controller/project.controller.js";
import { ProjectService } from "./service/project.service.js";

@Module({
    controllers: [ProjectController],
    exports: [ProjectService],
    providers: [ProjectService]
})

export class ProjectModule {}