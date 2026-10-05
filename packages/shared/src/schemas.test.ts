import { describe, expect, it } from 'vitest';
import { createSessionSchema, createTaskSchema, DEFAULT_SETTINGS, settingsSchema } from './index';

describe('settingsSchema', () => {
  it('accepts the defaults', () => {
    expect(settingsSchema.parse(DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });

  it('rejects a non-integer work duration', () => {
    const result = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, workMinutes: 25.5 });
    expect(result.success).toBe(false);
  });
});

describe('createTaskSchema', () => {
  it('trims the title', () => {
    expect(createTaskSchema.parse({ title: '  Write tests  ', estimatedPomodoros: 2 }).title).toBe(
      'Write tests',
    );
  });

  it('rejects a blank title', () => {
    expect(createTaskSchema.safeParse({ title: '   ', estimatedPomodoros: 1 }).success).toBe(false);
  });
});

describe('createSessionSchema', () => {
  const base = {
    mode: 'work',
    startedAt: '2026-10-05T10:00:00.000Z',
    endedAt: '2026-10-05T10:25:00.000Z',
    completed: true,
    taskId: null,
  } as const;

  it('accepts a valid session', () => {
    expect(createSessionSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a session that ends before it starts', () => {
    const result = createSessionSchema.safeParse({ ...base, endedAt: '2026-10-05T09:00:00.000Z' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['endedAt']);
  });
});
