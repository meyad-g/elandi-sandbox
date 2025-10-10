import { NextRequest, NextResponse } from 'next/server';
import { generateStreamingQuestion } from '@/lib/gemini';
import { getExamProfile, getExamObjective } from '@/lib/certifications';
import { getQuestionPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { 
      examId, 
      objectiveId, 
      questionType = 'multiple_choice',
      examMode = 'prep',
      difficulty,
      previousQuestions = []
    } = await request.json();

    console.log('🎯 V2 API: Generating question:', { examId, objectiveId, questionType, examMode });

    // Validate inputs
    const examProfile = getExamProfile(examId);
    if (!examProfile) {
      return NextResponse.json(
        { error: `Exam profile '${examId}' not found` },
        { status: 400 }
      );
    }

    const objective = getExamObjective(examId, objectiveId);
    if (!objective) {
      return NextResponse.json(
        { error: `Objective '${objectiveId}' not found for exam '${examId}'` },
        { status: 400 }
      );
    }

    // Check if question type is supported
    if (!examProfile.questionTypes.includes(questionType as 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay')) {
      return NextResponse.json(
        { error: `Question type '${questionType}' not supported for ${examProfile.name}` },
        { status: 400 }
      );
    }

    // Generate the prompt with exam mode context
    const prompt = getQuestionPrompt({
      examProfile,
      objective,
      questionType: questionType as 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay',
      examMode,
      difficulty,
      previousQuestions
    });

    console.log('🎯 V2 API: Starting Gemini generation...');

    // Stream the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let questionGenerated = false;
          let controllerClosed = false;
          
          for await (const chunk of generateStreamingQuestion(prompt)) {
            if (controllerClosed) break;
            
            try {
              const data = JSON.stringify(chunk) + '\n';
              controller.enqueue(encoder.encode(data));
              
              // Add delay for better streaming visualization
              await new Promise(resolve => setTimeout(resolve, 300));
              
              if (chunk.type === 'complete') {
                questionGenerated = true;
                console.log('🎯 V2 API: Question generation complete');
                break;
              }
            } catch (controllerError) {
              console.log('🎯 V2 API: Controller error (stream ended):', controllerError.message);
              controllerClosed = true;
              break;
            }
          }
          
          if (!controllerClosed) {
            if (!questionGenerated) {
              const errorData = JSON.stringify({
                type: 'error',
                content: 'Failed to generate complete question'
              }) + '\n';
              try {
                controller.enqueue(encoder.encode(errorData));
              } catch (e) {
                controllerClosed = true;
              }
            }
            
            if (!controllerClosed) {
              controller.close();
            }
          }
        } catch (error) {
          console.error('🎯 V2 API: Streaming error:', error);
          try {
            const errorData = JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Failed to generate question'
            }) + '\n';
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          } catch (closeError) {
            console.log('🎯 V2 API: Controller already closed during error handling');
          }
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('🎯 V2 API: Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate question'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available exams and objectives
export async function GET() {
  try {
    const { getAllExams } = await import('@/lib/certifications');
    const exams = getAllExams();

    const examList = exams.map(exam => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      provider: exam.provider,
      objectives: exam.objectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        weight: obj.weight,
        level: obj.level
      })),
      questionTypes: exam.questionTypes,
      constraints: exam.constraints
    }));

    return NextResponse.json({
      success: true,
      exams: examList
    });

  } catch (error) {
    console.error('🎯 V2 API: Error listing exams:', error);
    return NextResponse.json(
      { error: 'Failed to list exam profiles' },
      { status: 500 }
    );
  }
}
