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
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).window === 'undefined') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      setDefaultOpenAIKey(apiKey);
    } else {
      console.warn('OPENAI_API_KEY environment variable not found. Make sure it is set in your .env.local file.');
    }
  }
}

// Types for tutor copilot
export interface LessonPlan {
  objectives: string[];
  structure: {
    doNow: string;
    teach: string;
    check: string;
    practice: string;
    stretch: string;
  };
  workedExample: string;
  commonPitfalls: string[];
  checkForUnderstanding: string[];
  homework: string[];
  citations: string[];
}

export interface QuestionSet {
  questions: Question[];
  gradeBand: string;
  calculatorAllowed: boolean;
  totalMarks: number;
  examBoard: string;
}

export interface Question {
  question: string;
  marks: number;
  modelAnswer: string;
  markScheme: string[];
  commonMistakes: string[];
}

export interface ResourceFinder {
  authoritative: Array<{
    title: string;
    url: string;
    reason: string;
  }>;
  videos: Array<{
    title: string;
    url: string;
    timestamp?: string;
  }>;
  printables: {
    worksheet: string;
    answers: string;
  };
}

export interface InterviewDrill {
  mainPrompt: string;
  followUps: string[];
  strongAnswerCriteria: string[];
  hints: string[];
  explainer: string;
  variants: string[];
}

export interface WeeklyNoteDraft {
  whatWeDid: string;
  whatsNext: string;
  actionFromHome: string;
}

export interface PrepRequest {
  scenario: 'lesson' | 'questions' | 'resources' | 'interview' | 'notes';
  description: string;
  studentName?: string;
  examBoard?: string;
  topic?: string;
  level?: string;
  timeBox?: number;
  calculatorAllowed?: boolean;
  outputFormat?: string[];
}

export interface PrepResult {
  type: PrepRequest['scenario'];
  content: LessonPlan | QuestionSet | ResourceFinder | InterviewDrill | WeeklyNoteDraft;
  metadata: {
    examBoard?: string;
    topic?: string;
    level?: string;
    timeGenerated: string;
    citations: string[];
  };
}

// Tutor Copilot Agent - handles all teaching preparation tasks
export class TutorCopilotAgent {
  private agent: Agent;

  constructor() {
    ensureOpenAIKey();
    this.agent = new Agent({
      name: 'Tutor Copilot Agent',
      instructions: `You are an expert tutor preparation assistant. Your role is to help tutors create high-quality, board-specific educational content quickly and accurately.

Your capabilities:
1. **Lesson Planning**: Create structured 60-minute lesson plans with clear objectives, timing, and activities
2. **Question Generation**: Generate exam-style questions with mark schemes and model answers
3. **Resource Finding**: Search for authoritative educational resources, videos, and materials
4. **Interview Preparation**: Create Oxbridge-style interview drills with follow-up questions
5. **Communication**: Draft parent/student communication notes

Key principles:
- Always specify exam board when relevant (AQA, Edexcel, OCR, IB, CIE, ISEB)
- Use official mark scheme language ("state", "explain", "derive", "calculate")
- Prefer authoritative sources (exam boards, textbooks, university materials)
- Include common misconceptions and pitfalls
- Structure content for different ability levels
- Always cite sources when using web search

Exam Board Priorities:
- AQA: Focus on command words and grade boundaries
- Edexcel: Emphasize real-world applications
- OCR: Include synoptic links between topics
- IB: Stress international perspectives and TOK connections
- Cambridge/Oxford: Prepare for interview-style questioning`,
      tools: [webSearchTool()],
    });
  }

