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
    industry?: string;
}
interface Question {
    text: string;
    answer: boolean;
    why: string;
    skill: string;
}
interface InterviewStage {
    id: string;
    name: string;
    description: string;
    duration: string;
    focus: string[];
    questionTypes: string[];
    tips: string[];
}
interface InterviewStructure {
    company: string;
    role: string;
    totalProcess: string;
    stages: InterviewStage[];
    preparationTips: string[];
    commonTopics: string[];
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
    private generateRealisticJobAnalysis;
    analyzeJobPostingWithWebSearch(input: string): Promise<SkillAnalysisResult>;
    analyzeJobPostingFast(input: string): Promise<SkillAnalysisResult>;
    analyzeJobPostingWithThinking(input: string): AsyncGenerator<{
        type: 'thinking' | 'result';
        content: string | SkillAnalysisResult;
    }, void, unknown>;
    private extractTextFromResult;
    private extractJobInfo;
    private generateRealisticJobData;
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
declare class InterviewStructureAgent {
    private client;
    constructor();
    searchWeb(query: string): Promise<string>;
    analyzeInterviewStructure(jobAnalysis: SkillAnalysisResult, company?: string, role?: string): Promise<InterviewStructure>;
    analyzeSearchResults(searchResults: string, company: string, role: string, level: string): Promise<InterviewStructure>;
    private generateRealisticInterviewStructure;
    private createFallbackStructure;
    private extractTextFromResult;
}
declare class EnhancedQuizAgent {
    private jobAnalyzer;
    private questionGenerator;
    private interviewAnalyzer;
    constructor();
    analyzeJobPosting(input: string): Promise<SkillAnalysisResult>;
    analyzeJobPostingFast(input: string): Promise<SkillAnalysisResult>;
    analyzeInterviewStructure(jobAnalysis: SkillAnalysisResult, company?: string, role?: string): Promise<InterviewStructure>;
    generateSkillBasedQuiz(skills: string[], questionsPerSkill?: number): AsyncGenerator<QuizGenerationResult, void, unknown>;
    generateQuestionsForSkill(skill: string, count?: number): Promise<Question[]>;
}
declare class CompanyResearchAgent {
    private client;
    constructor();
    searchWeb(query: string): Promise<string>;
    generateCompanyResearch(company: string, role: string): Promise<{
        overview: string;
        mission: string;
        values: string[];
        recentNews: string[];
        culture: string;
        competitivePosition: string;
        interviewFocus: string[];
        preparationTips: string[];
    }>;
    analyzeCompanySearchResults(searchResults: string, company: string, role: string): Promise<{
        overview: string;
        mission: string;
        values: string[];
        recentNews: string[];
        culture: string;
        competitivePosition: string;
        interviewFocus: string[];
        preparationTips: string[];
    }>;
    private generateRealisticCompanyData;
    private extractTextFromResult;
}
declare class TechnicalInterviewAgent {
    private client;
    constructor();
    searchWeb(query: string): Promise<string>;
    generateTechnicalContent(company: string, role: string, level: string, contentType: 'coding' | 'algorithms' | 'system-design'): Promise<{
        problems: Array<{
            title: string;
            difficulty: string;
            description: string;
            hints: string[];
            solution: string;
            companyRelevance: string;
        }>;
        concepts: Array<{
            name: string;
            explanation: string;
            examples: string[];
        }>;
    }>;
    analyzeTechnicalSearchResults(searchResults: string, company: string, role: string, level: string, contentType: string): Promise<{
        problems: Array<{
            title: string;
            difficulty: string;
            description: string;
            hints: string[];
            solution: string;
            companyRelevance: string;
        }>;
        concepts: Array<{
            name: string;
            explanation: string;
            examples: string[];
        }>;
    }>;
    private generateRealisticTechnicalContent;
    private extractTextFromResult;
}
declare class BehavioralInterviewAgent {
    private agent;
    constructor();
    generateBehavioralContent(company: string, role: string): Promise<{
        starScenarios: Array<{
            competency: string;
            situation: string;
            questions: string[];
            framework: string;
            companyContext: string;
        }>;
        companyValues: Array<{
            value: string;
            description: string;
            exampleBehaviors: string[];
        }>;
    }>;
    private extractTextFromResult;
}
declare const createEnhancedQuizAgent: () => EnhancedQuizAgent;
declare const createJobAnalysisAgent: () => JobAnalysisAgent;
declare const createQuestionGenerationAgent: () => QuestionGenerationAgent;
declare const createInterviewStructureAgent: () => InterviewStructureAgent;
declare const createCompanyResearchAgent: () => CompanyResearchAgent;
declare const createTechnicalInterviewAgent: () => TechnicalInterviewAgent;
declare const createBehavioralInterviewAgent: () => BehavioralInterviewAgent;

export { BehavioralInterviewAgent, CompanyResearchAgent, EnhancedQuizAgent, type InterviewStage, type InterviewStructure, InterviewStructureAgent, JobAnalysisAgent, type Question, QuestionGenerationAgent, type QuizGenerationResult, type SkillAnalysisResult, TechnicalInterviewAgent, createBehavioralInterviewAgent, createCompanyResearchAgent, createEnhancedQuizAgent, createInterviewStructureAgent, createJobAnalysisAgent, createQuestionGenerationAgent, createTechnicalInterviewAgent };
