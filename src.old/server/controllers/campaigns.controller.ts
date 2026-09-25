import { Request, Response, Router } from 'express';
import { NotFoundError } from '../../lib/errors/domain-errors';
import { defaultQRCampaignRepository } from '../../modules/qr-campaigns/infrastructure/qr-campaign.repository';

export const campaignsRouter = Router();

// GET /api/campaigns/resolve?code=:code
campaignsRouter.get('/resolve', async (req: Request, res: Response, next) => {
  try {
    const code = String(req.query.code || '').trim();
    if (!code) {
      throw new NotFoundError('Campaign code is required.');
    }

    const campaign = await defaultQRCampaignRepository.findByCode(code);
    if (!campaign || !campaign.isActive) {
      throw new NotFoundError(`No active QR campaign found for code: "${code}".`);
    }

    await defaultQRCampaignRepository.incrementScanCount(campaign.id);

    res.json({
      success: true,
      data: {
        id: campaign.id,
        code: campaign.code,
        name: campaign.name,
        destinationPath: campaign.destinationPath,
        defaultProgramId: campaign.defaultProgramId,
      },
    });
  } catch (err) {
    next(err);
  }
});
