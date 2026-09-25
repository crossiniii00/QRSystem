import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { defaultEmailService } from '../../lib/email/email.service';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../lib/errors/domain-errors';
import { defaultStorageService } from '../../lib/storage/storage.service';
import { applicantSchema } from '../../modules/applicants/domain/applicant.entity';
import { defaultApplicantRepository } from '../../modules/applicants/infrastructure/applicant.repository';
import { CreateDraftApplicationUseCase } from '../../modules/applications/application/create-draft-application.use-case';
import { SubmitApplicationUseCase } from '../../modules/applications/application/submit-application.use-case';
import { TrackApplicationStatusUseCase } from '../../modules/applications/application/track-application-status.use-case';
import { defaultApplicationRepository } from '../../modules/applications/infrastructure/application.repository';
import { defaultAuditLogRepository } from '../../modules/audit/infrastructure/audit-log.repository';
import { UploadDocumentUseCase } from '../../modules/documents/application/upload-document.use-case';
import { defaultDocumentRepository } from '../../modules/documents/infrastructure/document.repository';
import { defaultProgramRepository } from '../../modules/programs/infrastructure/program.repository';
import { defaultQRCampaignRepository } from '../../modules/qr-campaigns/infrastructure/qr-campaign.repository';
import { defaultRequirementRepository } from '../../modules/requirements/infrastructure/requirement.repository';

export const applicationsRouter = Router();

// Instantiate use cases
const createDraftUseCase = new CreateDraftApplicationUseCase(
  defaultApplicationRepository,
  defaultApplicantRepository,
  defaultProgramRepository,
  defaultQRCampaignRepository,
  defaultAuditLogRepository
);

const trackStatusUseCase = new TrackApplicationStatusUseCase(
  defaultApplicationRepository,
  defaultApplicantRepository,
  defaultProgramRepository,
  defaultRequirementRepository,
  defaultDocumentRepository,
  defaultStorageService
);

const submitAppUseCase = new SubmitApplicationUseCase(
  defaultApplicationRepository,
  defaultApplicantRepository,
  defaultRequirementRepository,
  defaultDocumentRepository,
  defaultProgramRepository,
  defaultAuditLogRepository,
  defaultEmailService
);

const uploadDocUseCase = new UploadDocumentUseCase(
  defaultApplicationRepository,
  defaultRequirementRepository,
  defaultDocumentRepository,
  defaultStorageService,
  defaultAuditLogRepository
);

// POST /api/applications (Create draft)
const draftRequestSchema = z.object({
  applicant: applicantSchema,
  programId: z.string().min(1, 'Program ID is required'),
  applicantType: z.preprocess(
    (v) => (typeof v === 'string' ? v.toUpperCase().trim() : v),
    z.enum(['FRESHMAN', 'TRANSFEREE', 'RETURNEE', 'CROSS_ENROLLEE']).catch('FRESHMAN')
  ),
  academicYear: z.string().default('2026-2027'),
  semesterTerm: z.string().default('1st Semester'),
  previousSchool: z.string().nullish().transform((v) => v || undefined),
  previousSchoolAddress: z.string().nullish().transform((v) => v || undefined),
  previousGpa: z.string().nullish().transform((v) => v || undefined),
  campaignCode: z.string().nullish().transform((v) => v || undefined),
});

applicationsRouter.post('/', async (req: Request, res: Response, next) => {
  try {
    const validated = draftRequestSchema.parse(req.body);
    const result = await createDraftUseCase.execute(validated);

    res.status(201).json({
      success: true,
      data: {
        applicationId: result.application.id,
        referenceNumber: result.application.referenceNumber,
        accessToken: result.plainAccessToken,
        status: result.application.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications/status?reference=:ref&token=:token
applicationsRouter.get('/status', async (req: Request, res: Response, next) => {
  try {
    const reference = String(req.query.reference || '').trim();
    const token = String(req.query.token || '').trim();

    if (!reference || !token) {
      throw new ValidationError('Both reference number and access token are required to check status.');
    }

    const view = await trackStatusUseCase.execute(reference, token);

    res.json({
      success: true,
      data: view,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/applications/:id/documents (Upload document)
const uploadDocSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  requirementId: z.string().min(1, 'Requirement ID is required'),
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileData: z.string().min(1, 'File content base64 is required'),
});

applicationsRouter.post('/:id/documents', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const body = uploadDocSchema.parse(req.body);

    const fileBuffer = Buffer.from(body.fileData, 'base64');

    const documentRecord = await uploadDocUseCase.execute({
      applicationId: id,
      accessToken: body.accessToken,
      requirementId: body.requirementId,
      filename: body.filename,
      mimeType: body.mimeType,
      fileBuffer,
    });

    res.status(201).json({
      success: true,
      data: documentRecord,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/applications/:id/documents/:docId
applicationsRouter.delete('/:id/documents/:docId', async (req: Request, res: Response, next) => {
  try {
    const { id, docId } = req.params;
    const token = String(req.query.token || req.headers['x-access-token'] || '').trim();

    const app = await defaultApplicationRepository.findById(id);
    if (!app) throw new NotFoundError('Application not found.');

    if (app.accessToken !== token) {
      throw new UnauthorizedError('Invalid access token.');
    }

    const doc = await defaultDocumentRepository.findById(docId);
    if (!doc || doc.applicationId !== id) {
      throw new NotFoundError('Document not found for this application.');
    }

    await defaultStorageService.delete(doc.storageKey);
    await defaultDocumentRepository.delete(docId);

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/applications/:id/submit
const submitSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  applicantNotes: z.string().optional(),
});

applicationsRouter.post('/:id/submit', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const body = submitSchema.parse(req.body);

    const updatedApp = await submitAppUseCase.execute({
      applicationId: id,
      accessToken: body.accessToken,
      applicantNotes: body.applicantNotes,
    });

    res.json({
      success: true,
      data: {
        applicationId: updatedApp.id,
        referenceNumber: updatedApp.referenceNumber,
        status: updatedApp.status,
        submittedAt: updatedApp.submittedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});
