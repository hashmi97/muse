import { Router } from 'express';
import { prisma } from '../prisma';
import { fail, ok } from '../http';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

const router = Router();

const EXCLUDED_ONBOARDING_KEYS = ['engagement'];

async function getActiveCoupleId(userId: number) {
  const membership = await prisma.couple_members.findFirst({
    where: { user_id: userId, status: 'active' },
    orderBy: { created_at: 'asc' }
  });
  return membership?.couple_id ?? null;
}

router.use(requireAuth);

// List event types; onboardingOnly excludes engagement
router.get('/types', async (req, res) => {
  const onboardingOnly = String(req.query.onboardingOnly || '').toLowerCase() === 'true';
  const where = onboardingOnly ? { key: { notIn: EXCLUDED_ONBOARDING_KEYS } } : undefined;
  const types = await prisma.event_types.findMany({ where, orderBy: { id: 'asc' } });
  return ok(res, types);
});

// List events for the authenticated user's couple
router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const coupleId = await getActiveCoupleId(userId);
  if (!coupleId) {
    return fail(res, 404, 'No active couple membership found');
  }

  const events = await prisma.events.findMany({
    where: { couple_id: coupleId },
    include: { event_type: true, mood_board: true }
  });

  return ok(res, events);
});

// Upsert event selections for onboarding
router.post('/selection', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const coupleId = await getActiveCoupleId(userId);
  if (!coupleId) {
    return fail(res, 404, 'No active couple membership found');
  }

  const selections = req.body?.selections as
    | Array<{
        eventTypeKey: string;
        title?: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        enableMoodBoard?: boolean;
      }>
    | undefined;

  if (!Array.isArray(selections) || selections.length === 0) {
    return fail(res, 400, 'selections array is required');
  }

  const typeKeys = selections.map((s) => s.eventTypeKey);
  const types = await prisma.event_types.findMany({ where: { key: { in: typeKeys } } });
  const typesByKey = new Map(types.map((t) => [t.key, t]));

  // Process selected events
  const results = [] as any[];
  for (const sel of selections) {
    if (EXCLUDED_ONBOARDING_KEYS.includes(sel.eventTypeKey)) {
      continue; // skip engagement
    }
    const type = typesByKey.get(sel.eventTypeKey);
    if (!type) continue;

    const existing = await prisma.events.findFirst({
      where: { couple_id: coupleId, event_type_id: type.id }
    });

    const data = {
      couple_id: coupleId,
      event_type_id: type.id,
      title: sel.title || existing?.title || type.name_en,
      description: sel.description ?? existing?.description ?? null,
      start_date: sel.start_date ? new Date(sel.start_date) : existing?.start_date,
      end_date: sel.end_date ? new Date(sel.end_date) : existing?.end_date,
      is_active: true
    } as const;

    const event = existing
      ? await prisma.events.update({ where: { id: existing.id }, data })
      : await prisma.events.create({ data });

    const moodEnabled =
      typeof sel.enableMoodBoard === 'boolean'
        ? sel.enableMoodBoard
        : type.default_moodboard_enabled;

    if (moodEnabled !== undefined) {
      await prisma.mood_boards.upsert({
        where: { event_id: event.id },
        update: { is_enabled: moodEnabled },
        create: { event_id: event.id, is_enabled: moodEnabled }
      });
    }

    results.push(event);
  }

  // Deactivate non-selected (except engagement)
  const selectedKeys = new Set(selections.map((s) => s.eventTypeKey));
  await prisma.events.updateMany({
    where: {
      couple_id: coupleId,
      event_type: { key: { notIn: EXCLUDED_ONBOARDING_KEYS } },
      NOT: { event_type: { key: { in: Array.from(selectedKeys) } } }
    },
    data: { is_active: false }
  });

  const updatedEvents = await prisma.events.findMany({
    where: { couple_id: coupleId },
    include: { event_type: true, mood_board: true }
  });

  return ok(res, updatedEvents);
});

export default router;
