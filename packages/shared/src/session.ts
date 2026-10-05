import { z } from 'zod';
import { timerModeSchema } from './timer';

export const sessionSchema = z.object({
  id: z.uuid(),
  mode: timerModeSchema,
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime(),
  completed: z.boolean(),
  taskId: z.uuid().nullable(),
});
export type Session = z.infer<typeof sessionSchema>;

export const createSessionSchema = sessionSchema
  .omit({ id: true })
  .refine((s) => new Date(s.endedAt) > new Date(s.startedAt), {
    message: 'endedAt must be after startedAt',
    path: ['endedAt'],
  });
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
