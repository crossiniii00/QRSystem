import { NotFoundError } from '../../../lib/errors/domain-errors';
import { Logger } from '../../../lib/logging/logger';
import { ApplicantInput } from '../../applicants/domain/applicant.entity';
import { IApplicantRepository } from '../../applicants/infrastructure/applicant.repository';
import { IAuditLogRepository } from '../../audit/infrastructure/audit-log.repository';
import { IProgramRepository } from '../../programs/infrastructure/program.repository';
import { IQRCampaignRepository } from '../../qr-campaigns/infrastructure/qr-campaign.repository';
import { ApplicationStatus } from '../domain/application-status.enum';
import { ApplicantType, Application } from '../domain/application.entity';
import { IApplicationRepository } from '../infrastructure/application.repository';

const logger = new Logger('CreateDraftApplicationUseCase');

export interface CreateDraftApplicationInput {
  applicant: ApplicantInput;
  programId: string;
  applicantType: ApplicantType;
  academicYear: string;
  semesterTerm: string;
  previousSchool?: string;
  previousSchoolAddress?: string;
  previousGpa?: string;
  campaignCode?: string;
}

export class CreateDraftApplicationUseCase {
  constructor(
    private readonly applicationRepo: IApplicationRepository,
    private readonly applicantRepo: IApplicantRepository,
    private readonly programRepo: IProgramRepository,
    private readonly campaignRepo: IQRCampaignRepository,
    private readonly auditLogRepo: IAuditLogRepository
  ) {}

  public async execute(input: CreateDraftApplicationInput): Promise<{
    application: Application;
    plainAccessToken: string;
  }> {
    const program = await this.programRepo.findById(input.programId);
    if (!program) {
      throw new NotFoundError(`Program with ID ${input.programId} not found.`);
    }

    // Check optional QR campaign
    let qrCampaignId: string | undefined = undefined;
    if (input.campaignCode) {
      const campaign = await this.campaignRepo.findByCode(input.campaignCode);
      if (campaign && campaign.isActive) {
        qrCampaignId = campaign.id;
        await this.campaignRepo.incrementScanCount(campaign.id);
      }
    }

    // Persist applicant record
    const applicant = await this.applicantRepo.create(input.applicant);

    // Create draft application
    const { application, plainToken } = await this.applicationRepo.create({
      applicantId: applicant.id,
      programId: program.id,
      qrCampaignId,
      applicantType: input.applicantType,
      academicYear: input.academicYear,
      semesterTerm: input.semesterTerm,
      previousSchool: input.previousSchool,
      previousSchoolAddress: input.previousSchoolAddress,
      previousGpa: input.previousGpa,
      status: ApplicationStatus.DRAFT,
    });

    // Record audit entry
    await this.auditLogRepo.create({
      actorType: 'STUDENT',
      actorId: applicant.id,
      actorEmail: applicant.email,
      action: 'APPLICATION_DRAFT_CREATED',
      entityType: 'APPLICATION',
      entityId: application.id,
      metadata: {
        referenceNumber: application.referenceNumber,
        programCode: program.code,
        qrCampaignId,
      },
    });

    logger.info(`Draft application created: ${application.referenceNumber} for ${applicant.email}`);

    return {
      application,
      plainAccessToken: plainToken,
    };
  }
}
