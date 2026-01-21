import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayback } from './useAudioPlayback';

describe('useAudioPlayback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioPlayback());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.playbackRate).toBe(1);
  });

  it('should load audio from blob', async () => {
    const { result } = renderHook(() => useAudioPlayback());

    const blob = new Blob(['test audio'], { type: 'audio/webm' });

    act(() => {
      result.current.load(blob);
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('should load audio from URL', () => {
    const { result } = renderHook(() => useAudioPlayback());

    act(() => {
      result.current.loadUrl('https://example.com/audio.mp3');
    });

    // Audio should be initialized
    expect(result.current.isLoaded).toBe(false); // Will be true after oncanplaythrough
  });

  it('should toggle play/pause', async () => {
    const { result } = renderHook(() => useAudioPlayback());

    const blob = new Blob(['test audio'], { type: 'audio/webm' });

    act(() => {
      result.current.load(blob);
    });

    // Wait for audio to "load"
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should play audio when loaded', async () => {
    const { result } = renderHook(() => useAudioPlayback());

    const blob = new Blob(['test audio'], { type: 'audio/webm' });

    act(() => {
      result.current.load(blob);
    });

    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it('should pause audio', async () => {
    const { result } = renderHook(() => useAudioPlayback());

    const blob = new Blob(['test audio'], { type: 'audio/webm' });

    act(() => {
      result.current.load(blob);
    });

    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should change playback rate', () => {
    const { result } = renderHook(() => useAudioPlayback());

    act(() => {
      result.current.setPlaybackRate(1.5);
    });

    expect(result.current.playbackRate).toBe(1.5);
  });

  it('should unload audio', async () => {
    const { result } = renderHook(() => useAudioPlayback());

    const blob = new Blob(['test audio'], { type: 'audio/webm' });

    act(() => {
      result.current.load(blob);
    });

    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.unload();
    });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
  });

  it('should calculate progress correctly', () => {
    const { result } = renderHook(() => useAudioPlayback());

    // When duration is 0, progress should be 0
    expect(result.current.progress).toBe(0);
  });
});
