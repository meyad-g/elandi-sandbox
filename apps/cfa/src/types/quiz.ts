import { Question as AIQuestion, SkillAnalysisResult } from '@sandbox-apps/ai';

export interface Question extends Omit<AIQuestion, 'skill'> {
  skill?: string;
  skills?: string[];
}

export interface Answer {
  choice: boolean;
  correct: boolean;
}

export interface Job {
  id: string;
  url: string;
  skills: string[];
  questions: AIQuestion[];
  analysis?: SkillAnalysisResult;
  thinking?: string;
}

export interface QuizState {
  current: number;
  answers: Record<number, Answer>;
  seed: number;
}

export interface Stats {
  sessions: number;
  answered: number;
  accuracy: number;
}

export type TabType = 'jobs' | 'profile';
