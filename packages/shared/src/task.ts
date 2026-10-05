import { z } from 'zod';

export const taskSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  estimatedPomodoros: z.number().int().min(1).max(20),
  completedPomodoros: z.number().int().min(0),
  done: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = taskSchema.pick({
  title: true,
  estimatedPomodoros: true,
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = taskSchema
  .pick({ title: true, estimatedPomodoros: true, done: true })
  .partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
