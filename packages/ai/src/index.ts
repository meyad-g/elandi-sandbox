import {
  Agent,
  run,
  webSearchTool,
  setDefaultOpenAIKey
} from '@openai/agents';

// Re-export core OpenAI Agents functionality
export { Agent, run } from '@openai/agents';

// Initialize OpenAI API key when needed (lazy initialization)
function ensureOpenAIKey() {
  // Check if we're in a server environment (not browser)
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).window === 'undefined') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      setDefaultOpenAIKey(apiKey);
    } else {
      console.warn('OPENAI_API_KEY environment variable not found. Make sure it is set in your .env.local file.');
      console.warn('Current environment variables:', Object.keys(process.env).filter(key => key.includes('OPENAI')));
    }
  }
}

// Alternative initialization that can be called manually with API key
export function initializeOpenAI(apiKey: string) {
  setDefaultOpenAIKey(apiKey);
}

// Types for different agent configurations
export interface SkillAnalysisResult {
  skills: string[];
  jobTitle: string;
  company?: string;
  description: string;
  location?: string;
  salary?: string;
  employmentType?: string; // Full-time, Part-time, Contract, etc.
  experienceLevel?: string; // Junior, Mid, Senior, etc.
  remote?: boolean;
  benefits?: string[];
  requirements?: string[];
}

// Enhanced question types for certification exams
export interface BaseQuestion {
  text: string;
  why: string;
  skill?: string;
  objective?: string; // Learning objective/blueprint item
  difficulty?: 'knowledge' | 'application' | 'synthesis' | 'beginner' | 'intermediate' | 'advanced';
  examType?: string; // 'cfa-l1', 'aws-saa', etc.
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  answer: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[]; // A, B, C (CFA L1) or A, B, C, D (AWS)
  correct: number; // Index of correct answer
}

export interface MultipleResponseQuestion extends BaseQuestion {
  type: 'multiple_response';
  options: string[];
  correct: number[]; // Array of indices for correct answers
  minSelect?: number; // e.g., "Choose 2"
  maxSelect?: number;
}

export interface VignetteQuestion extends BaseQuestion {
  type: 'vignette';
  vignette: string; // The scenario/case study
  questions: MultipleChoiceQuestion[]; // Follow-up questions
}

export interface EssayQuestion extends BaseQuestion {
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

export type Question = TrueFalseQuestion | MultipleChoiceQuestion | MultipleResponseQuestion | VignetteQuestion | EssayQuestion;

// Legacy question type for backward compatibility
export interface LegacyQuestion {
  text: string;
  answer: boolean;
  why: string;
  skill: string;
}

// Exam profile system
export interface ExamProfile {
  id: string; // 'cfa-l1', 'cfa-l2', 'cfa-l3', 'aws-saa', etc.
  name: string;
  description: string;
  objectives: ExamObjective[];
  questionTypes: QuestionType[];
  constraints: ExamConstraints;
  scoring: ScoringConfig;
  timing: TimingConfig;
  uiConfig: UIConfig;
}

export interface ExamObjective {
  id: string;
  title: string;
  description: string;
  weight: number; // Percentage of exam
  subObjectives?: ExamObjective[];
  level: 'knowledge' | 'application' | 'synthesis'; // Bloom's taxonomy
}

export interface QuestionType {
  type: 'true_false' | 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay';
  enabled: boolean;
  constraints?: {
    optionCount?: number; // 3 for CFA L1, 4-5 for AWS
    vignetteLength?: number;
    maxQuestions?: number;
  };
}

export interface ExamConstraints {
  totalQuestions: number;
  timeMinutes: number;
  sectionsCount?: number;
  passingScore?: number;
}

export interface ScoringConfig {
  correctPoints: number;
  incorrectPoints: number;
  partialCredit?: boolean;
  negativeMarking?: boolean;
}

export interface TimingConfig {
  totalMinutes: number;
  sectioned?: boolean;
  timePerQuestion?: number;
}

export interface UIConfig {
  theme: 'cfa' | 'aws' | 'professional' | 'modern';
  primaryColor: string;
  showProgressBar: boolean;
  showTimer: boolean;
}

export interface QuizGenerationResult {
  questions: Question[];
  skill: string;
  completed: boolean;
}

export interface Flashcard {
  title: string;
  content: string;
  skill: string;
}

// Job Analysis Agent - analyzes job postings and handles search terms
export class JobAnalysisAgent {
  private agent: Agent;

  constructor() {
    ensureOpenAIKey();
    this.agent = new Agent({
      name: 'Job Analysis Agent',
      instructions: `You are a job analysis expert. Your task is to:
1. Determine if the input is a direct job posting URL or a search term
2. If it's a URL: Visit the provided job posting URL using the web search tool
3. If it's a search term: Search for relevant job postings on sites like Glassdoor, LinkedIn, Indeed, etc.
4. Extract key skills and requirements from the job posting
5. Identify the job title, company, location, salary, and other job details
6. Categorize skills into relevant technical domains
7. Return a comprehensive structured analysis

Important: For search terms, search multiple job sites and select the most relevant posting. Be persistent - if one search approach fails, try alternative search terms.`,
      tools: [webSearchTool()],
    });
  }

  async analyzeJobPosting(input: string): Promise<SkillAnalysisResult> {
    try {
      // Determine if input is a URL or search term
      const isUrl = /^https?:\/\//i.test(input.trim());

      let prompt: string;
      if (isUrl) {
        // Handle direct URL
        prompt = `Analyze this job posting URL: ${input}

IMPORTANT: First explain your thinking process, then provide the final JSON.

Step 1: Use the web search tool to access the job posting URL directly.
Step 2: If the direct URL fails, try searching for the company and job information extracted from the URL.
Step 3: Analyze what you found - job title, company, location, salary, requirements, etc.
Step 4: Extract and categorize the technical skills into clear domains.
Step 5: Identify job details like location, salary range, employment type, experience level.
Step 6: Provide your final analysis in this EXACT JSON format at the end:

===JSON_START===
{
  "jobTitle": "Data Scientist",
  "company": "Tech Company Inc",
  "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "description": "Brief description of the role",
  "location": "London, UK" or "Remote" or "New York, NY",
  "salary": "£60,000 - £80,000" or "$120,000 - $150,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Flexible hours"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}
===JSON_END===

Extract as much information as possible. If information is not available, use null or empty arrays. Make sure the JSON is valid and never use undefined.`;
      } else {
        // Handle search term
        prompt = `Find and analyze a job posting based on this search: "${input}"

IMPORTANT: First search for relevant job postings, then analyze the best match.

Step 1: Interpret the search term and identify the job role, company (if mentioned), and location preferences.
Step 2: Search multiple job sites (Glassdoor, LinkedIn, Indeed, company career pages) for relevant postings.
Step 3: Select the most relevant and recent job posting that matches the search criteria.
Step 4: Use the web search tool to access the full job posting details.
Step 5: Analyze the selected job posting - extract job title, company, location, salary, requirements, etc.
Step 6: Extract and categorize the technical skills into clear domains.
Step 7: Identify job details like location, salary range, employment type, experience level.
Step 8: Provide your final analysis in this EXACT JSON format at the end:

===JSON_START===
{
  "jobTitle": "Software Engineer",
  "company": "Meta",
  "skills": ["React", "JavaScript", "Python", "Machine Learning"],
  "description": "Brief description of the role",
  "location": "Menlo Park, CA" or "Remote" or "New York, NY",
  "salary": "$150,000 - $220,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Stock options"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}
===JSON_END===

Be thorough in your search and select the most relevant posting. Extract as much information as possible. If information is not available, use null or empty arrays. Make sure the JSON is valid and never use undefined.`;
      }

      const result = await run(this.agent, prompt);

      // Extract text from the result
      const content = this.extractTextFromResult(result);

      // Extract JSON from between markers
      const jsonMatch = content.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          // Sanitize the JSON to replace undefined with null
          const sanitizedJson = jsonMatch[1].trim().replace(/:\s*undefined/g, ': null');
          return JSON.parse(sanitizedJson);
        } catch (parseError) {
          console.error('Error parsing extracted JSON:', parseError);
          console.log('Extracted JSON content:', jsonMatch[1]);
        }
      }

