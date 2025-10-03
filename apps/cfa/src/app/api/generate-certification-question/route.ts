import { NextRequest, NextResponse } from 'next/server';
import { createCertificationQuestionAgent, EXAM_PROFILES, initializeOpenAI } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { examId, objectiveId, questionType = 'multiple_choice' } = await request.json();
    console.log('🎓 CERT API: Generating question for exam:', examId, 'objective:', objectiveId, 'type:', questionType);

    // Initialize OpenAI with the API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    initializeOpenAI(apiKey);

    // Validate exam profile exists
    const examProfile = EXAM_PROFILES[examId];
    if (!examProfile) {
      return NextResponse.json(
        { error: `Exam profile '${examId}' not found. Available: ${Object.keys(EXAM_PROFILES).join(', ')}` },
        { status: 400 }
      );
    }

    // Find the objective
    const objective = examProfile.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      return NextResponse.json(
        { error: `Objective '${objectiveId}' not found for exam '${examId}'` },
        { status: 400 }
      );
    }

    // Validate question type is supported by this exam
    const supportedType = examProfile.questionTypes.find(qt => qt.type === questionType);
    if (!supportedType || !supportedType.enabled) {
      return NextResponse.json(
        { error: `Question type '${questionType}' not supported for exam '${examId}'` },
        { status: 400 }
      );
    }

    console.log('🎓 CERT API: Creating certification question agent...');
    const certificationAgent = createCertificationQuestionAgent();

    console.log('🎓 CERT API: Generating question...');
    const question = await certificationAgent.generateCertificationQuestion(
      examProfile,
      objective,
      questionType as 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay'
    );

    console.log('🎓 CERT API: Question generated successfully');
    
    return NextResponse.json({
      success: true,
      question,
      examProfile: {
        id: examProfile.id,
        name: examProfile.name,
        description: examProfile.description
      },
      objective: {
        id: objective.id,
        title: objective.title,
        weight: objective.weight,
        level: objective.level
      }
    });

  } catch (error) {
    console.error('🎓 CERT API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate certification question'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available exams and objectives
export async function GET() {
  try {
    const exams = Object.values(EXAM_PROFILES).map(profile => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      objectives: profile.objectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        weight: obj.weight,
        level: obj.level
      })),
      questionTypes: profile.questionTypes.filter(qt => qt.enabled).map(qt => qt.type),
      constraints: profile.constraints
    }));

    return NextResponse.json({
      success: true,
      exams
    });

  } catch (error) {
    console.error('🎓 CERT API: Error listing exams:', error);
    
    return NextResponse.json(
      { error: 'Failed to list exam profiles' },
      { status: 500 }
    );
  }
}