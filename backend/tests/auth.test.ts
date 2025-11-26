import { beforeEach, describe, expect, it } from 'vitest';
import { request, resetDb } from './utils';

describe('Auth', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('signs up a user and returns access token', async () => {
    const res = await request()
      .post('/api/auth/signup')
      .send({ email: 'a@example.com', password: 'Secret123!', full_name: 'A User', couple_name: 'A Wedding' })
      .expect(200);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('a@example.com');
    expect(res.body.data.couple.name).toBe('A Wedding');
  });

  it('logs in an existing user', async () => {
    await request()
      .post('/api/auth/signup')
      .send({ email: 'b@example.com', password: 'Secret123!', full_name: 'B User', couple_name: 'B Wedding' })
      .expect(200);

    const res = await request()
      .post('/api/auth/login')
      .send({ email: 'b@example.com', password: 'Secret123!' })
      .expect(200);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('b@example.com');
  });
});
