import { NotFoundError, UnauthorizedError } from '../../../lib/errors/domain-errors';
import { SecurityUtils } from '../../../lib/security/token';
import { IStorageService } from '../../../lib/storage/storage.service';
import { Applicant } from '../../applicants/domain/applicant.entity';
import { IApplicantRepository } from '../../applicants/infrastructure/applicant.repository';
import { DocumentRecord } from '../../documents/domain/document.entity';
import { IDocumentRepository } from '../../documents/infrastructure/document.repository';
import { Program } from '../../programs/domain/program.entity';
import { IProgramRepository } from '../../programs/infrastructure/program.repository';
import { Requirement } from '../../requirements/domain/requirement.entity';
import { IRequirementRepository } from '../../requirements/infrastructure/requirement.repository';
import { Application } from '../domain/application.entity';
import { IApplicationRepository } from '../infrastructure/application.repository';

export interface ApplicationStatusView {
  application: Application;
  applicant: Applicant;
  program: Program;
  requirements: Array<{
    requirement: Requirement;
    uploadedDocument?: DocumentRecord & { signedUrl?: string };
    isSatisfied: boolean;
  }>;
}

export class TrackApplicationStatusUseCase {
  constructor(
    private readonly applicationRepo: IApplicationRepository,
    private readonly applicantRepo: IApplicantRepository,
    private readonly programRepo: IProgramRepository,
    private readonly requirementRepo: IRequirementRepository,
    private readonly documentRepo: IDocumentRepository,
    private readonly storageService: IStorageService
  ) {}

  public async execute(referenceNumber: string, token: string): Promise<ApplicationStatusView> {
    const app = await this.applicationRepo.findByReferenceNumber(referenceNumber);
    if (!app) {
      throw new NotFoundError(`No application found matching reference ${referenceNumber}.`);
    }

    const tokenHash = SecurityUtils.hashToken(token);
    if (app.accessTokenHash !== tokenHash) {
      throw new UnauthorizedError('Invalid access token provided for this application reference.');
    }

    const applicant = await this.applicantRepo.findById(app.applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant record not found.');
    }

    const program = await this.programRepo.findById(app.programId);
    if (!program) {
      throw new NotFoundError('Program record not found.');
    }

    const requirements = await this.requirementRepo.getRequirementsForProgram(app.programId);
    const uploadedDocs = await this.documentRepo.findByApplicationId(app.id);

    const requirementViews = await Promise.all(
      requirements.map(async (req) => {
        const doc = uploadedDocs.find((d) => d.requirementId === req.id);
        let signedUrl: string | undefined = undefined;
        if (doc) {
          signedUrl = await this.storageService.getSignedUrl(doc.storageKey);
        }

        const isSatisfied = !!doc && doc.verificationStatus !== 'REJECTED';

        return {
          requirement: req,
          uploadedDocument: doc ? { ...doc, signedUrl } : undefined,
          isSatisfied,
        };
      })
    );

    return {
      application: app,
      applicant,
      program,
      requirements: requirementViews,
    };
  }
}