  async *prepareLessonPlan(request: PrepRequest): AsyncGenerator<{type: 'thinking' | 'result', content: string | LessonPlan}, void, unknown> {
    try {
      const prompt = `Create a ${request.timeBox || 60}-minute lesson plan for: ${request.description}

Context:
- Student: ${request.studentName || 'Student'}
- Exam Board: ${request.examBoard || 'Not specified'}
- Topic: ${request.topic || 'Extracted from description'}
- Level: ${request.level || 'Standard'}
- Time: ${request.timeBox || 60} minutes

Personalize the lesson plan for ${request.studentName || 'the student'} based on their specific learning needs and academic level.

Please provide your response directly in the following JSON format without any thinking text or explanations:

Output format:

===JSON_START===
{
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "structure": {
    "doNow": "5-minute starter activity",
    "teach": "15-minute main teaching content",
    "check": "10-minute understanding check",
    "practice": "20-minute guided practice",
    "stretch": "10-minute extension work"
  },
  "workedExample": "Step-by-step example with clear notation",
  "commonPitfalls": ["Common mistake 1", "Common mistake 2"],
  "checkForUnderstanding": ["Question 1", "Question 2", "Question 3"],
  "homework": ["Task 1", "Task 2", "Task 3"],
  "citations": ["Source 1", "Source 2", "Source 3"]
}
===JSON_END===`;

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

            if (fullContent.includes('===JSON_START===')) {
              hasStartedJson = true;
            }

            if (!hasStartedJson) {
              yield { type: 'thinking', content: delta };
            }
          }
        }
      }

      // Extract and parse the final JSON
      const jsonMatch = fullContent.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          yield { type: 'result', content: parsed };
          return;
        } catch (parseError) {
          console.error('Error parsing lesson plan JSON:', parseError);
        }
      }

      // Fallback result
      yield {
        type: 'result',
        content: {
          objectives: ['Learn key concepts', 'Practice applications', 'Prepare for assessment'],
          structure: {
            doNow: 'Recall previous learning (5 min)',
            teach: 'Introduce new concept (15 min)',
            check: 'Check understanding (10 min)',
            practice: 'Guided practice (20 min)',
            stretch: 'Extension problems (10 min)'
          },
          workedExample: 'Step-by-step demonstration will be provided',
          commonPitfalls: ['Misunderstanding key terminology', 'Calculation errors'],
          checkForUnderstanding: ['Can you explain...?', 'What would happen if...?', 'How is this similar to...?'],
          homework: ['Complete practice questions', 'Review notes', 'Prepare for next lesson'],
          citations: ['Exam board specification', 'Recommended textbook']
        }
      };
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      throw error;
    }
  }

  async *generateQuestions(request: PrepRequest): AsyncGenerator<{type: 'thinking' | 'result', content: string | QuestionSet}, void, unknown> {
    try {
      const prompt = `Generate 10 exam-style questions for: ${request.description}

Context:
- Student: ${request.studentName || 'Student'}
- Exam Board: ${request.examBoard || 'Not specified'}
- Topic: ${request.topic || 'Extracted from description'}
- Level: ${request.level || 'Standard'}
- Calculator: ${request.calculatorAllowed ? 'Allowed' : 'Not allowed'}

Tailor the questions for ${request.studentName || 'the student'} considering their academic level and learning profile.

Please provide your response directly in the following JSON format without any thinking text or explanations:

Output format:

===JSON_START===
{
  "questions": [
    {
      "question": "Question text with appropriate marks [3]",
      "marks": 3,
      "modelAnswer": "Complete model answer",
      "markScheme": ["Point 1 (1 mark)", "Point 2 (1 mark)", "Point 3 (1 mark)"],
      "commonMistakes": ["Mistake 1", "Mistake 2"]
    }
  ],
  "gradeBand": "Grade 7-9",
  "calculatorAllowed": ${request.calculatorAllowed || false},
  "totalMarks": 45,
  "examBoard": "${request.examBoard || 'General'}"
}
===JSON_END===`;

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

            if (fullContent.includes('===JSON_START===')) {
              hasStartedJson = true;
            }

            if (!hasStartedJson) {
              yield { type: 'thinking', content: delta };
            }
          }
        }
      }

      // Parse the final result
      const jsonMatch = fullContent.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          yield { type: 'result', content: parsed };
          return;
        } catch (parseError) {
          console.error('Error parsing questions JSON:', parseError);
        }
      }

      // Fallback result
      yield {
        type: 'result',
        content: {
          questions: [
            {
              question: `Example question about ${request.topic || 'the topic'} [3]`,
              marks: 3,
              modelAnswer: 'Model answer will be generated',
              markScheme: ['Point 1 (1 mark)', 'Point 2 (1 mark)', 'Point 3 (1 mark)'],
              commonMistakes: ['Common mistake 1', 'Common mistake 2']
            }
          ],
          gradeBand: 'Standard',
          calculatorAllowed: request.calculatorAllowed || false,
          totalMarks: 30,
          examBoard: request.examBoard || 'General'
        }
      };
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  async *findResources(request: PrepRequest): AsyncGenerator<{type: 'thinking' | 'result', content: string | ResourceFinder}, void, unknown> {
    try {
      const prompt = `Find the best educational resources for: ${request.description}

Context:
- Student: ${request.studentName || 'Student'}
- Exam Board: ${request.examBoard || 'Not specified'}
- Topic: ${request.topic || 'Extracted from description'}
- Level: ${request.level || 'Standard'}

Select and recommend resources specifically suited for ${request.studentName || 'the student'}'s learning needs and academic level.

Please provide your response directly in the following JSON format without any thinking text or explanations:

Output format:

===JSON_START===
{
  "authoritative": [
    {
      "title": "Resource title",
      "url": "https://example.com",
      "reason": "Why this is useful"
    }
  ],
  "videos": [
    {
      "title": "Video title",
      "url": "https://youtube.com/watch?v=xxx",
      "timestamp": "2:30-5:45"
    }
  ],
  "printables": {
    "worksheet": "Description of worksheet content",
    "answers": "Description of answer sheet"
  }
}
===JSON_END===`;

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

            if (fullContent.includes('===JSON_START===')) {
              hasStartedJson = true;
            }

            if (!hasStartedJson) {
              yield { type: 'thinking', content: delta };
            }
          }
        }
      }

      // Parse the final result
      const jsonMatch = fullContent.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          yield { type: 'result', content: parsed };
          return;
        } catch (parseError) {
          console.error('Error parsing resources JSON:', parseError);
        }
      }

      // Fallback result
      yield {
        type: 'result',
        content: {
          authoritative: [
            {
              title: `${request.examBoard || 'Official'} specification`,
              url: '#',
              reason: 'Primary source for curriculum requirements'
            }
          ],
          videos: [
            {
              title: `Introduction to ${request.topic || 'the topic'}`,
              url: '#',
              timestamp: '0:00-10:00'
            }
          ],
          printables: {
            worksheet: `Practice questions on ${request.topic || 'the topic'}`,
            answers: 'Detailed solutions with mark schemes'
          }
        }
      };
    } catch (error) {
      console.error('Error finding resources:', error);
      throw error;
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

// Factory functions
export const createTutorCopilotAgent = () => new TutorCopilotAgent();
