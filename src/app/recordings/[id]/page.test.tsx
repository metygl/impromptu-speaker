import { Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordingDetailPage from './page';

const mockUseAuth = vi.fn();
const mockUseVoiceRecordings = vi.fn();
const mockUseTranscription = vi.fn();
const mockTranscribe = vi.fn();
const mockUpdateRecording = vi.fn();

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/Header', () => ({
  Header: ({ title }: { title?: string }) => <div>{title ?? 'Header'}</div>,
}));

vi.mock('@/components/AudioPlayer', () => ({
  AudioPlayer: ({ url }: { url: string }) => <div data-testid="audio-player">{url}</div>,
}));

vi.mock('@/components/FrameworkCard', () => ({
  FrameworkCard: ({ framework }: { framework: { name: string } }) => <div>{framework.name}</div>,
}));

vi.mock('@/components/SpeechAnalysisView', () => ({
  SpeechAnalysisView: () => <div>Speech Analysis</div>,
}));

vi.mock('@/components/TranscriptionProgress', () => ({
  TranscriptionProgress: ({ message }: { message?: string }) => <div>{message}</div>,
}));

vi.mock('@/lib/hooks/useVoiceRecordings', () => ({
  useVoiceRecordings: () => mockUseVoiceRecordings(),
}));

vi.mock('@/lib/hooks/useTranscription', () => ({
  useTranscription: () => mockUseTranscription(),
}));

describe('RecordingDetailPage', () => {
  const recording = {
    id: 'recording-1',
    name: 'Mobile recording',
    createdAt: '2026-03-27T10:00:00.000Z',
    durationSeconds: 180,
    topicId: 'topic-1',
    topicText: 'Tell me about yourself',
    frameworkId: 'present-recent-future',
    frameworkName: 'Present-Recent-Future',
    speechDurationSetting: 180,
    fileSize: 2048,
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com' },
    });

    mockUseVoiceRecordings.mockReturnValue({
      recordings: [recording],
      getRecording: vi.fn().mockResolvedValue({
        metadata: recording,
        blob: new Blob(['mobile audio'], { type: 'audio/webm' }),
      }),
      deleteRecording: vi.fn(),
      updateRecording: mockUpdateRecording,
      isLoading: false,
    });

    mockUseTranscription.mockReturnValue({
      transcribe: mockTranscribe,
      progress: { status: 'idle' },
      isModelLoaded: false,
      error: null,
      isSupported: false,
      unsupportedReason: 'Local transcription is not supported on this device.',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            analysis: {
              clarityAndStructure: { score: 8, feedback: 'Clear and structured.' },
              concisenessAndWordChoice: { score: 7, feedback: 'Tight phrasing.' },
              emotionalResonance: { score: 6, feedback: 'Warm delivery.' },
              toneAndPresence: { score: 9, feedback: 'Confident presence.' },
              audienceConnection: { score: 8, feedback: 'Good connection.' },
              improvements: ['Open with a stronger hook'],
              overallScore: 8.2,
            },
            feedbackId: 'feedback-123',
            transcript: 'Server transcript',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('uploads audio to the server on iPhone and iPad supported flows', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <RecordingDetailPage params={Promise.resolve({ id: 'recording-1' })} />
        </Suspense>
      );
    });

    const button = await screen.findByRole('button', { name: 'Transcribe & Analyze' });
    await user.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(init?.body).toBeInstanceOf(FormData);

    const formData = init?.body as FormData;
    expect(formData.get('topic')).toBe('Tell me about yourself');
    expect(formData.get('framework')).toBe('Present-Recent-Future');
    expect(formData.get('frameworkId')).toBe('present-recent-future');
    expect(formData.get('durationSeconds')).toBe('180');
    expect(formData.get('audio')).toBeInstanceOf(File);
    expect(mockTranscribe).not.toHaveBeenCalled();
    expect(mockUpdateRecording).toHaveBeenCalledWith(
      'recording-1',
      expect.objectContaining({
        transcript: 'Server transcript',
        feedbackId: 'feedback-123',
        analyzedAt: expect.any(String),
      })
    );
  });
});
