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

// List mood board items for an event
router.get('/:eventId', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const coupleId = await getActiveCoupleId(userId);
  if (!coupleId) return fail(res, 404, 'No active couple membership found');

  const eventId = Number(req.params.eventId);
  const event = await prisma.events.findFirst({ where: { id: eventId, couple_id: coupleId } });
  if (!event) return fail(res, 404, 'Event not found');

  const board = await prisma.mood_boards.findUnique({
    where: { event_id: eventId },
    include: {
      items: {
        include: {
          media: true,
          reactions: true
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  return ok(res, board || null);
});

// Create a mood board item (metadata only; file upload to be added later)
router.post('/:eventId/items', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const coupleId = await getActiveCoupleId(userId);
  if (!coupleId) return fail(res, 404, 'No active couple membership found');

  const eventId = Number(req.params.eventId);
  const event = await prisma.events.findFirst({ where: { id: eventId, couple_id: coupleId } });
  if (!event) return fail(res, 404, 'Event not found');

  const { media_id, caption, position } = req.body || {};
  if (!media_id) return fail(res, 400, 'media_id is required');

  const board = await prisma.mood_boards.upsert({
    where: { event_id: eventId },
    update: {},
    create: { event_id: eventId, is_enabled: true }
  });

  const item = await prisma.mood_board_items.create({
    data: {
      mood_board_id: board.id,
      media_id,
      caption: caption ?? null,
      position: position ?? null,
      created_by: userId
    }
  });

  return ok(res, item);
});

// Delete a mood board item
router.delete('/items/:itemId', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const coupleId = await getActiveCoupleId(userId);
  if (!coupleId) return fail(res, 404, 'No active couple membership found');

  const itemId = Number(req.params.itemId);
  const item = await prisma.mood_board_items.findUnique({
    where: { id: itemId },
    include: { mood_board: { include: { event: true } } }
  });

  if (!item || item.mood_board.event.couple_id !== coupleId) {
    return fail(res, 404, 'Item not found');
  }

  await prisma.mood_board_items.delete({ where: { id: itemId } });
  return ok(res, { deleted: true });
});

export default router;
