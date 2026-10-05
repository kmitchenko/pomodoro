import { DEFAULT_SETTINGS } from '@pomodoro/shared';
import { TimerDisplay } from '@/features/timer/components/TimerDisplay';

export function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-semibold tracking-tight">Pomodoro</h1>
      <TimerDisplay remainingMs={DEFAULT_SETTINGS.workMinutes * 60_000} mode="work" />
    </main>
  );
}
