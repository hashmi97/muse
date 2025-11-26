import { Router } from 'express';
import { prisma } from '../prisma';
import { fail, ok } from '../http';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  verifyRefreshToken
} from '../auth';

const router = Router();

const sanitizeUser = (user: { id: number; email: string; full_name: string; role: string }) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role
});

router.post('/signup', async (req, res) => {
  const { email, password, full_name, couple_name } = req.body || {};

  if (!email || !password || !full_name) {
    return fail(res, 400, 'email, password, and full_name are required');
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    return fail(res, 409, 'Email already in use');
  }

  const password_hash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        email,
        password_hash,
        full_name,
        role: 'other'
      }
    });

    const couple = await tx.couples.create({
      data: {
        name: couple_name || `${full_name}'s Wedding`,
        language_pref: 'en'
      }
    });

    await tx.couple_members.create({
      data: {
        couple_id: couple.id,
        user_id: user.id,
        role: 'editor',
        is_owner: true,
        status: 'active'
      }
    });

    return { user, couple };
  });

  const accessToken = signAccessToken({ userId: result.user.id });
  const refreshToken = signRefreshToken({ userId: result.user.id });
  setRefreshCookie(res, refreshToken);

  return ok(res, {
    accessToken,
    user: sanitizeUser(result.user),
    couple: result.couple
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return fail(res, 400, 'email and password are required');
  }

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return fail(res, 401, 'Invalid credentials');
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return fail(res, 401, 'Invalid credentials');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  setRefreshCookie(res, refreshToken);

  return ok(res, {
    accessToken,
    user: sanitizeUser(user)
  });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.muse_refresh_token;
  if (!token) {
    return fail(res, 401, 'Missing refresh token');
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.users.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return fail(res, 401, 'User not found');
    }
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });
    setRefreshCookie(res, refreshToken);
    return ok(res, { accessToken, user: sanitizeUser(user) });
  } catch (err) {
    return fail(res, 401, 'Invalid refresh token');
  }
});

router.post('/logout', async (_req, res) => {
  clearRefreshCookie(res);
  return ok(res, { message: 'Logged out' });
});

export default router;
