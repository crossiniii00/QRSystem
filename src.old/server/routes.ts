import express, { Router } from 'express';
import { adminRouter } from './controllers/admin.controller';
import { applicationsRouter } from './controllers/applications.controller';
import { campaignsRouter } from './controllers/campaigns.controller';
import { programsRouter } from './controllers/programs.controller';
import { paymentsRouter } from './controllers/payments.controller';
import { bankingRouter } from './controllers/banking.controller';
import { errorHandler } from './middleware/error.middleware';

export const apiRouter = Router();

// Configure JSON body parser with 10MB limit for file uploads (base64)
apiRouter.use(express.json({ limit: '10mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount sub-routers
apiRouter.use('/programs', programsRouter);
apiRouter.use('/campaigns', campaignsRouter);
apiRouter.use('/applications', applicationsRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/banking', bankingRouter);
apiRouter.use('/admin', adminRouter);

// Error handler
apiRouter.use(errorHandler);
