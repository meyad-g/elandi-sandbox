import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for tutor copilot (keeping same interfaces)
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

// Initialize Gemini AI
function createGeminiInstance() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not found. Make sure it is set in your .env.local file.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });
}

// Helper function to clean and parse JSON
function parseCleanJson(text: string): any {
  try {
    // First try to parse as-is
    return JSON.parse(text);
  } catch (error) {
    try {
      // Try to extract JSON from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        let jsonText = codeBlockMatch[1].trim();
        
        // Fix LaTeX math expressions that break JSON
        jsonText = jsonText
          .replace(/\\int/g, '\\\\int')  // Fix \int
          .replace(/\\frac/g, '\\\\frac')  // Fix \frac
          .replace(/\\sin/g, '\\\\sin')  // Fix \sin
          .replace(/\\cos/g, '\\\\cos')  // Fix \cos
          .replace(/\\tan/g, '\\\\tan')  // Fix \tan
          .replace(/\\log/g, '\\\\log')  // Fix \log
          .replace(/\\ln/g, '\\\\ln')    // Fix \ln
          .replace(/\\sqrt/g, '\\\\sqrt') // Fix \sqrt
          .replace(/\\sum/g, '\\\\sum')  // Fix \sum
          .replace(/\\prod/g, '\\\\prod') // Fix \prod
          .replace(/\\lim/g, '\\\\lim')  // Fix \lim
          .replace(/\\partial/g, '\\\\partial') // Fix \partial
          .replace(/\\infty/g, '\\\\infty') // Fix \infty
          .replace(/\\alpha/g, '\\\\alpha') // Fix \alpha
          .replace(/\\beta/g, '\\\\beta')  // Fix \beta
          .replace(/\\gamma/g, '\\\\gamma') // Fix \gamma
          .replace(/\\delta/g, '\\\\delta') // Fix \delta
          .replace(/\\theta/g, '\\\\theta') // Fix \theta
          .replace(/\\lambda/g, '\\\\lambda') // Fix \lambda
          .replace(/\\mu/g, '\\\\mu')    // Fix \mu
          .replace(/\\pi/g, '\\\\pi')    // Fix \pi
          .replace(/\\sigma/g, '\\\\sigma') // Fix \sigma
          .replace(/\\phi/g, '\\\\phi')  // Fix \phi
          .replace(/\\omega/g, '\\\\omega') // Fix \omega
          .replace(/\\(\\[^\\]+\\)/g, (match) => {
            // Handle general LaTeX commands
            return match.replace(/\\/g, '\\\\');
          });
        
        return JSON.parse(jsonText);
      }
      
      // Try to find JSON object in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonText = jsonMatch[0];
        
        // Clean up common issues and fix LaTeX
        jsonText = jsonText
          .replace(/\\int/g, '\\\\int')  // Fix \int
          .replace(/\\frac/g, '\\\\frac')  // Fix \frac
          .replace(/\\([a-zA-Z]+)/g, '\\\\$1')  // Fix other LaTeX commands
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
          .replace(/\n\s*\n/g, '\n')  // Remove extra newlines
          .trim();
        
        return JSON.parse(jsonText);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (secondError) {
      console.error('JSON parsing failed:', secondError);
      console.error('Original text:', text);
      throw secondError;
    }
  }
}

// Tutor Copilot Agent using Gemini
export class GeminiTutorCopilotAgent {
  private model: any;

