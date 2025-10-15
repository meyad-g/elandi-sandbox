import { NextRequest, NextResponse } from 'next/server';
import { generateStreamingQuestion } from '@/lib/gemini';
import { getExamProfile, getExamObjective } from '@/lib/certifications';
import { getQuestionPrompt } from '@/lib/prompts';
import { QuestionDistributionManager, generateSessionId } from '@/lib/questionDistribution';
import { validateQuestionStyle } from '@/lib/questionPatterns';

export async function POST(request: NextRequest) {
  try {
    const { 
      examId, 
      objectiveId, 
      questionType = 'multiple_choice',
      examMode = 'prep',
      difficulty,
      previousQuestions = [],
      sessionId = generateSessionId(),
      forceQuestionStyle // Optional: force a specific style for testing
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

    // Determine question style using distribution logic
    const questionStyle = forceQuestionStyle || 
      QuestionDistributionManager.getNextQuestionStyle(sessionId, examProfile, objective);
    
    console.log('🎨 Selected question style:', questionStyle, 'for session:', sessionId);

    // Generate the prompt with exam mode context and question style
    const prompt = getQuestionPrompt({
      examProfile,
      objective,
      questionType: questionType as 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay',
      questionStyle,
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
          let generatedQuestionText = '';
          
          for await (const chunk of generateStreamingQuestion(prompt)) {
            if (controllerClosed) break;
            
            try {
              // Capture question text for validation
              if (chunk.type === 'question_text') {
                generatedQuestionText = chunk.content;
              }
              
              const data = JSON.stringify(chunk) + '\n';
              controller.enqueue(encoder.encode(data));
              
              // Add delay for better streaming visualization
              await new Promise(resolve => setTimeout(resolve, 300));
              
              if (chunk.type === 'complete') {
                questionGenerated = true;
                
                // Record the question generation in distribution tracker
                QuestionDistributionManager.recordQuestionGenerated(
                  sessionId, 
                  examId, 
                  objectiveId, 
                  questionStyle
                );
                
                // Validate question style if enabled and question text was captured
                const shouldValidate = examProfile.questionGeneration?.styleValidation !== false;
                if (shouldValidate && generatedQuestionText) {
                  const isValid = validateQuestionStyle(generatedQuestionText, questionStyle);
                  if (!isValid) {
                    console.warn(`🎨 Style validation failed: Generated "${questionStyle}" question doesn't match expected pattern`);
                    // Note: We continue anyway but log the validation failure
                  } else {
                    console.log(`🎨 Style validation passed for ${questionStyle} question`);
                  }
                }
                
                // Send distribution stats with completion
                const distributionStats = QuestionDistributionManager.getDistributionSummary(sessionId);
                if (distributionStats) {
                  const statsData = JSON.stringify({
                    type: 'distribution_stats',
                    content: 'Session distribution updated',
                    stats: distributionStats
                  }) + '\n';
                  controller.enqueue(encoder.encode(statsData));
                }
                
                console.log('🎯 V2 API: Question generation complete with style:', questionStyle);
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
