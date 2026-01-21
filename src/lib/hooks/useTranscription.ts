'use client';

import { useState, useCallback, useRef } from 'react';

// Whisper model configuration
const MODEL_ID = 'Xenova/whisper-small';

interface TranscriptionProgress {
  status: 'idle' | 'loading-model' | 'transcribing' | 'complete' | 'error';
  modelProgress?: number; // 0-100 for model download
  transcriptionProgress?: number; // 0-100 for transcription
  message?: string;
}

interface UseTranscriptionReturn {
  transcribe: (audioBlob: Blob) => Promise<string>;
  progress: TranscriptionProgress;
  isModelLoaded: boolean;
  error: string | null;
}

// Singleton for the transcriber pipeline to avoid reloading the model
let transcriberPromise: Promise<any> | null = null;

export function useTranscription(): UseTranscriptionReturn {
  const [progress, setProgress] = useState<TranscriptionProgress>({ status: 'idle' });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadModel = useCallback(async () => {
    if (transcriberPromise) {
      return transcriberPromise;
    }

    setProgress({ status: 'loading-model', modelProgress: 0, message: 'Loading Whisper model...' });

    try {
      // Dynamic import to avoid SSR issues
      const transformers = await import('@xenova/transformers');
      const { pipeline, env } = transformers;

      // Configure to load models from HuggingFace Hub, not locally
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      transcriberPromise = pipeline('automatic-speech-recognition', MODEL_ID, {
        progress_callback: (progressData: any) => {
          // Defensive check for progress data
          if (progressData && typeof progressData === 'object' && progressData.status === 'progress') {
            const loaded = progressData.loaded ?? 0;
            const total = progressData.total ?? 1;
            const percent = Math.round((loaded / total) * 100);
            setProgress({
              status: 'loading-model',
              modelProgress: percent,
              message: `Downloading model: ${percent}%`,
            });
          }
        },
      });

      const transcriber = await transcriberPromise;
      setIsModelLoaded(true);
      return transcriber;
    } catch (err) {
      transcriberPromise = null;
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transcription model';
      setError(errorMessage);
      setProgress({ status: 'error', message: errorMessage });
      throw err;
    }
  }, []);

  const transcribe = useCallback(
    async (audioBlob: Blob): Promise<string> => {
      setError(null);

      try {
        // Validate the audio blob
        if (!audioBlob || !(audioBlob instanceof Blob)) {
          throw new Error('Invalid audio blob provided');
        }
        if (audioBlob.size === 0) {
          throw new Error('Audio blob is empty');
        }

        // Load the model if not already loaded
        const transcriber = await loadModel();

        if (!transcriber) {
          throw new Error('Failed to load transcription model');
        }

        setProgress({ status: 'transcribing', transcriptionProgress: 0, message: 'Processing audio...' });

        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log('[Transcription] ArrayBuffer size:', arrayBuffer.byteLength);

        if (arrayBuffer.byteLength === 0) {
          throw new Error('Audio buffer is empty');
        }

        // Create audio context to decode the audio
        const audioContext = new AudioContext({ sampleRate: 16000 });

        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
        } catch (decodeErr) {
          await audioContext.close();
          throw new Error(`Failed to decode audio: ${decodeErr instanceof Error ? decodeErr.message : 'Unknown error'}`);
        }

        console.log('[Transcription] Decoded audio:', {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          channels: audioBuffer.numberOfChannels,
        });

        // Get the audio data as Float32Array (mono, 16kHz)
        let audioData: Float32Array;
        if (audioBuffer.numberOfChannels > 1) {
          // Convert to mono by averaging channels
          const channel0 = audioBuffer.getChannelData(0);
          const channel1 = audioBuffer.getChannelData(1);
          audioData = new Float32Array(channel0.length);
          for (let i = 0; i < channel0.length; i++) {
            audioData[i] = (channel0[i] + channel1[i]) / 2;
          }
        } else {
          audioData = audioBuffer.getChannelData(0);
        }

        // Close the audio context
        await audioContext.close();

        if (audioData.length === 0) {
          throw new Error('Processed audio data is empty');
        }

        console.log('[Transcription] Audio data length:', audioData.length);

        setProgress({ status: 'transcribing', message: 'Transcribing audio... (this may take a minute)' });

        // Transcribe the audio
        const result = await transcriber(audioData, {
          chunk_length_s: 30,
          stride_length_s: 5,
          language: 'english',
          task: 'transcribe',
          return_timestamps: false,
          callback_function: (beams: any) => {
            // Update progress message to show activity
            setProgress({
              status: 'transcribing',
              message: 'Transcribing audio... (processing)'
            });
          },
        });

        console.log('[Transcription] Result:', result);

        if (!result || typeof result.text !== 'string') {
          throw new Error('Transcription returned invalid result');
        }

        setProgress({ status: 'complete', transcriptionProgress: 100, message: 'Transcription complete!' });

        return result.text.trim();
      } catch (err) {
        console.error('[Transcription] Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
        setError(errorMessage);
        setProgress({ status: 'error', message: errorMessage });
        throw err;
      }
    },
    [loadModel]
  );

  return {
    transcribe,
    progress,
    isModelLoaded,
    error,
  };
}
