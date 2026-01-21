import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Recording } from '../types';

// Create mutable state store for mocks
let mockRecordings: Recording[] = [];
const mockSetRecordings = vi.fn((updater) => {
  if (typeof updater === 'function') {
    mockRecordings = updater(mockRecordings);
  } else {
    mockRecordings = updater;
  }
});

const mockIndexedDBPut = vi.fn().mockResolvedValue(undefined);
const mockIndexedDBGet = vi.fn().mockResolvedValue(new Blob(['test'], { type: 'audio/webm' }));
const mockIndexedDBDelete = vi.fn().mockResolvedValue(undefined);

// Mock the dependencies
vi.mock('./useIndexedDB', () => ({
  useIndexedDB: () => ({
    isReady: true,
    error: null,
    put: mockIndexedDBPut,
    get: mockIndexedDBGet,
    delete: mockIndexedDBDelete,
    getAll: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('./useLocalStorage', () => ({
  useLocalStorage: () => [mockRecordings, mockSetRecordings],
}));

// Import after mocks are set up
import { useVoiceRecordings } from './useVoiceRecordings';

describe('useVoiceRecordings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRecordings = [];
  });

  it('should initialize with empty recordings', () => {
    const { result } = renderHook(() => useVoiceRecordings());

    expect(result.current.recordings).toEqual([]);
    expect(result.current.totalStorageUsed).toBe(0);
  });

  it('should save a recording', async () => {
    const { result, rerender } = renderHook(() => useVoiceRecordings());

    const blob = new Blob(['test audio'], { type: 'audio/webm' });
    const params = {
      name: 'Test Recording',
      topicId: 'topic-1',
      topicText: 'What is your greatest achievement?',
      frameworkId: 'prep',
      frameworkName: 'PREP',
      speechDurationSetting: 180,
      durationSeconds: 120,
    };

    let recordingId: string;

    await act(async () => {
      recordingId = await result.current.saveRecording(blob, params);
    });

    // Re-render to see updated state
    rerender();

    expect(recordingId!).toBeDefined();
    expect(mockIndexedDBPut).toHaveBeenCalledWith(recordingId!, blob);
    expect(mockSetRecordings).toHaveBeenCalled();

    // Verify the recording was added to mockRecordings
    expect(mockRecordings).toHaveLength(1);
    expect(mockRecordings[0].name).toBe('Test Recording');
    expect(mockRecordings[0].topicText).toBe('What is your greatest achievement?');
  });

  it('should calculate total storage used', async () => {
    const { result, rerender } = renderHook(() => useVoiceRecordings());

    const blob = new Blob(['test audio data'], { type: 'audio/webm' });
    const params = {
      name: 'Test Recording',
      topicId: 'topic-1',
      topicText: 'Test topic',
      frameworkId: 'prep',
      frameworkName: 'PREP',
      speechDurationSetting: 180,
      durationSeconds: 120,
    };

    await act(async () => {
      await result.current.saveRecording(blob, params);
    });

    // Re-render to get updated computed value
    rerender();

    expect(result.current.totalStorageUsed).toBe(blob.size);
  });

  it('should update a recording', async () => {
    const { result, rerender } = renderHook(() => useVoiceRecordings());

    const blob = new Blob(['test'], { type: 'audio/webm' });
    let recordingId: string;

    await act(async () => {
      recordingId = await result.current.saveRecording(blob, {
        name: 'Original Name',
        topicId: 'topic-1',
        topicText: 'Test',
        frameworkId: 'prep',
        frameworkName: 'PREP',
        speechDurationSetting: 180,
        durationSeconds: 60,
      });
    });

    rerender();

    await act(async () => {
      await result.current.updateRecording(recordingId!, {
        transcript: 'This is the transcript',
      });
    });

    rerender();

    expect(mockRecordings[0].transcript).toBe('This is the transcript');
  });

  it('should delete a recording', async () => {
    const { result, rerender } = renderHook(() => useVoiceRecordings());

    const blob = new Blob(['test'], { type: 'audio/webm' });
    let recordingId: string;

    await act(async () => {
      recordingId = await result.current.saveRecording(blob, {
        name: 'To Delete',
        topicId: 'topic-1',
        topicText: 'Test',
        frameworkId: 'prep',
        frameworkName: 'PREP',
        speechDurationSetting: 180,
        durationSeconds: 60,
      });
    });

    rerender();
    expect(mockRecordings).toHaveLength(1);

    await act(async () => {
      await result.current.deleteRecording(recordingId!);
    });

    rerender();

    expect(mockIndexedDBDelete).toHaveBeenCalledWith(recordingId!);
    expect(mockRecordings).toHaveLength(0);
  });

  it('should get audio URL', async () => {
    const { result, rerender } = renderHook(() => useVoiceRecordings());

    const blob = new Blob(['test'], { type: 'audio/webm' });
    let recordingId: string;

    await act(async () => {
      recordingId = await result.current.saveRecording(blob, {
        name: 'Test',
        topicId: 'topic-1',
        topicText: 'Test',
        frameworkId: 'prep',
        frameworkName: 'PREP',
        speechDurationSetting: 180,
        durationSeconds: 60,
      });
    });

    rerender();

    let url: string | null;

    await act(async () => {
      url = await result.current.getAudioUrl(recordingId!);
    });

    expect(url!).toBe('blob:mock-url');
    expect(mockIndexedDBGet).toHaveBeenCalledWith(recordingId!);
  });

  it('should revoke audio URL', () => {
    const { result } = renderHook(() => useVoiceRecordings());

    act(() => {
      result.current.revokeAudioUrl('blob:mock-url');
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
