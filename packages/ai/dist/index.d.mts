export { Agent, run } from '@openai/agents';

declare function initializeOpenAI(apiKey: string): void;
interface SkillAnalysisResult {
    skills: string[];
    jobTitle: string;
    company?: string;
    description: string;
    location?: string;
    salary?: string;
    employmentType?: string;
    experienceLevel?: string;
    remote?: boolean;
    benefits?: string[];
    requirements?: string[];
}
interface BaseQuestion {
    text: string;
    why: string;
    skill?: string;
    objective?: string;
    difficulty?: 'knowledge' | 'application' | 'synthesis' | 'beginner' | 'intermediate' | 'advanced';
    examType?: string;
}
interface TrueFalseQuestion extends BaseQuestion {
    type: 'true_false';
    answer: boolean;
}
interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple_choice';
    options: string[];
    correct: number;
}
interface MultipleResponseQuestion extends BaseQuestion {
    type: 'multiple_response';
    options: string[];
    correct: number[];
    minSelect?: number;
    maxSelect?: number;
}
interface VignetteQuestion extends BaseQuestion {
    type: 'vignette';
    vignette: string;
    questions: MultipleChoiceQuestion[];
}
interface EssayQuestion extends BaseQuestion {
    type: 'essay';
    rubric: {
        maxPoints: number;
        criteria: Array<{
            item: string;
            points: number;
            description: string;
        }>;
    };
    sampleAnswer?: string;
}
type Question = TrueFalseQuestion | MultipleChoiceQuestion | MultipleResponseQuestion | VignetteQuestion | EssayQuestion;
interface LegacyQuestion {
    text: string;
    answer: boolean;
    why: string;
    skill: string;
}
interface ExamProfile {
    id: string;
    name: string;
    description: string;
    objectives: ExamObjective[];
    questionTypes: QuestionType[];
    constraints: ExamConstraints;
    scoring: ScoringConfig;
    timing: TimingConfig;
    uiConfig: UIConfig;
}
interface ExamObjective {
    id: string;
    title: string;
    description: string;
    weight: number;
    subObjectives?: ExamObjective[];
    level: 'knowledge' | 'application' | 'synthesis';
}
interface QuestionType {
    type: 'true_false' | 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay';
    enabled: boolean;
    constraints?: {
        optionCount?: number;
        vignetteLength?: number;
        maxQuestions?: number;
    };
}
interface ExamConstraints {
    totalQuestions: number;
    timeMinutes: number;
    sectionsCount?: number;
    passingScore?: number;
}
interface ScoringConfig {
    correctPoints: number;
    incorrectPoints: number;
    partialCredit?: boolean;
    negativeMarking?: boolean;
}
interface TimingConfig {
    totalMinutes: number;
    sectioned?: boolean;
    timePerQuestion?: number;
}
interface UIConfig {
    theme: 'cfa' | 'aws' | 'professional' | 'modern';
    primaryColor: string;
    showProgressBar: boolean;
    showTimer: boolean;
}
interface QuizGenerationResult {
    questions: Question[];
    skill: string;
    completed: boolean;
}
interface Flashcard {
    title: string;
    content: string;
    skill: string;
}
declare class JobAnalysisAgent {
    private agent;
    constructor();
    analyzeJobPosting(input: string): Promise<SkillAnalysisResult>;
    analyzeJobPostingFast(input: string): Promise<SkillAnalysisResult>;
    analyzeJobPostingWithThinking(input: string): AsyncGenerator<{
        type: 'thinking' | 'result';
        content: string | SkillAnalysisResult;
    }, void, unknown>;
    private extractTextFromResult;
}
declare class QuestionGenerationAgent {
    private agent;
    constructor();
    generateQuestionsForSkill(skill: string, stream?: boolean): AsyncGenerator<Question, void, unknown>;
    generateQuestionsBatch(skill: string, count?: number): Promise<Question[]>;
    generateSingleQuestion(skill: string): AsyncGenerator<{
        type: 'chunk' | 'complete';
        content: string | Question;
    }, void, unknown>;
    generateQuestionFromFlashcard(flashcard: Flashcard): AsyncGenerator<{
        type: 'chunk' | 'complete';
        content: string | Question;
    }, void, unknown>;
    generateSingleQuestionSync(skill: string): Promise<Question>;
    private extractTextFromResult;
}
declare class EnhancedQuizAgent {
    private jobAnalyzer;
    private questionGenerator;
    constructor();
    analyzeJobPosting(input: string): Promise<SkillAnalysisResult>;
    analyzeJobPostingFast(input: string): Promise<SkillAnalysisResult>;
    generateSkillBasedQuiz(skills: string[], questionsPerSkill?: number): AsyncGenerator<QuizGenerationResult, void, unknown>;
    generateQuestionsForSkill(skill: string, count?: number): Promise<Question[]>;
}
declare class CertificationQuestionAgent {
    private agent;
    constructor();
    generateCertificationQuestion(examProfile: ExamProfile, objective: ExamObjective, questionType?: 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay'): Promise<Question>;
    private buildMultipleChoicePrompt;
    private buildMultipleResponsePrompt;
    private buildVignettePrompt;
    private buildEssayPrompt;
    private formatQuestion;
    private createFallbackQuestion;
    private getLevelSpecificContext;
    generateCertificationFlashcard(examProfile: ExamProfile, objective: ExamObjective): Promise<{
        title: string;
        content: string;
        skill: string;
        tags: string[];
    }>;
    private extractTextFromResult;
}
declare const EXAM_PROFILES: Record<string, ExamProfile>;
declare const createEnhancedQuizAgent: () => EnhancedQuizAgent;
declare const createJobAnalysisAgent: () => JobAnalysisAgent;
declare const createQuestionGenerationAgent: () => QuestionGenerationAgent;
declare const createCertificationQuestionAgent: () => CertificationQuestionAgent;

export { type BaseQuestion, CertificationQuestionAgent, EXAM_PROFILES, EnhancedQuizAgent, type EssayQuestion, type ExamConstraints, type ExamObjective, type ExamProfile, type Flashcard, JobAnalysisAgent, type LegacyQuestion, type MultipleChoiceQuestion, type MultipleResponseQuestion, type Question, QuestionGenerationAgent, type QuestionType, type QuizGenerationResult, type ScoringConfig, type SkillAnalysisResult, type TimingConfig, type TrueFalseQuestion, type UIConfig, type VignetteQuestion, createCertificationQuestionAgent, createEnhancedQuizAgent, createJobAnalysisAgent, createQuestionGenerationAgent, initializeOpenAI };
