// Certification exam data and configurations
import {
  cfaL1,
  cfaL2, 
  cfaL3,
  awsCloudPractitioner,
  awsSaa,
  awsDeveloper,
  softwareEngineerCert,
  mlEngineerCert,
  dataEngineerCert
} from './exam-profiles/index';

export interface ExamObjective {
  id: string;
  title: string;
  description: string;
  weight: number; // Percentage of exam
  level: 'knowledge' | 'application' | 'synthesis';
  examples?: string[];
  keyTopics?: string[];
  // New fields for enhanced functionality
  questionsPerSession?: number; // Recommended questions per study session
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[]; // Other objective IDs that should be studied first
  learningOutcomes?: string[]; // Specific LOS (Learning Outcome Statements)
}

export interface ExamProfile {
  id: string;
  name: string;
  description: string;
  provider: string;
  objectives: ExamObjective[];
  questionTypes: ('multiple_choice' | 'multiple_response' | 'vignette' | 'essay')[];
  constraints: {
    totalQuestions: number;
    timeMinutes: number;
    optionCount: number; // 3 for CFA, 4 for AWS
    passingScore: number;
  };
  context: {
    examFormat: string;
    difficulty: string;
    focus: string;
    calculatorAllowed?: boolean;
    commonFormulas?: string[];
    terminology?: string[];
  };
  // New fields for enhanced study experience
  studySettings?: {
    defaultQuestionsPerObjective: number;
    masteryThreshold: number; // Percentage to consider "mastered"
    spaceRepetition: boolean;
    adaptiveDifficulty: boolean;
  };
}

export const EXAM_PROFILES: Record<string, ExamProfile> = {
  'cfa-l1': cfaL1,

  'cfa-l2': cfaL2,

  'cfa-l3': cfaL3,

  'aws-cloud-practitioner': awsCloudPractitioner,

  'aws-saa': awsSaa,

  'aws-developer': awsDeveloper,

  'software-engineer-cert': softwareEngineerCert,

  'ml-engineer-cert': mlEngineerCert,

  'data-engineer-cert': dataEngineerCert
};

export const getExamProfile = (examId: string): ExamProfile | null => {
  return EXAM_PROFILES[examId] || null;
};

export const getExamObjective = (examId: string, objectiveId: string): ExamObjective | null => {
  const exam = getExamProfile(examId);
  return exam?.objectives.find(obj => obj.id === objectiveId) || null;
};

export const getAllExams = (): ExamProfile[] => {
  return Object.values(EXAM_PROFILES);
};
