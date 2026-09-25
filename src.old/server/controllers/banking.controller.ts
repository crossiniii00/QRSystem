import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { NotFoundError, ValidationError } from '../../lib/errors/domain-errors';
import { defaultAuditLogRepository } from '../../modules/audit/infrastructure/audit-log.repository';
import { defaultBankAccountRepository } from '../../modules/banking/infrastructure/bank-account.repository';
import { authenticateAdmin } from '../middleware/auth.middleware';

export const bankingRouter = Router();

// ----------------------------------------------------
// PUBLIC: GET /api/banking/accounts
// Used by student checkout wizard to show verified school depository accounts
// ----------------------------------------------------
bankingRouter.get('/accounts', async (_req: Request, res: Response, next) => {
  try {
    const activeAccounts = await defaultBankAccountRepository.getActive();
    res.json({ accounts: activeAccounts });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ADMIN: GET /api/banking/admin/accounts
// Full list of accounts including inactive ones
// ----------------------------------------------------
bankingRouter.get('/admin/accounts', authenticateAdmin, async (_req: Request, res: Response, next) => {
  try {
    const accounts = await defaultBankAccountRepository.getAll();
    const gatewayConfig = await defaultBankAccountRepository.getGatewayConfig();
    res.json({ accounts, gatewayConfig });
  } catch (error) {
    next(error);
  }
});

// Validation Schemas
const bankAccountSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(3, 'Account number is required'),
  accountType: z.enum(['TUITION_MATRICULATION', 'APPLICATION_FEES', 'GENERAL_OPERATING', 'SCHOLARSHIP_ESCROW']),
  branchName: z.string().optional(),
  swiftCode: z.string().optional(),
  qrPhData: z.string().optional(),
  depositInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ----------------------------------------------------
// ADMIN: POST /api/banking/admin/accounts
// Create new institutional bank account
// ----------------------------------------------------
bankingRouter.post('/admin/accounts', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const parsed = bankAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const created = await defaultBankAccountRepository.create(parsed.data);

    // Audit log
    await defaultAuditLogRepository.create({
      actorType: 'ADMIN',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@stfrancis.edu',
      action: 'BANK_ACCOUNT_CREATED',
      entityType: 'BANK_ACCOUNT',
      entityId: created.id,
      metadata: {
        bankName: created.bankName,
        accountNumber: created.accountNumber,
        accountType: created.accountType,
      },
    });

    res.status(201).json({ account: created });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ADMIN: PUT /api/banking/admin/accounts/:id
// Update bank account details or status
// ----------------------------------------------------
bankingRouter.put('/admin/accounts/:id', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const id = req.params.id;
    const updateSchema = bankAccountSchema.partial().extend({
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const updated = await defaultBankAccountRepository.update(id, parsed.data);
    if (!updated) {
      throw new NotFoundError(`Bank account ${id} not found.`);
    }

    // Audit log
    await defaultAuditLogRepository.create({
      actorType: 'ADMIN',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@stfrancis.edu',
      action: 'BANK_ACCOUNT_UPDATED',
      entityType: 'BANK_ACCOUNT',
      entityId: updated.id,
      metadata: {
        bankName: updated.bankName,
        status: updated.status,
        isDefault: updated.isDefault,
      },
    });

    res.json({ account: updated });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ADMIN: DELETE /api/banking/admin/accounts/:id
// Delete bank account
// ----------------------------------------------------
bankingRouter.delete('/admin/accounts/:id', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const id = req.params.id;
    const existing = await defaultBankAccountRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Bank account ${id} not found.`);
    }

    await defaultBankAccountRepository.delete(id);

    // Audit log
    await defaultAuditLogRepository.create({
      actorType: 'ADMIN',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@stfrancis.edu',
      action: 'BANK_ACCOUNT_DELETED',
      entityType: 'BANK_ACCOUNT',
      entityId: id,
      metadata: {
        bankName: existing.bankName,
        accountNumber: existing.accountNumber,
      },
    });

    res.json({ success: true, message: 'Bank account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ADMIN: GET /api/banking/admin/gateway-config
// Get settlement gateway configuration
// ----------------------------------------------------
bankingRouter.get('/admin/gateway-config', authenticateAdmin, async (_req: Request, res: Response, next) => {
  try {
    const config = await defaultBankAccountRepository.getGatewayConfig();
    res.json({ gatewayConfig: config });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ADMIN: PUT /api/banking/admin/gateway-config
// Update settlement gateway configuration
// ----------------------------------------------------
bankingRouter.put('/admin/gateway-config', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const schema = z.object({
      merchantId: z.string().min(1).optional(),
      merchantName: z.string().min(1).optional(),
      environment: z.enum(['SANDBOX', 'PRODUCTION']).optional(),
      primarySettlementBankId: z.string().optional(),
      autoSettlementFrequency: z.enum(['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY']).optional(),
      minimumPayoutThreshold: z.number().min(0).optional(),
      notifyFinanceEmail: z.string().email().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const updated = await defaultBankAccountRepository.updateGatewayConfig(parsed.data);

    // Audit log
    await defaultAuditLogRepository.create({
      actorType: 'ADMIN',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@stfrancis.edu',
      action: 'GATEWAY_CONFIG_UPDATED',
      entityType: 'SETTLEMENT_CONFIG',
      entityId: 'dragonpay-settlement',
      metadata: parsed.data,
    });

    res.json({ gatewayConfig: updated });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// ADMIN: POST /api/banking/admin/simulate-settlement
// Trigger a manual settlement sweep to depository account
// ----------------------------------------------------
bankingRouter.post('/admin/simulate-settlement', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const config = await defaultBankAccountRepository.getGatewayConfig();
    const targetBank = await defaultBankAccountRepository.findById(config.primarySettlementBankId);
    const now = new Date();

    const updatedConfig = await defaultBankAccountRepository.updateGatewayConfig({
      lastSettlementAt: now,
      nextScheduledSettlementAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });

    await defaultAuditLogRepository.create({
      actorType: 'ADMIN',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@stfrancis.edu',
      action: 'SETTLEMENT_SWEEP_EXECUTED',
      entityType: 'SETTLEMENT_BATCH',
      entityId: `SWEEP-${Date.now()}`,
      metadata: {
        targetBank: targetBank ? `${targetBank.bankName} (${targetBank.accountNumber})` : 'Default Depository',
        status: 'SUCCESS',
        sweptAt: now.toISOString(),
      },
    });

    res.json({
      success: true,
      message: `Dragonpay settlement sweep executed successfully to ${targetBank?.bankName || 'primary account'}.`,
      gatewayConfig: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
});
