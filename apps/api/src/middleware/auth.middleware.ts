import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.js';
import { User, IUserDocument } from '../models/User.js';
import { AppError } from './errorHandler.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      jwtPayload?: JwtPayload;
    }
  }
}

/**
 * Middleware to verify JWT access token and attach user to request.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account has been deactivated', 403);
    }

    req.user = user;
    req.jwtPayload = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    // JWT errors (expired, malformed, etc.)
    next(new AppError('Invalid or expired token', 401));
  }
}

/**
 * Optional authentication - attaches user if token is present, but doesn't block.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (user && user.isActive) {
      req.user = user;
      req.jwtPayload = payload;
    }

    next();
  } catch {
    // Silently continue without user if token is invalid
    next();
  }
}
