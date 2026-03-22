export interface FrameworkStep {
  label: string;
  shortDesc: string;
  detailedDesc: string;
  examplePhrases: string[];
  suggestedSeconds?: number;
}

export interface Framework {
  id: string;
  name: string;
  acronym?: string;
  steps: FrameworkStep[];
  bestFor: string;
  tips: string[];
  objectiveIds?: string[];
}

export interface Topic {
  id: string;
  text: string;
  allowedFrameworkIds?: string[];
}

export interface PersistedDeckRecord {
  deckId: string;
  builtInDeckId: string | null;
  name: string | null;
  description: string | null;
  objectiveId: string | null;
  objectiveLabel: string | null;
  allowedFrameworkIds: string[];
  topics: Topic[];
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  topics: Topic[];
  objectiveId?: string;
  objectiveLabel?: string;
  allowedFrameworkIds?: string[];
  isBuiltIn?: boolean;
}

export interface PracticeSettings {
  selectedDeckId: string;
  selectedFrameworkIds: string[];
  speechDurationSeconds: number;
  prepDurationSeconds: number;
}

export interface PracticeSession {
  topic: Topic;
  framework: Framework;
  settings: PracticeSettings;
}

export type PracticePhase = 'prep' | 'speech' | 'done';
export type TimerPhase = 'prep' | 'speech' | 'done';

export interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

// Voice Recording Types

export interface RecordingMetadata {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  durationSeconds: number;
  topicId: string;
  topicText: string;
  frameworkId: string;
  frameworkName: string;
  speechDurationSetting: number;
  fileSize: number; // bytes
}

export interface Recording extends RecordingMetadata {
  transcript?: string;
  analysis?: SpeechAnalysis;
  analyzedAt?: string; // ISO timestamp
  feedbackId?: string;
}

// AI Analysis Types

export interface AnalysisSection {
  score: number; // 1-10
  feedback: string;
  highlights?: string[]; // Specific quotes or moments
}

export interface SpeechAnalysis {
  clarityAndStructure: AnalysisSection;
  concisenessAndWordChoice: AnalysisSection;
  emotionalResonance: AnalysisSection;
  toneAndPresence: AnalysisSection;
  audienceConnection: AnalysisSection;
  improvements: string[]; // 3-5 concrete improvements
  overallScore?: number; // 1-10 optional
}

export interface SpeechFeedbackRecord {
  id: string;
  createdAt: string;
  topicText: string;
  frameworkId: string | null;
  frameworkName: string;
  transcript: string;
  analysis: SpeechAnalysis;
  overallScore: number | null;
  transcriptCharCount: number;
  promptVersion: string | null;
}

// Recording State Types

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  error: string | null;
}
