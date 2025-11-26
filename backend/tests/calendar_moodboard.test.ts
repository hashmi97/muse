import { beforeEach, describe, expect, it } from 'vitest';
import { request, resetDb, createUserAndLogin, createEventForCouple, createMediaForCouple, prisma } from './utils';

async function getCoupleIdForUser(userId: number) {
  const membership = await prisma.couple_members.findFirst({ where: { user_id: userId, status: 'active' } });
  return membership?.couple_id ?? null;
}

describe('Calendar & Moodboard', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns calendar events for couple', async () => {
    const { accessToken } = await createUserAndLogin();
    const user = await prisma.users.findFirstOrThrow();
    const coupleId = await getCoupleIdForUser(user.id);
    if (!coupleId) throw new Error('Missing couple');

    await createEventForCouple(coupleId, 'malka', 'Our Malka');

    const res = await request()
      .get('/api/calendar')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const keys = res.body.data.map((e: any) => e.event_type.key);
    expect(keys).toContain('malka');
  });

  it('creates and deletes a moodboard item', async () => {
    const { accessToken } = await createUserAndLogin();
    const user = await prisma.users.findFirstOrThrow();
    const coupleId = await getCoupleIdForUser(user.id);
    if (!coupleId) throw new Error('Missing couple');

    const event = await createEventForCouple(coupleId, 'wedding_night', 'Our Wedding');
    const media = await createMediaForCouple(coupleId, user.id);

    const createRes = await request()
      .post(`/api/moodboard/${event.id}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ media_id: media.id, caption: 'Test', position: 1 })
      .expect(200);

    const itemId = createRes.body.data.id;

    // fetch board
    const boardRes = await request()
      .get(`/api/moodboard/${event.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(boardRes.body.data?.items?.length).toBeGreaterThan(0);

    // delete
    await request()
      .delete(`/api/moodboard/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
