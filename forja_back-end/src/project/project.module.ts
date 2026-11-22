import { Module } from '@nestjs/common';
import { ProjectController } from './controller/project.controller.js';
import { ProjectService } from './service/project.service.js';
import { ProjectWorkflowController } from './controller/project-workflow.controller.js';
import { ProjectWorkflowService } from './service/project-workflow.service.js';
import { ProjectEvidenceController } from './controller/project-evidence.controller.js';
import { ProjectEvidenceService } from './service/project-evidence.service.js';

@Module({
  controllers: [ProjectController, ProjectWorkflowController, ProjectEvidenceController],
  providers: [ProjectService, ProjectWorkflowService, ProjectEvidenceService],
  exports: [ProjectService, ProjectWorkflowService],
})
export class ProjectModule {}
