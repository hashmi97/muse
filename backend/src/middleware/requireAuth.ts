import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { fail } from '../http';

export type AuthenticatedRequest = Request & { userId?: number };

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return fail(res, 401, 'Missing Authorization header');
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return fail(res, 401, 'Invalid Authorization header');
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return fail(res, 401, 'Invalid or expired token');
  }
}
