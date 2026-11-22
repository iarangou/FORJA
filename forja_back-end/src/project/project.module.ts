import { Module } from '@nestjs/common';
import { ProjectController } from './controller/project.controller.js';
import { ProjectService } from './service/project.service.js';
import { ProjectWorkflowController } from './controller/project-workflow.controller.js';
import { ProjectWorkflowService } from './service/project-workflow.service.js';
import { ProjectEvidenceController } from './controller/project-evidence.controller.js';
import { ProjectEvidenceService } from './service/project-evidence.service.js';
import { ProjectLetterController } from './controller/project-letter.controller.js';
import { ProjectLetterService } from './service/project-letter.service.js';
import { CommunityFeedbackController } from './controller/community-feedback.controller.js';
import { CommunityFeedbackService } from './service/community-feedback.service.js';

@Module({
  controllers: [ProjectController, ProjectWorkflowController, ProjectEvidenceController, ProjectLetterController, CommunityFeedbackController],
  providers: [ProjectService, ProjectWorkflowService, ProjectEvidenceService, ProjectLetterService, CommunityFeedbackService],
  exports: [ProjectService, ProjectWorkflowService],
})
export class ProjectModule {}