      // Fallback parsing without markers
      try {
        const lastJsonStart = content.lastIndexOf('{');
        const lastJsonEnd = content.lastIndexOf('}') + 1;
        if (lastJsonStart !== -1 && lastJsonEnd > lastJsonStart) {
          const jsonContent = content.substring(lastJsonStart, lastJsonEnd);
          return JSON.parse(jsonContent);
        }
      } catch (parseError) {
        console.error('Error with fallback JSON parsing:', parseError);
      }

      console.error('Could not extract valid JSON from response:', content);
      return {
        skills: [],
        jobTitle: 'Unknown Position',
        company: 'Unknown Company',
        description: 'Could not analyze job posting',
        location: undefined,
        salary: undefined,
        employmentType: undefined,
        experienceLevel: undefined,
        remote: false,
        benefits: [],
        requirements: []
      };
    } catch (error) {
      console.error('Error analyzing job posting:', error);
      throw error;
    }
  }

  async analyzeJobPostingFast(input: string): Promise<SkillAnalysisResult> {
    try {
      // Determine if input is a URL or search term
      const isUrl = /^https?:\/\//i.test(input.trim());

      let prompt: string;
      if (isUrl) {
        prompt = `Analyze this job posting and return ONLY the JSON: ${input}`;
      } else {
        prompt = `Find and analyze a job posting based on this search and return ONLY the JSON: "${input}"

Search for relevant job postings on Glassdoor, LinkedIn, Indeed, etc., then analyze the best match and return the JSON.`;
      }

      prompt += `

Return the analysis in this EXACT JSON format (no explanation, no thinking process, just the JSON):

{
  "jobTitle": "Data Scientist",
  "company": "Tech Company Inc",
  "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "description": "Brief description of the role",
  "location": "London, UK" or "Remote" or "New York, NY",
  "salary": "£60,000 - £80,000" or "$120,000 - $150,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Flexible hours"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}

Use the web search tool to get job information. If information is not available, use null or empty arrays. Never use undefined.`;

      const result = await run(this.agent, prompt);

      // Extract text from the result
      const content = this.extractTextFromResult(result);

      // Try to find JSON in the response
      try {
        // First try to find JSON between curly braces
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          const jsonContent = content.substring(jsonStart, jsonEnd);
          // Sanitize the JSON to replace undefined with null
          const sanitizedJson = jsonContent.replace(/:\s*undefined/g, ': null');
          return JSON.parse(sanitizedJson);
        }
      } catch (parseError) {
        console.error('Error parsing JSON from fast analysis:', parseError);
        console.log('Raw content:', content);
      }

      // Fallback to default response
      console.error('Could not extract valid JSON from fast analysis response:', content);
      return {
        skills: [],
        jobTitle: 'Unknown Position',
        company: 'Unknown Company',
        description: 'Could not analyze job posting',
        location: undefined,
        salary: undefined,
        employmentType: undefined,
        experienceLevel: undefined,
        remote: false,
        benefits: [],
        requirements: []
      };
    } catch (error) {
      console.error('Error in fast job analysis:', error);
      throw error;
    }
  }

  async *analyzeJobPostingWithThinking(input: string): AsyncGenerator<{type: 'thinking' | 'result', content: string | SkillAnalysisResult}, void, unknown> {
    try {
      // Determine if input is a URL or search term
      const isUrl = /^https?:\/\//i.test(input.trim());

      let prompt: string;
      if (isUrl) {
        prompt = `Analyze this job posting: ${input}`;
      } else {
        prompt = `Find and analyze a job posting based on this search: "${input}"

First search for relevant job postings, then analyze the best match.`;
      }

      prompt += `

IMPORTANT: Think step by step and explain your process as you work.

Step 1: Use the web search tool to access the job posting. If direct access fails, extract company/role info from URL and search for it.
Step 2: Analyze what you found - explain the job title, company, location, salary, and requirements you see.
Step 3: Extract and list the technical skills, categorizing them clearly.
Step 4: Identify employment details like work type, experience level, benefits.
Step 5: Be resourceful - if initial search fails, try alternative approaches.
Step 6: Provide your final analysis in this EXACT JSON format at the very end:

===JSON_START===
{
  "jobTitle": "Data Scientist",
  "company": "Tech Company Inc",
  "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "description": "Brief description of the role",
  "location": "London, UK" or "Remote" or "New York, NY",
  "salary": "£60,000 - £80,000" or "$120,000 - $150,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Flexible hours"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}
===JSON_END===

Be thorough in your thinking process. Extract as much information as possible before providing the final JSON. IMPORTANT: Use null instead of undefined for missing values.`;

      const result = await run(this.agent, prompt, {
        stream: true
      });

      let fullContent = '';
      let hasStartedJson = false;

      if (result.toStream) {
        for await (const event of result.toStream()) {
          if (event.type === 'raw_model_stream_event' && event.data?.type === 'output_text_delta') {
            const delta = event.data.delta || '';
            fullContent += delta;

            // Check if we've hit the JSON marker
            if (fullContent.includes('===JSON_START===')) {
              hasStartedJson = true;
            }

            if (!hasStartedJson) {
              // Stream the thinking process
              yield { type: 'thinking', content: delta };
            }
          }
        }
      }

      // Extract and parse the final JSON
      const jsonMatch = fullContent.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          // Sanitize the JSON to replace undefined with null
          const sanitizedJson = jsonMatch[1].trim().replace(/:\s*undefined/g, ': null');
          const parsed = JSON.parse(sanitizedJson);
          yield { type: 'result', content: parsed };
          return;
        } catch (parseError) {
          console.error('Error parsing extracted JSON:', parseError);
          console.log('Raw JSON content:', jsonMatch[1]);
        }
      }

      // Fallback result
      yield {
        type: 'result',
        content: {
          skills: [],
          jobTitle: 'Unknown Position',
          company: 'Unknown Company',
          description: 'Could not analyze job posting',
          location: undefined,
          salary: undefined,
          employmentType: undefined,
          experienceLevel: undefined,
          remote: false,
          benefits: [],
          requirements: []
        }
      };
    } catch (error) {
      console.error('Error analyzing job posting:', error);
      throw error;
    }
  }

  private extractTextFromResult(result: any): string {
    // Handle different result formats
    if (result.output?.text) {
      return result.output.text;
    }
    if (Array.isArray(result.output)) {
      return result.output.map((item: any) => item.text || '').join('');
    }
    return '';
  }
}

