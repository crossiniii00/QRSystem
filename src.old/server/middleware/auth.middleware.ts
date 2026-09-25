import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../lib/errors/domain-errors';
import { AdminUser, UserRole } from '../../modules/authentication/domain/user.entity';
import { defaultUserRepository } from '../../modules/authentication/infrastructure/user.repository';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AdminUser;
    }
  }
}

// In-memory token store for sessions
export const sessionStore = new Map<string, { userId: string; expiresAt: number }>();

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers['x-session-token']) {
      token = String(req.headers['x-session-token']);
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing or invalid.');
    }

    const session = sessionStore.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) sessionStore.delete(token);
      throw new UnauthorizedError('Session expired or invalid. Please log in again.');
    }

    defaultUserRepository.findById(session.userId).then((user) => {
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User account is inactive or not found.');
      }
      req.user = user;
      next();
    }).catch(next);
  } catch (err) {
    next(err);
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Action requires role ${allowedRoles.join(' or ')}. Your role is ${req.user.role}.`
        )
      );
    }
    next();
  };
}
