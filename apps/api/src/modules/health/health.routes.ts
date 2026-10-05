import { sql } from 'drizzle-orm';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  db: z.enum(['up', 'down']),
  uptimeSeconds: z.number(),
});

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    { schema: { response: { 200: healthResponseSchema, 503: healthResponseSchema } } },
    async (_request, reply) => {
      const dbUp = await app.db
        .execute(sql`select 1`)
        .then(() => true)
        .catch(() => false);

      return reply.code(dbUp ? 200 : 503).send({
        status: dbUp ? 'ok' : 'degraded',
        db: dbUp ? 'up' : 'down',
        uptimeSeconds: Math.round(process.uptime()),
      });
    },
  );
};
