import { DEFAULT_SETTINGS } from '@pomodoro/shared';
import { timerReducer, type TimerState } from './timerReducer';
import { expect } from 'vitest';

// ─── Test data ────────────────────────────────────────────────────────────────
// Fixed values instead of Date.now(), so every run gives the same result.
const NOW = 1_000_000;
const MINUTE = 60_000;
const settings = DEFAULT_SETTINGS; // work 25, short 5, long 15, long break every 4

// Factories: build a valid state with sensible defaults, override only what a test cares about.
function idle(overrides: Partial<Extract<TimerState, { status: 'idle' }>> = {}): TimerState {
  return {
    status: 'idle',
    mode: 'work',
    completedPomodoros: 0,
    remainingMs: 25 * MINUTE,
    ...overrides,
  };
}

function running(overrides: Partial<Extract<TimerState, { status: 'running' }>> = {}): TimerState {
  return {
    status: 'running',
    mode: 'work',
    completedPomodoros: 0,
    endsAt: NOW + 25 * MINUTE,
    ...overrides,
  };
}

function paused(overrides: Partial<Extract<TimerState, { status: 'paused' }>> = {}): TimerState {
  return {
    status: 'paused',
    mode: 'work',
    completedPomodoros: 0,
    remainingMs: 25 * MINUTE,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('timerReducer', () => {
  describe('start', () => {
    it('starts an idle timer, with the deadline set to now + remaining time', () => {
      // Arrange
      const state = idle({ remainingMs: 25 * MINUTE });

      // Act
      const next = timerReducer(state, { type: 'start', now: NOW });

      // Assert
      expect(next).toEqual({
        status: 'running',
        mode: 'work',
        completedPomodoros: 0,
        endsAt: NOW + 25 * MINUTE,
      });
    });

    it('resumes a paused timer from the paused remaining time, not the full duration', () => {
      const state = paused({ mode: 'shortBreak', completedPomodoros: 2, remainingMs: 3 * MINUTE });

      const next = timerReducer(state, { type: 'start', now: NOW });

      expect(next).toEqual({
        status: 'running',
        mode: 'shortBreak',
        completedPomodoros: 2,
        endsAt: NOW + 3 * MINUTE,
      });
    });

    it('ignores start when the timer is already running (returns the same object)', () => {
      const state = running({ endsAt: NOW + 10 * MINUTE });

      const next = timerReducer(state, { type: 'start', now: NOW });

      expect(next).toBe(state);
    });
  });

  describe('pause', () => {
    it('ignores pause when the timer is idle (returns the same object)', () => {
      const state = idle();

      const next = timerReducer(state, { type: 'pause', now: NOW });

      expect(next).toBe(state);
    });

    it('ignores pause when the timer is paused (returns the same object)', () => {
      const state = paused();

      const next = timerReducer(state, { type: 'pause', now: NOW });

      expect(next).toBe(state);
    });

    it('pauses a running timer and keeps the remaining time', () => {
      const state = running({ mode: 'longBreak', completedPomodoros: 3, endsAt: NOW + 7 * MINUTE });

      const next = timerReducer(state, { type: 'pause', now: NOW });

      expect(next).toEqual({
        status: 'paused',
        mode: 'longBreak',
        completedPomodoros: 3,
        remainingMs: 7 * MINUTE,
      });
    });

    it('gives 0, not a negative number, when paused after the deadline', () => {
      const state = running({ endsAt: NOW - MINUTE });

      const next = timerReducer(state, { type: 'pause', now: NOW });

      expect(next).toMatchObject({ status: 'paused', remainingMs: 0 });
    });
  });

  describe('switchMode', () => {
    it('switches to the chosen mode with its full duration and keeps the count', () => {
      const state = running({ completedPomodoros: 2 });

      const next = timerReducer(state, { type: 'switchMode', mode: 'shortBreak', settings });

      expect(next).toEqual({
        status: 'idle',
        mode: 'shortBreak',
        completedPomodoros: 2,
        remainingMs: 5 * MINUTE,
      });
    });
  });

  describe('reset', () => {
    it('restarts the current mode from its full duration and keeps the count', () => {
      const state = running({ mode: 'shortBreak', completedPomodoros: 2 });

      const next = timerReducer(state, { type: 'reset', settings });

      expect(next).toEqual({
        status: 'idle',
        mode: 'shortBreak',
        completedPomodoros: 2,
        remainingMs: 5 * MINUTE,
      });
    });
  });

  describe('complete', () => {
    it('returns the same state when timer is not running', () => {
      const state = idle();

      const next = timerReducer(state, { type: 'complete', now: NOW, settings });

      expect(next).toBe(state);
    });

    it('after a work session, goes to a short break and counts the pomodoro', () => {
      const state = running({ completedPomodoros: 2 });

      const next = timerReducer(state, { type: 'complete', now: NOW, settings });

      expect(next).toEqual({
        status: 'idle',
        mode: 'shortBreak',
        completedPomodoros: 3,
        remainingMs: 5 * MINUTE,
      });
    });

    it('after the 4th work session, goes to a long break', () => {
      const state = running({ completedPomodoros: 3 });

      const next = timerReducer(state, { type: 'complete', now: NOW, settings });

      expect(next).toEqual({
        status: 'idle',
        mode: 'longBreak',
        remainingMs: 15 * MINUTE,
        completedPomodoros: 4,
      });
    });

    it('after a break, goes back to work without counting', () => {
      const state = running({
        mode: 'shortBreak',
        completedPomodoros: 2,
        endsAt: NOW + 5 * MINUTE,
      });

      const next = timerReducer(state, { type: 'complete', now: NOW, settings });

      expect(next).toEqual({
        status: 'idle',
        mode: 'work',
        remainingMs: 25 * MINUTE,
        completedPomodoros: 2,
      });
    });

    it('auto-starts the break when autoStartBreaks is on', () => {
      const state = running();

      const next = timerReducer(state, {
        type: 'complete',
        now: NOW,
        settings: { ...settings, autoStartBreaks: true },
      });

      expect(next).toEqual({
        status: 'running',
        mode: 'shortBreak',
        endsAt: NOW + 5 * MINUTE,
        completedPomodoros: 1,
      });
    });

    it('uses longBreakInterval from settings', () => {
      const state = running({ completedPomodoros: 2 });

      const next = timerReducer(state, {
        type: 'complete',
        now: NOW,
        settings: { ...settings, longBreakInterval: 3 },
      });

      expect(next).toMatchObject({ mode: 'longBreak' });
    });
  });
});
