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
}

export interface Topic {
  id: string;
  text: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  topics: Topic[];
  isDefault?: boolean;
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