// Question Generation Agent - generates streaming questions by skill
export class QuestionGenerationAgent {
  private agent: Agent;

  constructor() {
    ensureOpenAIKey();
    this.agent = new Agent({
      name: 'Question Generation Agent',
      instructions: `You are an expert quiz question generator. Your task is to:
1. Generate exactly 5 true/false questions for a specific skill
2. Questions should test practical knowledge and understanding
3. Provide clear, helpful explanations
4. Focus on real-world applications
5. Ensure questions are educational and progressively challenging

Generate questions that would be relevant for someone preparing for a job in this field.`,
    });
  }

  async *generateQuestionsForSkill(skill: string, stream: boolean = true): AsyncGenerator<Question, void, unknown> {
    try {
      const result = await run(this.agent, `Generate 5 true/false questions about ${skill}.

Requirements:
- Questions should test practical knowledge
- Mix of conceptual and applied questions
- Provide clear, educational explanations
- Focus on job-relevant scenarios

Format each question as a separate JSON object:
{"text": "Question text here?", "answer": true/false, "why": "Explanation here", "skill": "${skill}"}`, {
        stream: stream as any
      });

      if (stream && (result as any).stream) {
        // Handle streaming response
        const questions: Question[] = [];
        let currentQuestion = '';

        for await (const event of (result as any).stream) {
          if (event.type === 'raw_model_stream_event' && event.data.type === 'output_text_delta') {
            currentQuestion += event.data.delta;

            // Try to parse complete questions
            const lines = currentQuestion.split('\n');
            for (const line of lines) {
              if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                try {
                  const question: Question = JSON.parse(line.trim());
                  questions.push(question);
                  yield question;

                  if (questions.length >= 5) {
                    return;
                  }
                } catch (e) {
                  // Not a complete JSON object yet
                }
              }
            }
          }
        }
      } else {
        // Handle non-streaming response
        const content = this.extractTextFromResult(result);
        const lines = content.split('\n');

        for (const line of lines) {
          if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
            try {
              const question: Question = JSON.parse(line.trim());
              yield question;
            } catch (e) {
              console.error('Error parsing question:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  async generateQuestionsBatch(skill: string, count: number = 5): Promise<Question[]> {
    const questions: Question[] = [];

    for await (const question of this.generateQuestionsForSkill(skill, false)) {
      questions.push(question);
      if (questions.length >= count) break;
    }

    return questions;
  }

  async *generateSingleQuestion(skill: string): AsyncGenerator<{type: 'chunk' | 'complete', content: string | Question}, void, unknown> {
    try {
      console.log('AI: Starting generateSingleQuestion for skill:', skill);
      // Use real streaming from the AI, just like job analysis
      const result = await run(this.agent, `Generate 1 challenging true/false question about ${skill}.

Requirements:
- Create a specific, practical question that tests real understanding
- Focus on common misconceptions, best practices, or technical details
- Mix true and false answers (randomly distribute - don't always make it true)
- Make it job-interview level difficulty
- Include a clear, educational explanation that teaches something valuable
- Return ONLY the JSON object, no extra text

Examples of good questions:
- "In PyTorch, gradients are automatically zeroed after each backward pass?" (False - you must manually zero them)
- "React components re-render every time their parent component re-renders?" (True - unless memoized)
- "In Python, 'is' and '==' always return the same result for strings?" (False - 'is' checks identity, '==' checks value)

Generate JSON:
{"text": "Your specific question here?", "answer": true/false, "why": "Detailed explanation here", "skill": "${skill}"}`, {
        stream: true
      });

      let accumulatedText = '';
      let questionText = '';
      let isCollectingQuestion = false;

      console.log('AI: Checking if result has stream...', !!(result as any).stream);
      if ((result as any).stream) {
        console.log('AI: Starting to process stream events...');
        for await (const event of (result as any).stream) {
          if (event.type === 'raw_model_stream_event' && event.data?.type === 'output_text_delta') {
            const delta = event.data.delta || '';
            accumulatedText += delta;
            console.log('AI: Got delta:', delta, 'Accumulated:', accumulatedText.length, 'chars');

            // Stream the thinking/reasoning process
            if (accumulatedText.includes('Question') || accumulatedText.includes('question') || isCollectingQuestion) {
              isCollectingQuestion = true;

              // Extract question text from accumulated content
              const questionMatch = accumulatedText.match(/"text"\s*:\s*"([^"]*(?:\.[^"]*)*)"/);
              if (questionMatch) {
                const currentQuestionText = questionMatch[1];

                // Only yield if we have new content
                if (currentQuestionText !== questionText) {
                  const newChars = currentQuestionText.slice(questionText.length);
                  if (newChars) {
                    yield { type: 'chunk', content: newChars };
                    questionText = currentQuestionText;
                  }
                }
              }
            } else {
              // Stream the thinking process
              yield { type: 'chunk', content: delta };
            }
          }
        }
      } else {
        console.log('AI: No stream available, falling back to sync generation');
        // Fallback to non-streaming if streaming not available
        const question = await this.generateSingleQuestionSync(skill);

        // Simulate streaming by yielding the question text in chunks
        const questionText = `Question: ${question.text}`;
        const chunkSize = 8; // Characters per chunk

        for (let i = 0; i < questionText.length; i += chunkSize) {
          const chunk = questionText.slice(i, i + chunkSize);
          yield { type: 'chunk', content: chunk };

          // Small delay to simulate real streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Add a final delay before showing the complete question
        await new Promise(resolve => setTimeout(resolve, 200));

        // Yield the complete question
        yield { type: 'complete', content: question };
        return;
      }

      // Try to extract the final question from accumulated text
      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const question = JSON.parse(jsonMatch[0]);
          if (question.text && typeof question.answer === 'boolean' && question.why) {
            yield { type: 'complete', content: question };
          } else {
            throw new Error('Invalid question format');
          }
        } catch (parseError) {
          console.error('Error parsing final question JSON:', parseError);
          // Fallback to sync generation
          const question = await this.generateSingleQuestionSync(skill);
          yield { type: 'complete', content: question };
        }
      } else {
        // Fallback to sync generation
        const question = await this.generateSingleQuestionSync(skill);
        yield { type: 'complete', content: question };
      }

    } catch (error) {
      console.error('Error generating single question:', error);
      throw error;
    }
  }

  // Generate question from flashcard content
  async *generateQuestionFromFlashcard(flashcard: Flashcard): AsyncGenerator<{type: 'chunk' | 'complete', content: string | Question}, void, unknown> {
    try {
      console.log('AI: Starting generateQuestionFromFlashcard for flashcard:', flashcard.title);
      
      const result = await run(this.agent, `Generate 1 challenging true/false question based on this flashcard content.
      
Flashcard Title: ${flashcard.title}
Flashcard Content: ${flashcard.content}
Skill: ${flashcard.skill}

Requirements:
- Create a question that tests understanding of the flashcard content
- Focus on the key concepts or facts from the flashcard
- Mix true and false answers (randomly distribute)
- Make it educational and provide a clear explanation
- Return ONLY the JSON object, no extra text

Generate JSON:
{"text": "Question based on the flashcard content?", "answer": true/false, "why": "Explanation referencing the flashcard content", "skill": "${flashcard.skill}"}`, {
        stream: true
      });

      let accumulatedText = '';
      
      if ((result as any).stream) {
        for await (const event of (result as any).stream) {
          if (event.type === 'raw_model_stream_event' && event.data?.type === 'output_text_delta') {
            const delta = event.data.delta || '';
            accumulatedText += delta;
            
            // Stream the content as it's generated
            yield { type: 'chunk', content: delta };
          }
        }
      }

      // Extract and parse the final question
      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const question = JSON.parse(jsonMatch[0]);
          if (question.text && typeof question.answer === 'boolean' && question.why) {
            yield { type: 'complete', content: {
              type: 'true_false',
              text: question.text,
              answer: question.answer,
              why: question.why,
              skill: flashcard.skill
            } as TrueFalseQuestion };
          } else {
            throw new Error('Invalid question format');
          }
        } catch (parseError) {
          console.error('Error parsing flashcard question JSON:', parseError);
          // Fallback question
          const fallbackQuestion: TrueFalseQuestion = {
            type: 'true_false',
            text: `The flashcard "${flashcard.title}" covers key concepts in ${flashcard.skill}?`,
            answer: true,
            why: `This question is based on the flashcard content about ${flashcard.title}.`,
            skill: flashcard.skill
          };
          yield { type: 'complete', content: fallbackQuestion };
        }
      } else {
        // Fallback question
        const fallbackQuestion: TrueFalseQuestion = {
          type: 'true_false',
          text: `The flashcard "${flashcard.title}" covers key concepts in ${flashcard.skill}?`,
          answer: true,
          why: `This question is based on the flashcard content about ${flashcard.title}.`,
          skill: flashcard.skill
        };
        yield { type: 'complete', content: fallbackQuestion };
      }

    } catch (error) {
      console.error('Error generating question from flashcard:', error);
      throw error;
    }
  }

  async generateSingleQuestionSync(skill: string): Promise<Question> {
    try {
      const result = await run(this.agent, `Generate 1 challenging true/false question about ${skill}.

Requirements:
- Create a specific, practical question that tests real understanding
- Focus on common misconceptions, best practices, or technical details
- Mix true and false answers (randomly distribute - don't always make it true)
- Make it job-interview level difficulty
- Include a clear, educational explanation that teaches something valuable
- Return ONLY the JSON object, no extra text

Examples of good questions:
- "In PyTorch, gradients are automatically zeroed after each backward pass?" (False - you must manually zero them)
- "React components re-render every time their parent component re-renders?" (True - unless memoized)
- "In Python, 'is' and '==' always return the same result for strings?" (False - 'is' checks identity, '==' checks value)

Generate JSON:
{"text": "Your specific question here?", "answer": true/false, "why": "Detailed explanation here", "skill": "${skill}"}`);

      // Extract text from the result
      const content = this.extractTextFromResult(result);

      // Extract JSON from between markers or find it in the content
      let jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          // Sanitize the JSON to replace undefined with null
          const sanitizedJson = jsonMatch[0].trim().replace(/:\s*undefined/g, ': null');
          const question = JSON.parse(sanitizedJson);

          // Validate the question has required fields
          if (question.text && typeof question.answer === 'boolean' && question.why) {
            return {
              type: 'true_false',
              text: question.text,
              answer: question.answer,
              why: question.why,
              skill: skill
            } as TrueFalseQuestion;
          }
        } catch (parseError) {
          console.error('Error parsing question JSON:', parseError);
        }
      }

      // Fallback question if parsing fails
      return {
        type: 'true_false',
        text: `What is a key concept in ${skill}?`,
        answer: true,
        why: `This is a fallback question about ${skill}. Please try generating again.`,
        skill
      } as TrueFalseQuestion;
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback question if generation fails
      return {
        type: 'true_false',
        text: `What is a key concept in ${skill}?`,
        answer: true,
        why: `This is a fallback question about ${skill}. Please try generating again.`,
        skill
      } as TrueFalseQuestion;
    }
  }

