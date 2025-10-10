import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getExamProfile } from '@/lib/certifications';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface QuestionFromFlashcardRequest {
  flashcardTitle: string;
  flashcardContent: string;
  objectiveId: string;
  examId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  stream?: boolean;
}


export async function POST(request: NextRequest) {
  try {
    const { 
      flashcardTitle,
      flashcardContent, 
      objectiveId, 
      examId,
      difficulty = 'medium',
      questionCount = 1,
      stream = true 
    }: QuestionFromFlashcardRequest = await request.json();

    if (!flashcardTitle || !flashcardContent || !objectiveId || !examId) {
      return NextResponse.json(
        { error: 'Flashcard title, content, objective ID, and exam ID are required' },
        { status: 400 }
      );
    }

    // Get exam profile for context
    const examProfile = getExamProfile(examId);
    if (!examProfile) {
      return NextResponse.json(
        { error: 'Invalid exam ID' },
        { status: 400 }
      );
    }

    const objective = examProfile.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      return NextResponse.json(
        { error: 'Invalid objective ID' },
        { status: 400 }
      );
    }

    // Build context for question generation
    const contextualInfo = {
      examName: examProfile.name,
      examFormat: examProfile.context.examFormat,
      objectiveTitle: objective.title,
      objectiveDescription: objective.description,
      keyTopics: objective.keyTopics || [],
      learningOutcomes: objective.learningOutcomes || [],
      optionCount: examProfile.constraints.optionCount,
      terminology: examProfile.context.terminology || []
    };

    const prompt = buildQuestionPrompt({
      flashcardTitle,
      flashcardContent,
      difficulty,
      questionCount,
      context: contextualInfo,
      examProfile
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    if (stream) {
      const encoder = new TextEncoder();
      
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const result = await model.generateContentStream([prompt]);
            let accumulatedText = '';
            
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              accumulatedText += chunkText;
              
              // Send the chunk
              const data = JSON.stringify({
                type: 'chunk',
                content: chunkText,
                accumulated: accumulatedText
              }) + '\n';
              controller.enqueue(encoder.encode(data));
            }
            
            // Try to parse the final accumulated text as JSON
            try {
              // Strip markdown code block formatting if present
              let jsonText = accumulatedText.trim();
              if (jsonText.startsWith('```json') && jsonText.endsWith('```')) {
                jsonText = jsonText.slice(7, -3).trim(); // Remove ```json from start and ``` from end
              } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
                jsonText = jsonText.slice(3, -3).trim(); // Remove ``` from both ends
              }
              
              const questionData = JSON.parse(jsonText);
              
              // Ensure it's an array and add metadata
              const questions = Array.isArray(questionData) ? questionData : [questionData];
              const processedQuestions = questions.map((q, index) => ({
                ...q,
                id: `question-${Date.now()}-${index}`,
                objectiveId,
                sourceFlashcardId: `flashcard-${Date.now()}`,
                type: 'multiple_choice' as const,
                difficulty
              }));
              
              const finalData = JSON.stringify({
                type: 'complete',
                content: questionCount === 1 ? processedQuestions[0] : processedQuestions
              }) + '\n';
              controller.enqueue(encoder.encode(finalData));
            } catch (parseError) {
              const errorData = JSON.stringify({
                type: 'error',
                content: 'Failed to parse question data'
              }) + '\n';
              controller.enqueue(encoder.encode(errorData));
            }
            
            controller.close();
          } catch (error) {
            console.error('Question generation error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Failed to generate question'
            }) + '\n';
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const result = await model.generateContent([prompt]);
      const responseText = result.response.text();
      
      try {
        // Strip markdown code block formatting if present
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json') && jsonText.endsWith('```')) {
          jsonText = jsonText.slice(7, -3).trim(); // Remove ```json from start and ``` from end
        } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
          jsonText = jsonText.slice(3, -3).trim(); // Remove ``` from both ends
        }
        
        const questionData = JSON.parse(jsonText);
        const questions = Array.isArray(questionData) ? questionData : [questionData];
        const processedQuestions = questions.map((q, index) => ({
          ...q,
          id: `question-${Date.now()}-${index}`,
          objectiveId,
          sourceFlashcardId: `flashcard-${Date.now()}`,
          type: 'multiple_choice' as const,
          difficulty
        }));
        
        return NextResponse.json(questionCount === 1 ? processedQuestions[0] : processedQuestions);
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to parse question data' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate question' },
      { status: 500 }
    );
  }
}

function buildQuestionPrompt({
  flashcardTitle,
  flashcardContent,
  difficulty,
  questionCount,
  context,
  examProfile
}: {
  flashcardTitle: string;
  flashcardContent: string;
  difficulty: string;
  questionCount: number;
  context: {
    examName: string;
    examFormat: string;
    objectiveTitle: string;
    objectiveDescription: string;
    keyTopics: string[];
    learningOutcomes: string[];
    optionCount: number;
    terminology: string[];
  };
  examProfile: {
    name: string;
  };
}): string {
  const optionLabels = Array.from({length: context.optionCount}, (_, i) => String.fromCharCode(65 + i));
  
  return `You are an expert ${examProfile.name} exam question writer. Generate ${questionCount} multiple-choice question${questionCount > 1 ? 's' : ''} based on this flashcard concept.

FLASHCARD CONCEPT:
Title: ${flashcardTitle}
Content: ${flashcardContent}

EXAM CONTEXT:
- Exam: ${context.examName} (${context.examFormat})
- Objective: ${context.objectiveTitle}
- Focus Area: ${context.objectiveDescription}
- Key Topics: ${context.keyTopics.join(', ')}
- Difficulty Level: ${difficulty}

QUESTION REQUIREMENTS:
1. Create ${difficulty} level questions that test understanding of the flashcard concept
2. Use exactly ${context.optionCount} options (${optionLabels.join(', ')}) 
3. Follow ${examProfile.name} exam format and style
4. Include realistic distractors that test common misconceptions
5. Ensure the correct answer is clearly the best choice
6. Write detailed explanations that reference the flashcard concept
7. Use appropriate ${examProfile.name} terminology: ${context.terminology.join(', ')}
8. Questions should test application, not just memorization

LEARNING OUTCOMES TO TEST:
${context.learningOutcomes.map(outcome => `- ${outcome}`).join('\n')}

${questionCount === 1 ? `
Return ONLY a JSON object in this exact format:
{
  "question": "Clear, specific question that tests the flashcard concept",
  "options": ["Option A text", "Option B text", "Option C text"${context.optionCount > 3 ? ', "Option D text"' : ''}],
  "correct": 0,
  "explanation": "Detailed explanation connecting back to the flashcard concept, explaining why the correct answer is right and why distractors are wrong. Reference specific details from the flashcard content."
}` : `
Return ONLY a JSON array of ${questionCount} question objects in this exact format:
[
  {
    "question": "Clear, specific question that tests the flashcard concept",
    "options": ["Option A text", "Option B text", "Option C text"${context.optionCount > 3 ? ', "Option D text"' : ''}],
    "correct": 0,
    "explanation": "Detailed explanation connecting back to the flashcard concept"
  }
]`}

Make each question distinct and test different aspects of the flashcard concept.`;
}