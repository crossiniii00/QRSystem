import { APP_CONFIG } from '../../../config/app.config';
import { IEmailNotificationService } from '../../../lib/email/email.service';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../../lib/errors/domain-errors';
import { Logger } from '../../../lib/logging/logger';
import { SecurityUtils } from '../../../lib/security/token';
import { IApplicantRepository } from '../../applicants/infrastructure/applicant.repository';
import { IAuditLogRepository } from '../../audit/infrastructure/audit-log.repository';
import { IDocumentRepository } from '../../documents/infrastructure/document.repository';
import { IProgramRepository } from '../../programs/infrastructure/program.repository';
import { IRequirementRepository } from '../../requirements/infrastructure/requirement.repository';
import { ApplicationStateMachine } from '../domain/application-state-machine';
import { ApplicationStatus } from '../domain/application-status.enum';
import { Application } from '../domain/application.entity';
import { IApplicationRepository } from '../infrastructure/application.repository';

const logger = new Logger('SubmitApplicationUseCase');

export interface SubmitApplicationInput {
  applicationId: string;
  accessToken: string;
  applicantNotes?: string;
}

export class SubmitApplicationUseCase {
  constructor(
    private readonly applicationRepo: IApplicationRepository,
    private readonly applicantRepo: IApplicantRepository,
    private readonly requirementRepo: IRequirementRepository,
    private readonly documentRepo: IDocumentRepository,
    private readonly programRepo: IProgramRepository,
    private readonly auditLogRepo: IAuditLogRepository,
    private readonly emailService: IEmailNotificationService
  ) {}

  public async execute(input: SubmitApplicationInput): Promise<Application> {
    const app = await this.applicationRepo.findById(input.applicationId);
    if (!app) {
      throw new NotFoundError(`Application with ID ${input.applicationId} was not found.`);
    }

    // Authenticate applicant token
    const tokenHash = SecurityUtils.hashToken(input.accessToken);
    if (app.accessTokenHash !== tokenHash) {
      throw new UnauthorizedError('Invalid application access token.');
    }

    // Verify applicant details exist
    const applicant = await this.applicantRepo.findById(app.applicantId);
    if (!applicant) {
      throw new ValidationError('Applicant demographic record missing or corrupt.');
    }

    // Verify program exists
    const program = await this.programRepo.findById(app.programId);
    if (!program) {
      throw new ValidationError('Selected academic program is not available.');
    }

    // Verify all mandatory document requirements are uploaded
    const requirements = await this.requirementRepo.getRequirementsForProgram(app.programId);
    const mandatoryRequirements = requirements.filter((r) => r.isMandatory);
    const uploadedDocs = await this.documentRepo.findByApplicationId(app.id);

    const uploadedReqIds = new Set(uploadedDocs.map((d) => d.requirementId));
    const missingRequirements = mandatoryRequirements.filter((r) => !uploadedReqIds.has(r.id));

    if (missingRequirements.length > 0) {
      throw new ValidationError(
        `Cannot submit application: missing required documents: ${missingRequirements.map((r) => r.title).join(', ')}`,
        {
          missingCount: missingRequirements.length,
          missingTitles: missingRequirements.map((r) => r.title),
        }
      );
    }

    // Validate state transition through domain state machine
    ApplicationStateMachine.validateTransition(app.status, ApplicationStatus.SUBMITTED, {
      performedByRole: 'STUDENT',
      hasAllMandatoryDocuments: true,
    });

    // Update application
    const updatedApp = await this.applicationRepo.update(app.id, {
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    if (!updatedApp) {
      throw new Error('Failed to update application status.');
    }

    // Audit logging
    await this.auditLogRepo.create({
      actorType: 'STUDENT',
      actorId: applicant.id,
      actorEmail: applicant.email,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'APPLICATION',
      entityId: updatedApp.id,
      metadata: {
        referenceNumber: updatedApp.referenceNumber,
        programCode: program.code,
        mandatoryDocsCount: mandatoryRequirements.length,
      },
    });

    // Trigger transactional email
    const magicLinkUrl = `${process.env.APP_URL || 'http://localhost:3000'}/status?reference=${updatedApp.referenceNumber}&token=${input.accessToken}`;
    
    await this.emailService.sendApplicationSubmitted({
      recipientEmail: applicant.email,
      recipientName: `${applicant.firstName} ${applicant.lastName}`,
      referenceNumber: updatedApp.referenceNumber,
      magicLinkUrl,
      programName: program.name,
    });

    logger.info(`Application ${updatedApp.referenceNumber} successfully submitted by student ${applicant.email}`);

    return updatedApp;
  }
}
