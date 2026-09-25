import crypto from 'crypto';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { defaultEmailService } from '../../lib/email/email.service';
import { UnauthorizedError, ValidationError } from '../../lib/errors/domain-errors';
import { SecurityUtils } from '../../lib/security/token';
import { defaultStorageService } from '../../lib/storage/storage.service';
import { defaultApplicantRepository } from '../../modules/applicants/infrastructure/applicant.repository';
import { GetApplicationDetailsUseCase } from '../../modules/applications/application/get-application-details.use-case';
import { TransitionStatusUseCase } from '../../modules/applications/application/transition-status.use-case';
import { ApplicationStatus } from '../../modules/applications/domain/application-status.enum';
import { defaultApplicationRepository } from '../../modules/applications/infrastructure/application.repository';
import { defaultAuditLogRepository } from '../../modules/audit/infrastructure/audit-log.repository';
import { defaultUserRepository } from '../../modules/authentication/infrastructure/user.repository';
import { VerifyDocumentUseCase } from '../../modules/documents/application/verify-document.use-case';
import { defaultDocumentRepository } from '../../modules/documents/infrastructure/document.repository';
import { defaultProgramRepository } from '../../modules/programs/infrastructure/program.repository';
import { defaultQRCampaignRepository } from '../../modules/qr-campaigns/infrastructure/qr-campaign.repository';
import { defaultRequirementRepository } from '../../modules/requirements/infrastructure/requirement.repository';
import { authenticateAdmin, requireRole, sessionStore } from '../middleware/auth.middleware';

export const adminRouter = Router();

// Instantiate Use Cases
const transitionUseCase = new TransitionStatusUseCase(
  defaultApplicationRepository,
  defaultApplicantRepository,
  defaultRequirementRepository,
  defaultDocumentRepository,
  defaultProgramRepository,
  defaultAuditLogRepository,
  defaultEmailService
);

const verifyDocUseCase = new VerifyDocumentUseCase(
  defaultDocumentRepository,
  defaultAuditLogRepository
);

const getAppDetailUseCase = new GetApplicationDetailsUseCase(
  defaultApplicationRepository,
  defaultApplicantRepository,
  defaultProgramRepository,
  defaultRequirementRepository,
  defaultDocumentRepository,
  defaultAuditLogRepository,
  defaultStorageService
);

// POST /api/admin/auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

adminRouter.post('/auth/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await defaultUserRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isValid = SecurityUtils.verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    sessionStore.set(sessionToken, {
      userId: user.id,
      expiresAt,
    });

    await defaultAuditLogRepository.create({
      actorType: user.role,
      actorId: user.id,
      actorEmail: user.email,
      action: 'ADMIN_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// All routes below require admin authentication
adminRouter.use(authenticateAdmin);

// GET /api/admin/auth/me
adminRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.user!.id,
      email: req.user!.email,
      fullName: req.user!.fullName,
      role: req.user!.role,
    },
  });
});

// GET /api/admin/dashboard/stats
adminRouter.get('/dashboard/stats', async (req: Request, res: Response, next) => {
  try {
    const counts = await defaultApplicationRepository.countByStatus();
    const totalApplications = Object.values(counts).reduce((a, b) => a + b, 0);
    const recentAudits = await defaultAuditLogRepository.findAll(10);
    const campaigns = await defaultQRCampaignRepository.findAll();
    const totalScans = campaigns.reduce((acc, c) => acc + c.scanCount, 0);

    res.json({
      success: true,
      data: {
        counts,
        totalApplications,
        totalScans,
        activeCampaignsCount: campaigns.filter((c) => c.isActive).length,
        recentAudits,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/applications
adminRouter.get('/applications', async (req: Request, res: Response, next) => {
  try {
    const status = req.query.status as ApplicationStatus | undefined;
    const programId = req.query.programId as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const { applications, total } = await defaultApplicationRepository.findAll({
      status,
      programId,
      search,
      limit,
      offset,
    });

    // Enrich with applicant demographic summary and program name
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const applicant = await defaultApplicantRepository.findById(app.applicantId);
        const program = await defaultProgramRepository.findById(app.programId);
        return {
          ...app,
          applicantName: applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown',
          applicantEmail: applicant?.email || '',
          applicantMobile: applicant?.mobileNumber || '',
          programName: program?.name || 'Unknown Program',
          programCode: program?.code || '',
        };
      })
    );

    res.json({
      success: true,
      data: {
        applications: enriched,
        total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/applications/:id
adminRouter.get('/applications/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const details = await getAppDetailUseCase.execute(id);
    res.json({
      success: true,
      data: details,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/applications/:id/transition
const transitionSchema = z.object({
  targetStatus: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

adminRouter.post('/applications/:id/transition', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const body = transitionSchema.parse(req.body);

    const updated = await transitionUseCase.execute({
      applicationId: id,
      targetStatus: body.targetStatus,
      actor: req.user!,
      notes: body.notes,
      rejectionReason: body.rejectionReason,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/applications/:id/documents/:docId/verify
const verifySchema = z.object({
  action: z.enum(['VERIFY', 'REJECT']),
  reason: z.string().optional(),
});

adminRouter.post('/applications/:id/documents/:docId/verify', async (req: Request, res: Response, next) => {
  try {
    const { docId } = req.params;
    const body = verifySchema.parse(req.body);

    const verified = await verifyDocUseCase.execute({
      documentId: docId,
      action: body.action,
      actor: req.user!,
      rejectionReason: body.reason,
    });

    res.json({
      success: true,
      data: verified,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/campaigns
adminRouter.get('/campaigns', async (req: Request, res: Response, next) => {
  try {
    const campaigns = await defaultQRCampaignRepository.findAll();
    res.json({
      success: true,
      data: campaigns,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/campaigns (Admin only)
const createCampaignSchema = z.object({
  code: z.string().min(2).max(60),
  name: z.string().min(3).max(120),
  description: z.string().optional(),
  destinationPath: z.string().default('/apply'),
  defaultProgramId: z.string().optional(),
});

adminRouter.post('/campaigns', requireRole(['ADMIN']), async (req: Request, res: Response, next) => {
  try {
    const body = createCampaignSchema.parse(req.body);
    const existing = await defaultQRCampaignRepository.findByCode(body.code);
    if (existing) {
      throw new ValidationError(`Campaign with code "${body.code}" already exists.`);
    }

    const campaign = await defaultQRCampaignRepository.create({
      code: body.code.toLowerCase().trim(),
      name: body.name,
      description: body.description,
      destinationPath: body.destinationPath,
      defaultProgramId: body.defaultProgramId,
      isActive: true,
    });

    await defaultAuditLogRepository.create({
      actorType: 'ADMIN',
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      action: 'QR_CAMPAIGN_CREATED',
      entityType: 'QR_CAMPAIGN',
      entityId: campaign.id,
      metadata: { code: campaign.code, name: campaign.name },
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit
adminRouter.get('/audit', async (req: Request, res: Response, next) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = await defaultAuditLogRepository.findAll(limit);
    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/emails (View simulated sent transactional notifications)
adminRouter.get('/emails', async (req: Request, res: Response, next) => {
  try {
    const recipient = req.query.recipient as string | undefined;
    const emails = defaultEmailService.getSentEmails(recipient);
    res.json({
      success: true,
      data: emails,
    });
  } catch (err) {
    next(err);
  }
});