  constructor() {
    this.model = createGeminiInstance();
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

Personalize the content for ${request.studentName || 'the student'} based on their learning needs.

Please respond with ONLY a valid JSON object in this exact format:

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

Ensure the response is valid JSON with no additional text, explanations, or markdown formatting.`;

      // Generate content
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = parseCleanJson(text);
        yield { type: 'result', content: parsed };
      } catch (parseError) {
        console.error('Error parsing lesson plan JSON:', parseError);
        console.error('Raw response:', text);
        
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
      }
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

Tailor the difficulty and style for ${request.studentName || 'the student'} based on their learning profile.

Please respond with ONLY a valid JSON object in this exact format:

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

Ensure the response is valid JSON with no additional text, explanations, or markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = parseCleanJson(text);
        yield { type: 'result', content: parsed };
      } catch (parseError) {
        console.error('Error parsing questions JSON:', parseError);
        console.error('Raw response:', text);
        
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
      }
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

Select resources appropriate for ${request.studentName || 'the student'}'s learning level and style.

Please respond with ONLY a valid JSON object in this exact format:

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

Ensure the response is valid JSON with no additional text, explanations, or markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = parseCleanJson(text);
        yield { type: 'result', content: parsed };
      } catch (parseError) {
        console.error('Error parsing resources JSON:', parseError);
        console.error('Raw response:', text);
        
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
      }
    } catch (error) {
      console.error('Error finding resources:', error);
      throw error;
    }
  }

  async *createInterviewDrill(request: PrepRequest): AsyncGenerator<{type: 'thinking' | 'result', content: string | InterviewDrill}, void, unknown> {
    try {
      const prompt = `Create Oxbridge-style interview questions for: ${request.description}

Context:
- Student: ${request.studentName || 'Student'}
- Topic: ${request.topic || 'Extracted from description'}
- Level: ${request.level || 'Standard'}
- Subject Focus: Based on the description

Create challenging interview questions suitable for ${request.studentName || 'the student'}'s academic level.

Please respond with ONLY a valid JSON object in this exact format:

{
  "mainPrompt": "Main interview question",
  "followUps": ["Follow-up question 1", "Follow-up question 2"],
  "strongAnswerCriteria": ["Criteria 1", "Criteria 2"],
  "hints": ["Hint 1", "Hint 2"],
  "explainer": "Explanation of what the question tests",
  "variants": ["Variant 1", "Variant 2"]
}

Ensure the response is valid JSON with no additional text, explanations, or markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = parseCleanJson(text);
        yield { type: 'result', content: parsed };
      } catch (parseError) {
        console.error('Error parsing interview drill JSON:', parseError);
        console.error('Raw response:', text);
        
        // Fallback result
        yield {
          type: 'result',
          content: {
            mainPrompt: `Discuss the significance of ${request.topic || 'this topic'} in your field.`,
            followUps: ['Can you elaborate on that point?', 'How would you apply this in practice?'],
            strongAnswerCriteria: ['Clear explanation', 'Real-world application', 'Critical thinking'],
            hints: ['Think about practical implications', 'Consider different perspectives'],
            explainer: 'This question tests analytical thinking and subject knowledge',
            variants: ['Alternative phrasing 1', 'Alternative phrasing 2']
          }
        };
      }
    } catch (error) {
      console.error('Error creating interview drill:', error);
      throw error;
    }
  }

  async *generateWeeklyNote(request: PrepRequest): AsyncGenerator<{type: 'thinking' | 'result', content: string | WeeklyNoteDraft}, void, unknown> {
    try {
      const prompt = `Generate a weekly progress note for: ${request.description}

Context:
- Student: ${request.studentName || 'Student'}
- Topic: ${request.topic || 'Extracted from description'}
- Level: ${request.level || 'Standard'}
- Exam Board: ${request.examBoard || 'Not specified'}

Create a concise parent communication note for ${request.studentName || 'the student'}'s progress this week.

Please respond with ONLY a valid JSON object in this exact format:

{
  "whatWeDid": "Brief summary of this week's session content",
  "whatsNext": "What we'll focus on in upcoming sessions",
  "actionFromHome": "Specific actions parents/student can take at home"
}

Ensure the response is valid JSON with no additional text, explanations, or markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = parseCleanJson(text);
        yield { type: 'result', content: parsed };
      } catch (parseError) {
        console.error('Error parsing weekly note JSON:', parseError);
        console.error('Raw response:', text);
        
        // Fallback result
        yield {
          type: 'result',
          content: {
            whatWeDid: `This week we focused on ${request.topic || 'key concepts'} with ${request.studentName || 'the student'}.`,
            whatsNext: 'Continue building on these foundations with practice exercises.',
            actionFromHome: 'Review notes and complete assigned practice questions.'
          }
        };
      }
    } catch (error) {
      console.error('Error generating weekly note:', error);
      throw error;
    }
  }
}

// Factory function
export const createGeminiTutorCopilotAgent = () => new GeminiTutorCopilotAgent();
