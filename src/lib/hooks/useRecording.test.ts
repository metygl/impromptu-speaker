import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecording } from './useRecording';

describe('useRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRecording());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should request permission', async () => {
    const { result } = renderHook(() => useRecording());

    let hasPermission: boolean;

    await act(async () => {
      hasPermission = await result.current.requestPermission();
    });

    expect(hasPermission!).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it('should start recording', async () => {
    const { result } = renderHook(() => useRecording());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('should stop recording and return blob', async () => {
    const { result } = renderHook(() => useRecording());

    await act(async () => {
      await result.current.start();
    });

    let blob: Blob | null;

    await act(async () => {
      blob = await result.current.stop();
    });

    expect(result.current.isRecording).toBe(false);
    expect(blob!).toBeInstanceOf(Blob);
  });

  it('should pause and resume recording', async () => {
    const { result } = renderHook(() => useRecording());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isPaused).toBe(false);
  });

  it('should call onComplete callback when stopping', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRecording({ onComplete }));

    await act(async () => {
      await result.current.start();
    });

    await act(async () => {
      await result.current.stop();
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should return null when stopping without starting', async () => {
    const { result } = renderHook(() => useRecording());

    let blob: Blob | null;

    await act(async () => {
      blob = await result.current.stop();
    });

    expect(blob!).toBeNull();
  });
});
