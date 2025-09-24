import { Question as AIQuestion, SkillAnalysisResult } from '@sandbox-apps/ai';

export interface Question extends Omit<AIQuestion, 'skill'> {
  skill?: string;
  skills?: string[];
}

export interface Answer {
  choice: boolean;
  correct: boolean;
}

export interface InterviewStage {
  id: string;
  name: string;
  description: string;
  duration: string;
  focus: string[];
  questionTypes: string[];
  tips: string[];
}

export interface InterviewStructure {
  company: string;
  role: string;
  totalProcess: string;
  stages: InterviewStage[];
  preparationTips: string[];
  commonTopics: string[];
}

export interface Job {
  id: string;
  url: string;
  skills: string[];
  questions: AIQuestion[];
  analysis?: SkillAnalysisResult;
  thinking?: string;
  interviewStructure?: InterviewStructure;
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
