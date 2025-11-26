import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from './config';

const ACCESS_EXPIRES_IN = '30m';
const REFRESH_EXPIRES_IN = '7d';
const REFRESH_COOKIE_NAME = 'muse_refresh_token';

export type AccessTokenPayload = { userId: number };

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.refreshTokenSecret, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.refreshTokenSecret) as AccessTokenPayload;
}

export function setRefreshCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearRefreshCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd
  });
}

export { REFRESH_COOKIE_NAME };
