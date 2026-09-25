import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../lib/errors/domain-errors';
import { Logger } from '../../lib/logging/logger';

const logger = new Logger('ErrorMiddleware');

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    logger.warn(`Handled application error on [${req.method}] ${req.path}: ${err.message}`, {
      code: err.code,
      details: err.details,
    });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
      },
      meta: { timestamp, path: req.path },
    });
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    const summary = issues.map((i) => `${i.path ? i.path + ': ' : ''}${i.message}`).join(', ');
    logger.warn(`Zod validation error on [${req.method}] ${req.path}`, {
      issues: err.issues,
    });
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: summary || 'Submitted data failed validation constraints.',
        details: { issues },
      },
      meta: { timestamp, path: req.path },
    });
  }

  const unexpected = err as Error;
  logger.error(`Unhandled internal server error on [${req.method}] ${req.path}: ${unexpected.message}`, {
    stack: unexpected.stack,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected system error occurred while processing your request.',
    },
    meta: { timestamp, path: req.path },
  });
}
