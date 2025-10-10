import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getExamProfile } from '@/lib/certifications';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface FlashcardFromQuestionRequest {
  questionText: string;
  questionOptions?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  userAnswer?: string | number | boolean;
  wasCorrect: boolean;
  objectiveId: string;
  examId: string;
  stream?: boolean;
}


export async function POST(request: NextRequest) {
  try {
    const { 
      questionText, 
      questionOptions, 
      correctAnswer,
      explanation,
      userAnswer,
      wasCorrect,
      objectiveId, 
      examId,
      stream = true 
    }: FlashcardFromQuestionRequest = await request.json();

    if (!questionText || !objectiveId || !examId) {
      return NextResponse.json(
        { error: 'Question text, objective ID, and exam ID are required' },
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

    // Build context for flashcard generation
    const contextualInfo = {
      examName: examProfile.name,
      objectiveTitle: objective.title,
      objectiveDescription: objective.description,
      keyTopics: objective.keyTopics || [],
      wasAnsweredCorrectly: wasCorrect,
      userStruggle: !wasCorrect ? 'Focus on understanding why the user got this wrong' : 'Reinforce the concept for retention'
    };

    const prompt = buildFlashcardPrompt({
      questionText,
      questionOptions,
      correctAnswer,
      explanation,
      userAnswer,
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
              const flashcardData = JSON.parse(accumulatedText.trim());
              const finalData = JSON.stringify({
                type: 'complete',
                content: {
                  ...flashcardData,
                  id: `flashcard-${Date.now()}`,
                  objectiveId,
                  sourceQuestionId: `question-${Date.now()}`
                }
              }) + '\n';
              controller.enqueue(encoder.encode(finalData));
            } catch (parseError) {
              const errorData = JSON.stringify({
                type: 'error',
                content: 'Failed to parse flashcard data'
              }) + '\n';
              controller.enqueue(encoder.encode(errorData));
            }
            
            controller.close();
          } catch (error) {
            console.error('Flashcard generation error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Failed to generate flashcard'
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
        const flashcardData = JSON.parse(responseText.trim());
        return NextResponse.json({
          ...flashcardData,
          id: `flashcard-${Date.now()}`,
          objectiveId,
          sourceQuestionId: `question-${Date.now()}`
        });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to parse flashcard data' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate flashcard' },
      { status: 500 }
    );
  }
}

function buildFlashcardPrompt({
  questionText,
  questionOptions,
  correctAnswer,
  explanation,
  userAnswer,
  context,
  examProfile
}: {
  questionText: string;
  questionOptions?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  userAnswer?: string | number | boolean;
  context: {
    examName: string;
    objectiveTitle: string;
    objectiveDescription: string;
    keyTopics: string[];
    wasAnsweredCorrectly: boolean;
    userStruggle: string;
  };
  examProfile: {
    name: string;
  };
}): string {
  const optionsText = questionOptions ? `
Options:
${questionOptions.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

Correct Answer: ${correctAnswer}` : '';

  const performanceContext = context.wasAnsweredCorrectly 
    ? "The user answered this question CORRECTLY. Create a flashcard that reinforces and expands on the key concept to solidify their understanding."
    : "The user answered this question INCORRECTLY. Create a flashcard that addresses their knowledge gap and helps them understand the concept better.";

  return `You are an expert ${examProfile.name} exam preparation tutor. Generate a flashcard based on this question to help the student learn and retain the key concepts.

QUESTION CONTEXT:
${questionText}
${optionsText}

${explanation ? `EXPLANATION: ${explanation}` : ''}

STUDENT PERFORMANCE:
${performanceContext}
${userAnswer !== undefined ? `User's answer: ${userAnswer}` : ''}

EXAM CONTEXT:
- Exam: ${context.examName}
- Objective: ${context.objectiveTitle}
- Focus Area: ${context.objectiveDescription}
- Key Topics: ${context.keyTopics.join(', ')}

FLASHCARD REQUIREMENTS:
1. Create a concise, memorable flashcard that captures the essential concept from this question
2. The title should be a clear, specific concept name (not a question)
3. The content should be educational, explaining the concept clearly with key details
4. Include practical application or exam tips when relevant
5. Make it specific to ${examProfile.name} exam context and terminology
6. Difficulty should match the complexity of the concept
7. Tags should include relevant ${examProfile.name} topics and categories

${context.userStruggle}

Return ONLY a JSON object in this exact format:
{
  "title": "Clear Concept Title",
  "content": "Detailed explanation of the concept with key points, formulas, relationships, and practical applications for the ${examProfile.name} exam. Include specific details that help distinguish this concept from similar ones.",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2", "tag3"]
}`;
}
