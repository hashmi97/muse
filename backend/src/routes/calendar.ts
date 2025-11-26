import { Router } from 'express';
import { prisma } from '../prisma';
import { ok, fail } from '../http';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

const router = Router();

async function getActiveCoupleId(userId: number) {
  const membership = await prisma.couple_members.findFirst({
    where: { user_id: userId, status: 'active' },
    orderBy: { created_at: 'asc' }
  });
  return membership?.couple_id ?? null;
}

router.use(requireAuth);

// Get events for calendar (includes engagement if present)
router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const coupleId = await getActiveCoupleId(userId);
  if (!coupleId) return fail(res, 404, 'No active couple membership found');

  const events = await prisma.events.findMany({
    where: { couple_id: coupleId },
    include: { event_type: true },
    orderBy: { start_date: 'asc' }
  });

  return ok(res, events);
});

export default router;
