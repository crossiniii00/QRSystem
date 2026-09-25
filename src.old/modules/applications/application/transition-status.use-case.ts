import { IEmailNotificationService } from '../../../lib/email/email.service';
import { NotFoundError, ValidationError } from '../../../lib/errors/domain-errors';
import { Logger } from '../../../lib/logging/logger';
import { IApplicantRepository } from '../../applicants/infrastructure/applicant.repository';
import { IAuditLogRepository } from '../../audit/infrastructure/audit-log.repository';
import { AdminUser } from '../../authentication/domain/user.entity';
import { IDocumentRepository } from '../../documents/infrastructure/document.repository';
import { IProgramRepository } from '../../programs/infrastructure/program.repository';
import { IRequirementRepository } from '../../requirements/infrastructure/requirement.repository';
import { ApplicationStateMachine } from '../domain/application-state-machine';
import { ApplicationStatus } from '../domain/application-status.enum';
import { Application } from '../domain/application.entity';
import { IApplicationRepository } from '../infrastructure/application.repository';

const logger = new Logger('TransitionStatusUseCase');

export interface TransitionStatusInput {
  applicationId: string;
  targetStatus: ApplicationStatus;
  actor: AdminUser;
  notes?: string;
  rejectionReason?: string;
}

export class TransitionStatusUseCase {
  constructor(
    private readonly applicationRepo: IApplicationRepository,
    private readonly applicantRepo: IApplicantRepository,
    private readonly requirementRepo: IRequirementRepository,
    private readonly documentRepo: IDocumentRepository,
    private readonly programRepo: IProgramRepository,
    private readonly auditLogRepo: IAuditLogRepository,
    private readonly emailService: IEmailNotificationService
  ) {}

  public async execute(input: TransitionStatusInput): Promise<Application> {
    const app = await this.applicationRepo.findById(input.applicationId);
    if (!app) {
      throw new NotFoundError(`Application ${input.applicationId} was not found.`);
    }

    const applicant = await this.applicantRepo.findById(app.applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant record not found.');
    }

    const program = await this.programRepo.findById(app.programId);

    // Verify document status if attempting approval
    let allDocumentsVerified = true;
    if (input.targetStatus === ApplicationStatus.APPROVED) {
      const requirements = await this.requirementRepo.getRequirementsForProgram(app.programId);
      const mandatoryRequirements = requirements.filter((r) => r.isMandatory);
      const uploadedDocs = await this.documentRepo.findByApplicationId(app.id);

      for (const req of mandatoryRequirements) {
        const doc = uploadedDocs.find((d) => d.requirementId === req.id);
        if (!doc || doc.verificationStatus !== 'VERIFIED') {
          allDocumentsVerified = false;
          break;
        }
      }
    }

    // Validate state transition through domain state machine
    ApplicationStateMachine.validateTransition(app.status, input.targetStatus, {
      performedByRole: input.actor.role,
      allDocumentsVerified,
      revisionNotes: input.notes,
      rejectionReason: input.rejectionReason,
    });

    const updates: Partial<Application> = {
      status: input.targetStatus,
      reviewedAt: new Date(),
      reviewedByUserId: input.actor.id,
    };

    if (input.targetStatus === ApplicationStatus.NEEDS_REVISION && input.notes) {
      updates.revisionNotes = input.notes;
    }

    if (input.targetStatus === ApplicationStatus.REJECTED && input.rejectionReason) {
      updates.rejectionReason = input.rejectionReason;
    }

    const updated = await this.applicationRepo.update(app.id, updates);
    if (!updated) {
      throw new Error('Failed to update application status.');
    }

    // Write audit log
    await this.auditLogRepo.create({
      actorType: input.actor.role,
      actorId: input.actor.id,
      actorEmail: input.actor.email,
      action: `STATUS_CHANGED_TO_${input.targetStatus}`,
      entityType: 'APPLICATION',
      entityId: updated.id,
      metadata: {
        previousStatus: app.status,
        targetStatus: input.targetStatus,
        notes: input.notes,
        rejectionReason: input.rejectionReason,
      },
    });

    // Send notifications
    const magicLinkUrl = `${process.env.APP_URL || 'http://localhost:3000'}/status?reference=${updated.referenceNumber}&token=${updated.accessToken}`;
    const baseEmailParams = {
      recipientEmail: applicant.email,
      recipientName: `${applicant.firstName} ${applicant.lastName}`,
      referenceNumber: updated.referenceNumber,
      magicLinkUrl,
      programName: program?.name || 'Academic Program',
    };

    if (input.targetStatus === ApplicationStatus.NEEDS_REVISION && input.notes) {
      await this.emailService.sendRevisionRequested({
        ...baseEmailParams,
        revisionNotes: input.notes,
      });
    } else if (input.targetStatus === ApplicationStatus.APPROVED) {
      await this.emailService.sendApplicationApproved(baseEmailParams);
    } else if (input.targetStatus === ApplicationStatus.REJECTED && input.rejectionReason) {
      await this.emailService.sendApplicationRejected({
        ...baseEmailParams,
        reason: input.rejectionReason,
      });
    }

    logger.info(
      `Status for application ${updated.referenceNumber} transitioned from ${app.status} to ${input.targetStatus} by ${input.actor.email}`
    );

    return updated;
  }
}
