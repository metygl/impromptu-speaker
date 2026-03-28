'use client';

import { useState, useCallback } from 'react';

// Whisper model configuration
const MODEL_ID = 'Xenova/whisper-tiny.en';

interface TranscriptionProgress {
  status: 'idle' | 'loading-model' | 'preparing-audio' | 'transcribing' | 'complete' | 'error';
  modelProgress?: number; // 0-100 for model download
  transcriptionProgress?: number; // 0-100 for transcription
  message?: string;
}

interface UseTranscriptionReturn {
  transcribe: (audioBlob: Blob) => Promise<string>;
  progress: TranscriptionProgress;
  isModelLoaded: boolean;
  error: string | null;
  isSupported: boolean;
  unsupportedReason: string | null;
}

interface ModelLoadProgress {
  status?: string;
  loaded?: number;
  total?: number;
}

interface TranscriptionResult {
  text: string;
}

type TranscriptionResponse = TranscriptionResult | TranscriptionResult[];

interface TranscriberOptions {
  chunk_length_s: number;
  stride_length_s: number;
  language: string;
  task: string;
  return_timestamps: boolean;
  callback_function: () => void;
}

type Transcriber = (
  audioData: Float32Array,
  options: TranscriberOptions
) => Promise<TranscriptionResponse>;

interface TranscriptionSupport {
  isSupported: boolean;
  reason: string | null;
}

interface NavigatorSupportInput {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
}

// Singleton for the transcriber pipeline to avoid reloading the model
let transcriberPromise: Promise<Transcriber> | null = null;

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

export function getLocalTranscriptionSupport(
  navigatorInput?: NavigatorSupportInput
): TranscriptionSupport {
  const currentNavigator =
    navigatorInput ?? (typeof navigator !== 'undefined' ? navigator : undefined);

  if (!currentNavigator) {
    return { isSupported: true, reason: null };
  }

  const userAgent = currentNavigator.userAgent?.toLowerCase() ?? '';
  const platform = currentNavigator.platform?.toLowerCase() ?? '';
  const maxTouchPoints = currentNavigator.maxTouchPoints ?? 0;
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) || (platform === 'macintel' && maxTouchPoints > 1);

  if (isIOS) {
    return {
      isSupported: false,
      reason:
        'Local transcription is currently unavailable on iPhone and iPad because those browsers can crash while loading the on-device speech model. Your recording is still saved locally on this device.',
    };
  }

  return { isSupported: true, reason: null };
}

export function useTranscription(): UseTranscriptionReturn {
  const [progress, setProgress] = useState<TranscriptionProgress>({ status: 'idle' });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const support = getLocalTranscriptionSupport();

  const loadModel = useCallback(async () => {
    if (transcriberPromise) {
      return transcriberPromise;
    }

    setProgress({ status: 'loading-model', modelProgress: 0, message: 'Loading Whisper model...' });
    await yieldToBrowser();

    try {
      // Dynamic import to avoid SSR issues
      const transformers = await import('@xenova/transformers');
      const { pipeline, env } = transformers;

      // Configure to load models from HuggingFace Hub, not locally
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      const createPipeline = (useProxy: boolean) => {
        env.backends.onnx.wasm.proxy = useProxy;

        return pipeline('automatic-speech-recognition', MODEL_ID, {
          progress_callback: (progressData: ModelLoadProgress) => {
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
      };

      try {
        transcriberPromise = createPipeline(true);
        const transcriber = await transcriberPromise;
        setIsModelLoaded(true);
        return transcriber;
      } catch (proxyError) {
        console.warn('[Transcription] Worker proxy unavailable, falling back to main thread.', proxyError);
        transcriberPromise = createPipeline(false);
        const transcriber = await transcriberPromise;
        setIsModelLoaded(true);
        return transcriber;
      }
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
        const transcriptionSupport = getLocalTranscriptionSupport();

        if (!transcriptionSupport.isSupported) {
          const errorMessage =
            transcriptionSupport.reason ?? 'Local transcription is not supported on this device.';
          setError(errorMessage);
          setProgress({ status: 'error', message: errorMessage });
          throw new Error(errorMessage);
        }

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

        setProgress({
          status: 'preparing-audio',
          transcriptionProgress: 0,
          message: 'Preparing audio for transcription...',
        });
        await yieldToBrowser();

        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();

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

        setProgress({
          status: 'transcribing',
          message: 'Transcribing audio locally... this may take a minute.',
        });
        await yieldToBrowser();

        // Transcribe the audio
        const result = await transcriber(audioData, {
          chunk_length_s: 30,
          stride_length_s: 5,
          language: 'english',
          task: 'transcribe',
          return_timestamps: false,
          callback_function: () => {
            // Update progress message to show activity
            setProgress({
              status: 'transcribing',
              message: 'Transcribing audio locally...'
            });
          },
        });

        const transcriptText = Array.isArray(result)
          ? result
              .map((entry) => entry?.text?.trim())
              .filter((entry): entry is string => Boolean(entry))
              .join(' ')
          : result?.text?.trim();

        if (!transcriptText) {
          throw new Error('Transcription returned invalid result');
        }

        setProgress({ status: 'complete', transcriptionProgress: 100, message: 'Transcription complete!' });

        return transcriptText;
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
    isSupported: support.isSupported,
    unsupportedReason: support.reason,
  };
}
