import type { TimerMode, Settings } from '@pomodoro/shared';

type TimerBase = {
  mode: TimerMode; // 'work' | 'shortBreak' | 'longBreak'
  completedPomodoros: number; // finished WORK sessions, used for the long-break rule
};

export type TimerState =
  | (TimerBase & { status: 'idle'; remainingMs: number })
  | (TimerBase & { status: 'paused'; remainingMs: number })
  | (TimerBase & { status: 'running'; endsAt: number });

export type TimerAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset'; settings: Settings }
  | { type: 'switchMode'; mode: TimerMode; settings: Settings }
  | { type: 'complete'; now: number; settings: Settings };

function getDurationMs(mode: TimerMode, settings: Settings): number {
  switch (mode) {
    case 'work':
      return settings.workMinutes * 60000;
    case 'shortBreak':
      return settings.shortBreakMinutes * 60000;
    case 'longBreak':
      return settings.longBreakMinutes * 60000;
  }
}

export function createInitialTimerState(settings: Settings): TimerState {
  return {
    status: 'idle',
    remainingMs: getDurationMs('work', settings),
    mode: 'work',
    completedPomodoros: 0,
  };
}

export function getRemainingMs(state: TimerState, now: number): number {
  if (state.status === 'running') {
    return Math.max(0, state.endsAt - now);
  } else return state.remainingMs;
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'start':
      if (state.status === 'running') return state;
      return {
        mode: state.mode,
        status: 'running',
        endsAt: action.now + getRemainingMs(state, action.now),
        completedPomodoros: state.completedPomodoros,
      };
    case 'pause':
      if (state.status !== 'running') return state;
      return {
        status: 'paused',
        remainingMs: getRemainingMs(state, action.now),
        mode: state.mode,
        completedPomodoros: state.completedPomodoros,
      };
    case 'reset':
      return {
        status: 'idle',
        mode: state.mode,
        completedPomodoros: state.completedPomodoros,
        remainingMs: getDurationMs(state.mode, action.settings),
      };
    case 'switchMode':
      return {
        mode: action.mode,
        status: 'idle',
        remainingMs: getDurationMs(action.mode, action.settings),
        completedPomodoros: state.completedPomodoros,
      };
    case 'complete': {
      if (state.status !== 'running') return state;

      const completed =
        state.mode === 'work' ? state.completedPomodoros + 1 : state.completedPomodoros;

      const nextMode: TimerMode =
        state.mode === 'work'
          ? completed % action.settings.longBreakInterval === 0
            ? 'longBreak'
            : 'shortBreak'
          : 'work';

      const shouldAutoStart =
        nextMode === 'work' ? action.settings.autoStartWork : action.settings.autoStartBreaks;

      const duration = getDurationMs(nextMode, action.settings);

      if (shouldAutoStart) {
        return {
          status: 'running',
          endsAt: action.now + duration,
          mode: nextMode,
          completedPomodoros: completed,
        };
      }

      return {
        status: 'idle',
        remainingMs: duration,
        mode: nextMode,
        completedPomodoros: completed,
      };
    }
  }
}
