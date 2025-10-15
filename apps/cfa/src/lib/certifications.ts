// Certification exam data and configurations
import {
  cfaL1,
  cfaL2, 
  cfaL3,
  awsCloudPractitioner,
  awsSaa,
  awsDeveloper,
  awsDataAnalyticsSpecialty,
  softwareEngineerCert,
  mlEngineerCert,
  dataEngineerCert
} from './exam-profiles/index';
import { QuestionStyle } from './questionPatterns';

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
  // Question style preferences for this objective
  questionStylePreferences?: Partial<Record<QuestionStyle, number>>; // Override default distribution
  preferredQuestionStyles?: QuestionStyle[]; // Explicitly preferred styles for this topic
  avoidedQuestionStyles?: QuestionStyle[]; // Styles to avoid for this topic
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
  // Question generation preferences
  questionGeneration?: {
    defaultQuestionDistribution?: Partial<Record<QuestionStyle, number>>; // Override global defaults
    styleValidation?: boolean; // Whether to validate generated questions against style requirements
    allowFallbackStyles?: boolean; // Whether to fall back to other styles if preferred style fails
    maxRetries?: number; // Maximum retries for question generation
  };
}

// Global in-memory store for dynamically generated guild profiles
// Using globalThis to persist across Next.js requests
declare global {
  var guildProfiles: Map<string, ExamProfile> | undefined;
}

const DYNAMIC_GUILD_PROFILES = globalThis.guildProfiles ?? new Map<string, ExamProfile>();
if (!globalThis.guildProfiles) {
  globalThis.guildProfiles = DYNAMIC_GUILD_PROFILES;
}

export const EXAM_PROFILES: Record<string, ExamProfile> = {
  // Finance Certifications (CFA Institute)
  'cfa-l1': cfaL1,
  'cfa-l2': cfaL2,
  'cfa-l3': cfaL3,

  // AWS Cloud Certifications (Foundation → Associate → Specialty)
  'aws-cloud-practitioner': awsCloudPractitioner,
  'aws-developer': awsDeveloper,
  'aws-saa': awsSaa,
  'aws-data-analytics-specialty': awsDataAnalyticsSpecialty,

  // Enterprise Guild Certifications
  'software-engineer-cert': softwareEngineerCert,
  'data-engineer-cert': dataEngineerCert,
  'ml-engineer-cert': mlEngineerCert
};

// Add a guild profile to the dynamic store
export const addGuildProfile = (profile: ExamProfile): void => {
  console.log('Adding guild profile:', profile.id, profile.name);
  DYNAMIC_GUILD_PROFILES.set(profile.id, profile);
  console.log('Guild profiles now:', Array.from(DYNAMIC_GUILD_PROFILES.keys()));
};

// Get all guild profiles (static + dynamic)
export const getAllGuildProfiles = (): ExamProfile[] => {
  return Array.from(DYNAMIC_GUILD_PROFILES.values());
};

export const getExamProfile = (examId: string): ExamProfile | null => {
  console.log('Looking for exam profile:', examId);
  console.log('Available guild profiles:', Array.from(DYNAMIC_GUILD_PROFILES.keys()));
  
  // First check dynamic guild profiles
  const guildProfile = DYNAMIC_GUILD_PROFILES.get(examId);
  if (guildProfile) {
    console.log('Found guild profile:', guildProfile.name);
    return guildProfile;
  }
  
  // Fall back to static profiles
  const staticProfile = EXAM_PROFILES[examId];
  if (staticProfile) {
    console.log('Found static profile:', staticProfile.name);
  } else {
    console.log('No profile found for:', examId);
  }
  return staticProfile || null;
};

export const getExamObjective = (examId: string, objectiveId: string): ExamObjective | null => {
  const exam = getExamProfile(examId);
  return exam?.objectives.find(obj => obj.id === objectiveId) || null;
};

export const getAllExams = (): ExamProfile[] => {
  return Object.values(EXAM_PROFILES);
};
