import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  estimatedPomodoros: integer().notNull().default(1),
  completedPomodoros: integer().notNull().default(0),
  done: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
