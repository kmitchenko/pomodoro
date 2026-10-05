import type { TimerMode } from '@pomodoro/shared';
import { formatTime } from '@/shared/lib/formatTime';

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

type TimerDisplayProps = {
  remainingMs: number;
  mode: TimerMode;
};

export function TimerDisplay({ remainingMs, mode }: TimerDisplayProps) {
  const isWork = mode === 'work';

  return (
    <section aria-label="Timer" className="flex flex-col items-center gap-2">
      <span className={isWork ? 'text-focus' : 'text-break'}>{MODE_LABELS[mode]}</span>
      <time className="font-mono text-7xl tabular-nums" aria-live="polite">
        {formatTime(remainingMs)}
      </time>
    </section>
  );
}
