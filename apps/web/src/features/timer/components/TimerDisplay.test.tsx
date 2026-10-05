import { render, screen } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('<TimerDisplay />', () => {
  it('shows the remaining time and the mode label', () => {
    render(<TimerDisplay remainingMs={5 * 60_000} mode="shortBreak" />);

    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByText('Short break')).toBeInTheDocument();
  });
});
