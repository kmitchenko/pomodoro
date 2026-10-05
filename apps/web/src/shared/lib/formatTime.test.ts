import { formatTime } from './formatTime';

describe('formatTime', () => {
  it.each([
    [25 * 60_000, '25:00'],
    [61_000, '01:01'],
    [999, '00:01'],
    [0, '00:00'],
    [-500, '00:00'],
  ])('formats %i ms as %s', (ms, expected) => {
    expect(formatTime(ms)).toBe(expected);
  });
});
