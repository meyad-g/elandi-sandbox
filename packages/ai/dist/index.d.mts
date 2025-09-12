export { Agent, run } from '@openai/agents';

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
interface Question {
    text: string;
    answer: boolean;
    why: string;
    skill: string;
}
interface QuizGenerationResult {
    questions: Question[];
    skill: string;
    completed: boolean;
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
declare const createEnhancedQuizAgent: () => EnhancedQuizAgent;
declare const createJobAnalysisAgent: () => JobAnalysisAgent;
declare const createQuestionGenerationAgent: () => QuestionGenerationAgent;

export { EnhancedQuizAgent, JobAnalysisAgent, type Question, QuestionGenerationAgent, type QuizGenerationResult, type SkillAnalysisResult, createEnhancedQuizAgent, createJobAnalysisAgent, createQuestionGenerationAgent };
