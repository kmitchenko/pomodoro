import { z } from 'zod';

export const TIMER_MODES = ['work', 'shortBreak', 'longBreak'] as const;

export const timerModeSchema = z.enum(TIMER_MODES);
export type TimerMode = z.infer<typeof timerModeSchema>;