  private extractTextFromResult(result: any): string {
    // Handle different result formats
    if (result.output?.text) {
      return result.output.text;
    }
    if (Array.isArray(result.output)) {
      return result.output.map((item: any) => item.text || '').join('');
    }
    return '';
  }
}

// Enhanced Quiz Agent - manages the entire quiz flow
export class EnhancedQuizAgent {
  private jobAnalyzer: JobAnalysisAgent;
  private questionGenerator: QuestionGenerationAgent;

  constructor() {
    this.jobAnalyzer = new JobAnalysisAgent();
    this.questionGenerator = new QuestionGenerationAgent();
  }

  async analyzeJobPosting(input: string): Promise<SkillAnalysisResult> {
    return this.jobAnalyzer.analyzeJobPosting(input);
  }

  async analyzeJobPostingFast(input: string): Promise<SkillAnalysisResult> {
    return this.jobAnalyzer.analyzeJobPostingFast(input);
  }

  async *generateSkillBasedQuiz(
    skills: string[],
    questionsPerSkill: number = 5
  ): AsyncGenerator<QuizGenerationResult, void, unknown> {
    for (const skill of skills) {
      const questions: Question[] = [];

      try {
        for await (const question of this.questionGenerator.generateQuestionsForSkill(skill, true)) {
          questions.push(question);

          if (questions.length >= questionsPerSkill) {
            yield {
              questions,
              skill,
              completed: true
            };
            break;
          }

          // Yield partial results for streaming
          if (questions.length > 0) {
            yield {
              questions: [...questions],
              skill,
              completed: false
            };
          }
        }
      } catch (error) {
        console.error(`Error generating questions for skill ${skill}:`, error);
        // Continue with next skill
      }
    }
  }

  async generateQuestionsForSkill(skill: string, count: number = 5): Promise<Question[]> {
    return this.questionGenerator.generateQuestionsBatch(skill, count);
  }
}

// Certification Question Generation Agent - specialized for exam prep
export class CertificationQuestionAgent {
  private agent: Agent;

  constructor() {
    ensureOpenAIKey();
    this.agent = new Agent({
      name: 'Certification Question Agent',
      instructions: `You are an expert certification exam question writer. Your task is to:
1. Generate high-quality questions for professional certification exams
2. Follow specific exam formats (CFA, AWS, etc.) and their unique constraints
3. Ensure questions test real understanding and practical application
4. Create questions aligned with official exam objectives and blueprints
5. Maintain consistent difficulty levels appropriate for the certification level
6. Provide clear, educational explanations that teach key concepts

You must generate questions that mirror the style and rigor of actual certification exams.`,
    });
  }

