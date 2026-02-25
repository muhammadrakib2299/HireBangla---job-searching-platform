import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@job-platform/shared-types';
import { AppError } from './errorHandler.js';

/**
 * Middleware to restrict access to specific roles.
 * Must be used after authenticate middleware.
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
}
