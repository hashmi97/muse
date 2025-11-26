import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';
import supertest from 'supertest';

export const prisma = new PrismaClient();
export const app = createApp();
export const request = () => supertest(app);

const eventTypes = [
  { key: 'engagement', name_en: 'Engagement', default_color_hex: '#f3b6c0', default_moodboard_enabled: false },
  { key: 'malka', name_en: 'Malka', default_color_hex: '#f3c7c0', default_moodboard_enabled: true },
  { key: 'henna_night', name_en: 'Henna Night', default_color_hex: '#f3d8c0', default_moodboard_enabled: true },
  { key: 'bride_prep', name_en: 'Bride Preparation', default_color_hex: '#c8d6e5', default_moodboard_enabled: true },
  { key: 'wedding_night', name_en: 'Wedding Night', default_color_hex: '#f7b5c0', default_moodboard_enabled: true },
  { key: 'honeymoon', name_en: 'Honeymoon', default_color_hex: '#b2d7f3', default_moodboard_enabled: true }
];

export async function resetDb() {
  await prisma.$transaction(async (tx) => {
    await tx.comments.deleteMany();
    await tx.activity_log.deleteMany();
    await tx.notifications.deleteMany();
    await tx.mood_board_reactions.deleteMany();
    await tx.mood_board_items.deleteMany();
    await tx.mood_boards.deleteMany();
    await tx.budget_line_items.deleteMany();
    await tx.event_budget_categories.deleteMany();
    await tx.event_budgets.deleteMany();
    await tx.budget_categories.deleteMany();
    await tx.honeymoon_items.deleteMany();
    await tx.honeymoon_plans.deleteMany();
    await tx.tasks.deleteMany();
    await tx.media_files.deleteMany();
    await tx.events.deleteMany();
    await tx.couple_members.deleteMany();
    await tx.couples.deleteMany();
    await tx.users.deleteMany();
    await tx.event_types.deleteMany();

    // Seed event types inside the same transaction to avoid races
    await tx.event_types.createMany({ data: eventTypes });
  });
}

export async function getEventTypeId(key: string) {
  const et = await prisma.event_types.findUnique({ where: { key } });
  if (!et) throw new Error(`event_type not found: ${key}`);
  return et.id;
}

export async function createEventForCouple(coupleId: number, key: string, title?: string) {
  const typeId = await getEventTypeId(key);
  return prisma.events.create({
    data: {
      couple_id: coupleId,
      event_type_id: typeId,
      title: title || key,
      is_active: true
    }
  });
}

export async function createMediaForCouple(coupleId: number, userId: number) {
  return prisma.media_files.create({
    data: {
      couple_id: coupleId,
      storage_key: `dev/${Date.now()}-placeholder.jpg`,
      mime_type: 'image/jpeg',
      size_bytes: 1234,
      uploaded_by: userId
    }
  });
}

export async function createUserAndLogin() {
  const email = `test+${Date.now()}@example.com`;
  const password = 'Secret123!';
  const full_name = 'Test User';

  const signupRes = await request()
    .post('/api/auth/signup')
    .send({ email, password, full_name, couple_name: 'Test Wedding' })
    .expect(200);

  const accessToken = signupRes.body.data.accessToken as string;
  return { email, password, full_name, accessToken };
}
