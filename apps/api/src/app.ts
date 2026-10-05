import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type { Env } from './config/env';
import type { Db } from './db/client';
import { healthRoutes } from './modules/health/health.routes';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }
}

type BuildAppOptions = {
  env: Env;
  db: Db;
};

/** Builds the Fastify app without starting it, so tests can use app.inject() without opening a port. */
export async function buildApp({ env, db }: BuildAppOptions) {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.decorate('db', db);

  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(sensible);

  await app.register(healthRoutes, { prefix: '/api' });

  return app;
}
