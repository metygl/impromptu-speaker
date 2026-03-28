import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getLocalTranscriptionSupport, useTranscription } from './useTranscription';

const originalNavigatorState = {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  maxTouchPoints: navigator.maxTouchPoints,
};

function setNavigatorState({
  userAgent,
  platform,
  maxTouchPoints,
}: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'platform', {
    value: platform,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    value: maxTouchPoints,
    configurable: true,
  });
}

function restoreNavigatorState() {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: originalNavigatorState.userAgent,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'platform', {
    value: originalNavigatorState.platform,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    value: originalNavigatorState.maxTouchPoints,
    configurable: true,
  });
}

describe('useTranscription support detection', () => {
  afterEach(() => {
    restoreNavigatorState();
  });

  it('marks iPhone browsers as unsupported for local transcription', () => {
    setNavigatorState({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });

    expect(getLocalTranscriptionSupport()).toEqual({
      isSupported: false,
      reason:
        'Local transcription is currently unavailable on iPhone and iPad because those browsers can crash while loading the on-device speech model. Your recording is still saved locally on this device.',
    });
  });

  it('marks iPadOS desktop-mode browsers as unsupported for local transcription', () => {
    setNavigatorState({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    });

    expect(getLocalTranscriptionSupport().isSupported).toBe(false);
  });

  it('fails fast with a user-facing error on unsupported devices', async () => {
    setNavigatorState({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });

    const { result } = renderHook(() => useTranscription());

    let thrownError: Error | null = null;

    await act(async () => {
      try {
        await result.current.transcribe(new Blob(['audio'], { type: 'audio/webm' }));
      } catch (error) {
        thrownError = error as Error;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect(thrownError?.message).toContain('currently unavailable on iPhone and iPad');
    expect(result.current.isSupported).toBe(false);
    expect(result.current.error).toContain('currently unavailable on iPhone and iPad');
    expect(result.current.progress.status).toBe('error');
  });
});
