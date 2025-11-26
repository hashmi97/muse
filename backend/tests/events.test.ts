import { beforeEach, describe, expect, it } from 'vitest';
import { request, resetDb, createUserAndLogin, prisma } from './utils';

describe('Events', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns event types excluding engagement when onboardingOnly=true', async () => {
    const { accessToken } = await createUserAndLogin();
    const res = await request()
      .get('/api/events/types?onboardingOnly=true')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const keys = res.body.data.map((t: any) => t.key);
    expect(keys).not.toContain('engagement');
    expect(keys).toContain('malka');
  });

  it('upserts selections and returns events', async () => {
    const { accessToken } = await createUserAndLogin();
    const selection = {
      selections: [
        { eventTypeKey: 'malka', enableMoodBoard: true },
        { eventTypeKey: 'henna_night', enableMoodBoard: false }
      ]
    };

    const res = await request()
      .post('/api/events/selection')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(selection)
      .expect(200);

    const keys = res.body.data.map((e: any) => e.event_type.key);
    expect(keys).toContain('malka');
    expect(keys).toContain('henna_night');

    const moodBoards = await prisma.mood_boards.findMany();
    expect(moodBoards.length).toBeGreaterThan(0);
  });
});
