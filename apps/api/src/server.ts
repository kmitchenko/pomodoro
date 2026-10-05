import { buildApp } from './app';
import { loadEnv } from './config/env';
import { createDb } from './db/client';

const env = loadEnv();
const { db, close: closeDb } = createDb(env.DATABASE_URL);
const app = await buildApp({ env, db });

app.addHook('onClose', async () => {
  await closeDb();
});

// Graceful shutdown: finish in-flight requests and close the DB pool (Ctrl+C, docker stop, deploys)
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    app.log.info(`${signal} received, shutting down`);
    await app.close();
    process.exit(0);
  });
}

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
