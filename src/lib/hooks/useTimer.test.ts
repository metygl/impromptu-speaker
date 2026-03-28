import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('counts down cleanly across the one-minute boundary without resetting', () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 120 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(61_000);
    });

    expect(result.current.remainingSeconds).toBe(59);
  });

  it('pauses and resumes from the current remaining time', () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 90 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.remainingSeconds).toBe(70);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current.remainingSeconds).toBe(70);

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.remainingSeconds).toBe(60);
  });

  it('fires onComplete once when the timer reaches zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTimer({
        initialSeconds: 2,
        onComplete,
      })
    );

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(2_500);
    });

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
