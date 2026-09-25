import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { ValidationError, NotFoundError, UnauthorizedError } from '../../lib/errors/domain-errors';
import { defaultPaymentRepository } from '../../modules/payments/infrastructure/payment.repository';
import { defaultApplicationRepository } from '../../modules/applications/infrastructure/application.repository';
import { defaultAuditLogRepository } from '../../modules/audit/infrastructure/audit-log.repository';
import { defaultApplicantRepository } from '../../modules/applicants/infrastructure/applicant.repository';
import { authenticateAdmin } from '../middleware/auth.middleware';

export const paymentsRouter = Router();

// GET /api/payments/application?reference=:ref&token=:tok
// Public endpoint for applicants to view payments for their application
paymentsRouter.get('/application', async (req: Request, res: Response, next) => {
  try {
    const reference = String(req.query.reference || '').trim();
    const token = String(req.query.token || '').trim();

    if (!reference) {
      throw new ValidationError('Reference number is required');
    }

    const app = await defaultApplicationRepository.findByReferenceNumber(reference);
    if (!app) {
      throw new NotFoundError('Application record not found');
    }

    // If token provided, verify token matches
    if (token) {
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      if (app.accessTokenHash !== hash) {
        throw new UnauthorizedError('Invalid access token for this application.');
      }
    }

    const transactions = await defaultPaymentRepository.findByReferenceNumber(reference);
    res.json({
      success: true,
      data: {
        applicationId: app.id,
        referenceNumber: app.referenceNumber,
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/checkout
// Applicant creates a payment transaction via Dragonpay / E-wallet / Bank
const checkoutSchema = z.object({
  referenceNumber: z.string().min(1),
  accessToken: z.string().min(1),
  paymentType: z.enum(['APPLICATION_ASSESSMENT', 'MATRICULATION_DEPOSIT']),
  channel: z.enum([
    'GCASH',
    'MAYA',
    'DRAGONPAY_ONLINE_BANKING',
    'DRAGONPAY_OTC_NON_BANK',
    'DRAGONPAY_7ELEVEN',
    'BANK_TRANSFER_MANUAL',
  ]),
  amount: z.number().positive(),
  payerName: z.string().min(1),
  payerEmail: z.string().email(),
  payerMobile: z.string().optional(),
  depositSlipFilename: z.string().optional(),
  depositSlipData: z.string().optional(), // base64
});

paymentsRouter.post('/checkout', async (req: Request, res: Response, next) => {
  try {
    const body = checkoutSchema.parse(req.body);
    const app = await defaultApplicationRepository.findByReferenceNumber(body.referenceNumber);
    if (!app) throw new NotFoundError('Application not found.');

    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(body.accessToken).digest('hex');
    if (app.accessTokenHash !== hash) {
      throw new UnauthorizedError('Invalid authorization token.');
    }

    const transaction = await defaultPaymentRepository.create({
      applicationId: app.id,
      referenceNumber: app.referenceNumber,
      paymentType: body.paymentType,
      channel: body.channel,
      amount: body.amount,
      currency: 'PHP',
      payerName: body.payerName,
      payerEmail: body.payerEmail,
      payerMobile: body.payerMobile,
      depositSlipFilename: body.depositSlipFilename,
      depositSlipData: body.depositSlipData,
    });

    // Audit log
    await defaultAuditLogRepository.create({
      actorType: 'STUDENT',
      actorId: app.applicantId,
      actorEmail: body.payerEmail,
      action: 'PAYMENT_SUBMITTED',
      entityType: 'PAYMENT',
      entityId: transaction.id,
      metadata: {
        gatewayRefNo: transaction.gatewayRefNo,
        amount: transaction.amount,
        channel: transaction.channel,
        status: transaction.status,
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
});

// Admin-protected payment routes
// GET /api/payments/admin/all
paymentsRouter.get('/admin/all', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const list = await defaultPaymentRepository.findAll(150);
    res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/admin/:id/verify
paymentsRouter.post('/admin/:id/verify', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const id = req.params.id;
    const adminUser = (req as any).adminUser;

    const tx = await defaultPaymentRepository.findById(id);
    if (!tx) throw new NotFoundError('Payment transaction not found.');

    const updated = await defaultPaymentRepository.updateStatus(id, 'VERIFIED', adminUser?.id || 'admin');

    await defaultAuditLogRepository.create({
      actorType: adminUser?.role || 'ADMIN',
      actorId: adminUser?.id || 'admin',
      actorEmail: adminUser?.email,
      action: 'PAYMENT_VERIFIED',
      entityType: 'PAYMENT',
      entityId: id,
      metadata: {
        referenceNumber: tx.referenceNumber,
        gatewayRefNo: tx.gatewayRefNo,
        amount: tx.amount,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});