  async generateCertificationQuestion(
    examProfile: ExamProfile,
    objective: ExamObjective,
    questionType: 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay' = 'multiple_choice'
  ): Promise<Question> {
    try {
      // Ensure OpenAI key is set before making request
      ensureOpenAIKey();
      
      let prompt = '';
      
      switch (questionType) {
        case 'multiple_choice':
          prompt = this.buildMultipleChoicePrompt(examProfile, objective);
          break;
        case 'multiple_response':
          prompt = this.buildMultipleResponsePrompt(examProfile, objective);
          break;
        case 'vignette':
          prompt = this.buildVignettePrompt(examProfile, objective);
          break;
        case 'essay':
          prompt = this.buildEssayPrompt(examProfile, objective);
          break;
      }

      const result = await run(this.agent, prompt);
      const content = this.extractTextFromResult(result);
      
      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.formatQuestion(parsed, questionType, examProfile.id, objective);
      }

      throw new Error('Could not parse question from response');
    } catch (error) {
      console.error('Error generating certification question:', error);
      console.error('API Key available:', !!process.env.OPENAI_API_KEY);
      return this.createFallbackQuestion(examProfile, objective, questionType);
    }
  }

  private buildMultipleChoicePrompt(examProfile: ExamProfile, objective: ExamObjective): string {
    const optionCount = examProfile.questionTypes.find(qt => qt.type === 'multiple_choice')?.constraints?.optionCount || 4;
    const optionLabels = optionCount === 3 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
    
    // Get level-specific context and examples
    const levelContext = this.getLevelSpecificContext(examProfile.id, objective);
    
    return `Generate 1 ${examProfile.name} multiple-choice question for this learning objective:

Objective: ${objective.title}
Description: ${objective.description}
Difficulty Level: ${objective.level}
Weight in Exam: ${objective.weight}%

${levelContext}

Requirements:
- Create a challenging question that tests ${objective.level}-level understanding
- Use exactly ${optionCount} answer choices (${optionLabels.join(', ')})
- Focus on practical application and real-world scenarios typical for this certification level
- Ensure only one clearly correct answer
- Make distractors plausible but clearly wrong to those who understand the concept
- Use appropriate terminology and concepts for this specific certification
- Provide a detailed explanation that references the learning objective and certification context

Return JSON format:
{
  "text": "Question stem here?",
  "options": ["Option A text", "Option B text", "Option C text"${optionCount === 4 ? ', "Option D text"' : ''}],
  "correct": 0,
  "why": "Detailed explanation of why the correct answer is right and others are wrong, with specific reference to ${examProfile.name} concepts"
}`;
  }

  private buildMultipleResponsePrompt(examProfile: ExamProfile, objective: ExamObjective): string {
    const levelContext = this.getLevelSpecificContext(examProfile.id, objective);
    
    return `Generate 1 ${examProfile.name} multiple-response question for this learning objective:

Objective: ${objective.title}
Description: ${objective.description}
Difficulty Level: ${objective.level}
Weight in Exam: ${objective.weight}%

${levelContext}

Requirements:
- Create a question where 2-3 answers are correct
- Use 4-5 answer choices
- Clearly state "Choose TWO" or "Choose THREE" in the question
- Focus on comprehensive understanding typical for this certification level
- Ensure correct answers are clearly defensible
- Use appropriate terminology and concepts for this specific certification
- Make incorrect options plausible but clearly wrong to experts

Return JSON format:
{
  "text": "Question stem (Choose TWO)?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": [0, 2],
  "minSelect": 2,
  "why": "Explanation of why each correct answer is right and why incorrect options are wrong, with specific reference to ${examProfile.name} concepts"
}`;
  }

  private buildVignettePrompt(examProfile: ExamProfile, objective: ExamObjective): string {
    const levelContext = this.getLevelSpecificContext(examProfile.id, objective);
    const optionCount = examProfile.questionTypes.find(qt => qt.type === 'multiple_choice')?.constraints?.optionCount || 3;
    
    return `Generate 1 ${examProfile.name} vignette with 3 follow-up questions for this learning objective:

Objective: ${objective.title}
Description: ${objective.description}
Difficulty Level: ${objective.level}
Weight in Exam: ${objective.weight}%

${levelContext}

Requirements:
- Create a realistic business scenario (200-400 words) typical for this certification level
- Include relevant data, financial statements, calculations, or technical details appropriate for ${examProfile.name}
- Generate 3 multiple-choice questions that build on the scenario
- Questions should test analysis, application, and synthesis at the ${objective.level} level
- Each question should have ${optionCount} options
- Use industry-standard terminology and scenarios candidates will encounter
- Ensure vignette contains enough information to answer all questions

Return JSON format:
{
  "vignette": "Detailed scenario text with specific data and context relevant to ${examProfile.name}...",
  "questions": [
    {
      "text": "Question 1 testing scenario analysis?",
      "options": ["Option A", "Option B", "Option C"${optionCount === 4 ? ', "Option D"' : ''}],
      "correct": 0,
      "why": "Explanation with specific reference to ${examProfile.name} concepts and the vignette data"
    },
    {
      "text": "Question 2 testing application of concepts?", 
      "options": ["Option A", "Option B", "Option C"${optionCount === 4 ? ', "Option D"' : ''}],
      "correct": 1,
      "why": "Explanation with specific reference to ${examProfile.name} concepts and the vignette data"
    },
    {
      "text": "Question 3 testing synthesis and evaluation?",
      "options": ["Option A", "Option B", "Option C"${optionCount === 4 ? ', "Option D"' : ''}], 
      "correct": 2,
      "why": "Explanation with specific reference to ${examProfile.name} concepts and the vignette data"
    }
  ]
}`;
  }

  private buildEssayPrompt(examProfile: ExamProfile, objective: ExamObjective): string {
    const levelContext = this.getLevelSpecificContext(examProfile.id, objective);
    
    return `Generate 1 ${examProfile.name} constructed response (essay) question for this learning objective:

Objective: ${objective.title}
Description: ${objective.description}
Difficulty Level: ${objective.level}
Weight in Exam: ${objective.weight}%

${levelContext}

Requirements:
- Create a question requiring detailed analysis and written response typical for ${examProfile.name}
- Should take 15-20 minutes to answer properly (appropriate for certification level)
- Include specific requirements using terminology from this certification (e.g., "Calculate and justify", "Prepare IPS", "Design architecture")
- Provide a detailed rubric with point allocations reflecting ${examProfile.name} grading standards
- Include a sample high-quality answer demonstrating expected depth and format
- Focus on practical application and professional scenarios candidates will face

Return JSON format:
{
  "text": "Essay question prompt with specific instructions and context relevant to ${examProfile.name}...",
  "rubric": {
    "maxPoints": 20,
    "criteria": [
      {
        "item": "Technical accuracy",
        "points": 8,
        "description": "Correct application of ${examProfile.name} concepts, formulas, and methodologies"
      },
      {
        "item": "Professional reasoning",
        "points": 7,
        "description": "Demonstrates understanding of underlying principles and practical implications"
      },
      {
        "item": "Communication and structure",
        "points": 5,
        "description": "Clear, organized presentation using appropriate professional language and format"
      }
    ]
  },
  "sampleAnswer": "Example of a complete, high-scoring response demonstrating expected depth, terminology, and structure for ${examProfile.name}...",
  "why": "Explanation of key learning points this question tests and how it relates to real-world ${examProfile.name} applications"
}`;
  }

  private formatQuestion(parsed: any, type: string, examType: string, objective: ExamObjective): Question {
    const baseQuestion = {
      text: parsed.text,
      why: parsed.why,
      objective: objective.id,
      difficulty: objective.level,
      examType: examType
    };

    switch (type) {
      case 'multiple_choice':
        return {
          ...baseQuestion,
          type: 'multiple_choice',
          options: parsed.options,
          correct: parsed.correct
        } as MultipleChoiceQuestion;
      
      case 'multiple_response':
        return {
          ...baseQuestion,
          type: 'multiple_response', 
          options: parsed.options,
          correct: parsed.correct,
          minSelect: parsed.minSelect,
          maxSelect: parsed.maxSelect
        } as MultipleResponseQuestion;
      
      case 'vignette':
        return {
          ...baseQuestion,
          type: 'vignette',
          vignette: parsed.vignette,
          questions: parsed.questions.map((q: any) => ({
            type: 'multiple_choice',
            text: q.text,
            options: q.options,
            correct: q.correct,
            why: q.why,
            objective: objective.id,
            examType: examType
          }))
        } as VignetteQuestion;
      
      case 'essay':
        return {
          ...baseQuestion,
          type: 'essay',
          rubric: parsed.rubric,
          sampleAnswer: parsed.sampleAnswer
        } as EssayQuestion;
      
      default:
        throw new Error(`Unknown question type: ${type}`);
    }
  }

  private createFallbackQuestion(examProfile: ExamProfile, objective: ExamObjective, type: string): Question {
    const baseQuestion = {
      text: `What is a key concept related to ${objective.title}?`,
      why: `This is a fallback question about ${objective.title}. Please try generating again.`,
      objective: objective.id,
      examType: examProfile.id
    };

    switch (type) {
      case 'multiple_choice':
        return {
          ...baseQuestion,
          type: 'multiple_choice',
          options: ['Concept A', 'Concept B', 'Concept C'],
          correct: 0
        } as MultipleChoiceQuestion;
      
      default:
        return {
          ...baseQuestion,
          type: 'multiple_choice',
          options: ['Concept A', 'Concept B', 'Concept C'],
          correct: 0
        } as MultipleChoiceQuestion;
    }
  }

  private getLevelSpecificContext(examId: string, objective: ExamObjective): string {
    const contexts: Record<string, Record<string, string>> = {
      'cfa-l1': {
        'ethical-professional-standards': `
CFA Level I Ethics Focus:
- Code of Ethics and Standards of Professional Conduct (7 Standards)
- Global Investment Performance Standards (GIPS)
- Test format: Scenario-based questions with ethical dilemmas
- Common topics: Conflicts of interest, material nonpublic information, fair dealing
- Key formulas: No calculations, focus on principles and applications
- Example: "An analyst receives material nonpublic information. What should they do according to Standard II(A)?"`,

        'quantitative-methods': `
CFA Level I Quantitative Methods Focus:
- Time value of money calculations (PV, FV, annuities)
- Basic statistics and probability distributions
- Hypothesis testing fundamentals
- Test format: Calculation-heavy with financial calculator usage
- Key formulas: TVM equations, standard deviation, confidence intervals
- Example: "Calculate the present value of a 5-year annuity paying $1,000 annually at 8% interest"`,

        'financial-statement-analysis': `
CFA Level I FSA Focus:
- Basic financial statement relationships
- Cash flow statement analysis
- Financial ratios (liquidity, activity, leverage, profitability)
- Test format: Balance sheet/income statement interpretation
- Key formulas: ROE, ROA, current ratio, debt-to-equity
- Example: "If a company's ROE is 15% and equity multiplier is 2.5, what is the ROA?"`,

        'default': `
CFA Level I General Context:
- Foundation level knowledge testing
- Heavy emphasis on memorization and basic application
- 180 questions, 4.5 hours, 3 answer choices (A, B, C)
- Calculator permitted (HP 12C or TI BA II Plus)
- Focus on core investment knowledge and ethical behavior`
      },

      'cfa-l2': {
        'default': `
CFA Level II General Context:
- Item set format: vignettes followed by 4-6 questions each
- Advanced analysis and application of investment tools
- 88 questions total, 4.5 hours
- Focus on asset valuation and portfolio management tools
- Requires deeper analytical thinking and complex calculations`
      },

      'cfa-l3': {
        'default': `
CFA Level III General Context:
- Portfolio management and wealth planning focus
- Mix of item sets and constructed response (essay) questions
- Emphasis on synthesis and real-world application
- IPS (Investment Policy Statement) writing and analysis
- Behavioral finance and client relationship management`
      },

      'aws-cloud-practitioner': {
        'cloud-concepts': `
AWS Cloud Practitioner - Cloud Concepts Focus:
- Basic cloud computing principles and AWS value proposition
- On-demand delivery, broad network access, resource pooling
- Test format: Foundational multiple-choice questions
- Key concepts: Scalability, elasticity, agility, cost optimization
- Example: "Which AWS principle allows you to pay only for resources you consume?"`,

        'security-compliance': `
AWS Cloud Practitioner - Security Focus:
- Shared Responsibility Model fundamentals
- Basic AWS security services (IAM, VPC basics)
- Test format: Conceptual security questions
- Key concepts: AWS responsibilities vs customer responsibilities
- Example: "In the shared responsibility model, who is responsible for patching the guest OS?"`,

        'default': `
AWS Cloud Practitioner General Context:
- Entry-level certification for non-technical roles
- 65 questions, 90 minutes, 4 answer choices
- Focus on business value and basic cloud concepts
- No hands-on technical experience required
- Emphasis on AWS services overview and pricing models`
      },

      'aws-saa': {
        'design-resilient-architectures': `
AWS Solutions Architect - Resilient Architecture Focus:
- Multi-AZ deployments and disaster recovery strategies
- Auto Scaling, Elastic Load Balancing, CloudFront
- Test format: Scenario-based architecture questions
- Key services: EC2, S3, RDS, Route 53, CloudFormation
- Example: "How would you design a highly available web application across multiple AZs?"`,

        'design-secure-applications-architectures': `
AWS Solutions Architect - Security Focus:
- IAM policies, roles, and security groups
- VPC design with public/private subnets
- Test format: Security scenario analysis
- Key services: IAM, VPC, CloudTrail, Config, WAF
- Example: "How would you secure a web application with database backend in AWS?"`,

        'default': `
AWS Solutions Architect Associate Context:
- Intermediate-level hands-on cloud architecture
- 65 questions, 130 minutes, multiple choice and multiple response
- Focus on designing distributed systems on AWS
- Requires 1+ years of hands-on AWS experience
- Emphasis on cost optimization and performance`
      },

      'aws-developer': {
        'development-aws-services': `
AWS Developer - Development Focus:
- AWS SDKs, APIs, and CLI usage
- Lambda functions, API Gateway, DynamoDB
- Test format: Code-centric questions and debugging scenarios
- Key services: Lambda, API Gateway, DynamoDB, S3, SQS, SNS
- Example: "What's the correct way to handle DynamoDB throttling exceptions in your application?"`,

        'default': `
AWS Developer Associate Context:
- Development-focused certification
- Code examples and debugging scenarios
- Focus on building and deploying applications on AWS
- Serverless architectures and microservices patterns`
      }
    };

    const examContexts = contexts[examId] || {};
    return examContexts[objective.id] || examContexts['default'] || '';
  }

  async generateCertificationFlashcard(
    examProfile: ExamProfile,
    objective: ExamObjective
  ): Promise<{ title: string; content: string; skill: string; tags: string[]; }> {
    try {
      // Ensure OpenAI key is set before making request
      ensureOpenAIKey();
      
      const levelContext = this.getLevelSpecificContext(examProfile.id, objective);
      
      const prompt = `Generate 1 study flashcard for ${examProfile.name} covering this learning objective:

Objective: ${objective.title}
Description: ${objective.description}
Difficulty Level: ${objective.level}
Weight in Exam: ${objective.weight}%

${levelContext}

Requirements:
- Create a flashcard that helps memorize key concepts for this certification level
- Front side should be a question or key term appropriate for ${examProfile.name}
- Back side should provide clear, concise explanation with specific details
- Include relevant formulas, frameworks, or methodologies if applicable
- Use terminology and examples specific to this certification
- Focus on high-yield concepts likely to appear on the actual exam
- Add relevant tags for categorization

Return JSON format:
{
  "title": "Key concept or question for the front of flashcard",
  "content": "Detailed explanation for back of flashcard with specific ${examProfile.name} context, formulas, examples",
  "skill": "${objective.title}",
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const result = await run(this.agent, prompt);
      const content = this.extractTextFromResult(result);
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title,
          content: parsed.content,
          skill: parsed.skill || objective.title,
          tags: parsed.tags || [examProfile.name, objective.level]
        };
      }

      throw new Error('Could not parse flashcard from response');
    } catch (error) {
      console.error('Error generating certification flashcard:', error);
      return {
        title: `Key concept: ${objective.title}`,
        content: `Study the fundamentals of ${objective.title} for ${examProfile.name}. This objective represents ${objective.weight}% of the exam.`,
        skill: objective.title,
        tags: [examProfile.name, objective.level]
      };
    }
  }

  private extractTextFromResult(result: any): string {
    if (result.output?.text) {
      return result.output.text;
    }
    if (Array.isArray(result.output)) {
      return result.output.map((item: any) => item.text || '').join('');
    }
    return '';
  }
}

// Predefined Exam Profiles for major certifications
export const EXAM_PROFILES: Record<string, ExamProfile> = {
  'cfa-l1': {
    id: 'cfa-l1',
    name: 'CFA Level I',
    description: 'CFA Institute Level I Chartered Financial Analyst Exam',
    objectives: [
      {
        id: 'ethical-professional-standards',
        title: 'Ethical and Professional Standards',
        description: 'Ethics and Trust in the Investment Profession, Code of Ethics and Standards of Professional Conduct',
        weight: 15,
        level: 'knowledge'
      },
      {
        id: 'quantitative-methods',
        title: 'Quantitative Methods',
        description: 'Time Value of Money, Statistics, Probability Distributions, Hypothesis Testing',
        weight: 8,
        level: 'application'
      },
      {
        id: 'economics',
        title: 'Economics',
        description: 'Microeconomics, Macroeconomics, Currency Exchange Rates',
        weight: 8,
        level: 'knowledge'
      },
      {
        id: 'financial-statement-analysis',
        title: 'Financial Statement Analysis',
        description: 'Financial Statements, Cash Flow Analysis, Financial Ratios',
        weight: 13,
        level: 'application'
      },
      {
        id: 'corporate-issuers',
        title: 'Corporate Issuers', 
        description: 'Corporate Governance, Capital Investments, Working Capital Management',
        weight: 8,
        level: 'application'
      },
      {
        id: 'equity-investments',
        title: 'Equity Investments',
        description: 'Market Organization, Security Market Indices, Market Efficiency',
        weight: 10,
        level: 'application'
      },
      {
        id: 'fixed-income',
        title: 'Fixed Income',
        description: 'Bond Basics, Interest Rate Risk, Credit Analysis',
        weight: 10,
        level: 'application'
      },
      {
        id: 'derivatives',
        title: 'Derivatives',
        description: 'Derivative Instruments, Forward Contracts, Futures, Options, Swaps',
        weight: 5,
        level: 'knowledge'
      },
      {
        id: 'alternative-investments',
        title: 'Alternative Investments',
        description: 'Real Estate, Private Equity, Hedge Funds, Commodities',
        weight: 7,
        level: 'knowledge'
      },
      {
        id: 'portfolio-management-wealth-planning',
        title: 'Portfolio Management and Wealth Planning',
        description: 'Portfolio Risk and Return, Portfolio Planning, Behavioral Finance',
        weight: 16,
        level: 'synthesis'
      }
    ],
    questionTypes: [
      {
        type: 'multiple_choice',
        enabled: true,
        constraints: { optionCount: 3 }
      }
    ],
    constraints: {
      totalQuestions: 180,
      timeMinutes: 270, // 4.5 hours total (2 x 135 min sessions)
      sectionsCount: 2,
      passingScore: 70
    },
    scoring: {
      correctPoints: 1,
      incorrectPoints: 0,
      partialCredit: false,
      negativeMarking: false
    },
    timing: {
      totalMinutes: 270,
      sectioned: true,
      timePerQuestion: 1.5
    },
    uiConfig: {
      theme: 'cfa',
      primaryColor: '#003366',
      showProgressBar: true,
      showTimer: true
    }
  },

  'aws-cloud-practitioner': {
    id: 'aws-cloud-practitioner',
    name: 'AWS Cloud Practitioner',
    description: 'AWS Certified Cloud Practitioner (CLF-C02)',
    objectives: [
      {
        id: 'cloud-concepts',
        title: 'Cloud Concepts',
        description: 'Define the AWS Cloud and its value proposition, identify aspects of AWS Cloud economics',
        weight: 26,
        level: 'knowledge'
      },
      {
        id: 'security-compliance',
        title: 'Security and Compliance',
        description: 'Define the AWS shared responsibility model, define AWS Cloud security and compliance concepts',
        weight: 25,
        level: 'knowledge'
      },
      {
        id: 'technology',
        title: 'Technology',
        description: 'Define methods of deploying and operating in the AWS Cloud, define the AWS global infrastructure',
        weight: 33,
        level: 'application'
      },
      {
        id: 'billing-pricing',
        title: 'Billing and Pricing',
        description: 'Compare and contrast the various pricing models for AWS, recognize the various account structures',
        weight: 16,
        level: 'application'
      }
    ],
    questionTypes: [
      {
        type: 'multiple_choice',
        enabled: true,
        constraints: { optionCount: 4 }
      }
    ],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 90,
      sectionsCount: 1,
      passingScore: 700
    },
    scoring: {
      correctPoints: 1,
      incorrectPoints: 0,
      partialCredit: false,
      negativeMarking: false
    },
    timing: {
      totalMinutes: 90,
      sectioned: false,
      timePerQuestion: 1.4
    },
    uiConfig: {
      theme: 'aws',
      primaryColor: '#FF9900',
      showProgressBar: true,
      showTimer: true
    }
  },

  'aws-saa': {
    id: 'aws-saa',
    name: 'AWS Solutions Architect Associate',
    description: 'Amazon Web Services Certified Solutions Architect - Associate (SAA-C03)',
    objectives: [
      {
        id: 'design-resilient-architectures',
        title: 'Design Resilient Architectures',
        description: 'Multi-tier architectures, disaster recovery, high availability, storage solutions',
        weight: 26,
        level: 'application'
      },
      {
        id: 'design-high-performing-architectures',
        title: 'Design High-Performing Architectures',
        description: 'Scalable solutions, compute, networking, storage performance optimization',
        weight: 24,
        level: 'application'
      },
      {
        id: 'design-secure-applications-architectures',
        title: 'Design Secure Applications and Architectures', 
        description: 'Access controls, data security, network security, application security',
        weight: 30,
        level: 'synthesis'
      },
      {
        id: 'design-cost-optimized-architectures',
        title: 'Design Cost-Optimized Architectures',
        description: 'Cost-effective resources, cost optimization strategies, data transfer costs',
        weight: 20,
        level: 'synthesis'
      }
    ],
    questionTypes: [
      {
        type: 'multiple_choice',
        enabled: true,
        constraints: { optionCount: 4 }
      },
      {
        type: 'multiple_response',
        enabled: true,
        constraints: { optionCount: 5 }
      }
    ],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 130,
      sectionsCount: 1,
      passingScore: 720 // AWS uses scaled scoring 100-1000
    },
    scoring: {
      correctPoints: 1,
      incorrectPoints: 0,
      partialCredit: true, // For multiple-response
      negativeMarking: false
    },
    timing: {
      totalMinutes: 130,
      sectioned: false,
      timePerQuestion: 2
    },
    uiConfig: {
      theme: 'aws',
      primaryColor: '#FF9900',
      showProgressBar: true,
      showTimer: true
    }
  },

  'aws-developer': {
    id: 'aws-developer',
    name: 'AWS Developer Associate',
    description: 'AWS Certified Developer - Associate (DVA-C02)',
    objectives: [
      {
        id: 'development-aws-services',
        title: 'Development with AWS Services',
        description: 'Develop code for applications hosted on AWS, write code that interacts with AWS services by using APIs, SDKs, and AWS CLI',
        weight: 32,
        level: 'application'
      },
      {
        id: 'security',
        title: 'Security',
        description: 'Implement authentication and authorization for applications and AWS services, implement encryption using AWS services',
        weight: 26,
        level: 'application'
      },
      {
        id: 'deployment',
        title: 'Deployment',
        description: 'Prepare application artifacts to be deployed to AWS, test applications in development environments',
        weight: 24,
        level: 'application'
      },
      {
        id: 'troubleshooting-optimization',
        title: 'Troubleshooting and Optimization',
        description: 'Troubleshoot issues with deployed applications, optimize applications by using AWS services and features',
        weight: 18,
        level: 'synthesis'
      }
    ],
    questionTypes: [
      {
        type: 'multiple_choice',
        enabled: true,
        constraints: { optionCount: 4 }
      },
      {
        type: 'multiple_response',
        enabled: true,
        constraints: { optionCount: 5 }
      }
    ],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 130,
      sectionsCount: 1,
      passingScore: 720
    },
    scoring: {
      correctPoints: 1,
      incorrectPoints: 0,
      partialCredit: true,
      negativeMarking: false
    },
    timing: {
      totalMinutes: 130,
      sectioned: false,
      timePerQuestion: 2
    },
    uiConfig: {
      theme: 'aws',
      primaryColor: '#FF9900',
      showProgressBar: true,
      showTimer: true
    }
  },

  'aws-sysops': {
    id: 'aws-sysops',
    name: 'AWS SysOps Administrator',
    description: 'AWS Certified SysOps Administrator - Associate (SOA-C02)',
    objectives: [
      {
        id: 'monitoring-logging-remediation',
        title: 'Monitoring, Logging, and Remediation',
        description: 'Implement metrics, alarms, and filters by using AWS monitoring and logging services',
        weight: 20,
        level: 'application'
      },
      {
        id: 'reliability-business-continuity',
        title: 'Reliability and Business Continuity',
        description: 'Implement scalability and elasticity, implement high availability and resilience',
        weight: 16,
        level: 'application'
      },
      {
        id: 'deployment-provisioning-automation',
        title: 'Deployment, Provisioning, and Automation',
        description: 'Provision and maintain cloud resources, automate manual or repeatable processes',
        weight: 18,
        level: 'application'
      },
      {
        id: 'security-compliance',
        title: 'Security and Compliance',
        description: 'Implement and manage security and compliance policies, implement data and infrastructure protection strategies',
        weight: 16,
        level: 'application'
      },
      {
        id: 'networking-content-delivery',
        title: 'Networking and Content Delivery',
        description: 'Implement networking features and connectivity, configure domains, DNS services, and content delivery',
        weight: 18,
        level: 'application'
      },
      {
        id: 'cost-performance-optimization',
        title: 'Cost and Performance Optimization',
        description: 'Implement cost optimization strategies, implement performance optimization strategies',
        weight: 12,
        level: 'synthesis'
      }
    ],
    questionTypes: [
      {
        type: 'multiple_choice',
        enabled: true,
        constraints: { optionCount: 4 }
      },
      {
        type: 'multiple_response',
        enabled: true,
        constraints: { optionCount: 5 }
      }
    ],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 130,
      sectionsCount: 1,
      passingScore: 720
    },
    scoring: {
      correctPoints: 1,
      incorrectPoints: 0,
      partialCredit: true,
      negativeMarking: false
    },
    timing: {
      totalMinutes: 130,
      sectioned: false,
      timePerQuestion: 2
    },
    uiConfig: {
      theme: 'aws',
      primaryColor: '#FF9900',
      showProgressBar: true,
      showTimer: true
    }
  }
};

// Factory functions
export const createEnhancedQuizAgent = () => new EnhancedQuizAgent();
export const createJobAnalysisAgent = () => new JobAnalysisAgent();
export const createQuestionGenerationAgent = () => new QuestionGenerationAgent();
export const createCertificationQuestionAgent = () => new CertificationQuestionAgent();