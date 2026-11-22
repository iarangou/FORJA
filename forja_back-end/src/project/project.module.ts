import { Module } from '@nestjs/common';
import { ProjectController } from './controller/project.controller.js';
import { ProjectService } from './service/project.service.js';
import { ProjectWorkflowController } from './controller/project-workflow.controller.js';
import { ProjectWorkflowService } from './service/project-workflow.service.js';

@Module({
  controllers: [ProjectController, ProjectWorkflowController],
  providers: [ProjectService, ProjectWorkflowService],
  exports: [ProjectService, ProjectWorkflowService],
})
export class ProjectModule {}
