import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../app';
import { loadEnv } from '../../config/env';
import { createDb } from '../../db/client';

describe('GET /api/health', () => {
  const env = loadEnv();
  const { db, close } = createDb(env.DATABASE_URL);
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp({ env: { ...env, LOG_LEVEL: 'silent' }, db });
  });

  afterAll(async () => {
    await app.close();
    await close();
  });

  it('reports ok when the database is reachable', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok', db: 'up' });
  });
});
