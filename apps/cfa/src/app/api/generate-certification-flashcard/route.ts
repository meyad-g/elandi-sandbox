import { NextRequest, NextResponse } from 'next/server';
import { createCertificationQuestionAgent, EXAM_PROFILES, initializeOpenAI } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { examId, objectiveId } = await request.json();
    console.log('🃏 CERT FLASHCARD API: Generating flashcard for exam:', examId, 'objective:', objectiveId);

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

    console.log('🃏 CERT FLASHCARD API: Creating certification question agent...');
    const certificationAgent = createCertificationQuestionAgent();

    console.log('🃏 CERT FLASHCARD API: Generating flashcard...');
    const flashcard = await certificationAgent.generateCertificationFlashcard(
      examProfile,
      objective
    );

    console.log('🃏 CERT FLASHCARD API: Flashcard generated successfully');
    
    return NextResponse.json({
      success: true,
      flashcard,
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
    console.error('🃏 CERT FLASHCARD API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate certification flashcard'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list objectives suitable for flashcard generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json(
        { error: 'examId parameter is required' },
        { status: 400 }
      );
    }

    const examProfile = EXAM_PROFILES[examId];
    if (!examProfile) {
      return NextResponse.json(
        { error: `Exam profile '${examId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      exam: {
        id: examProfile.id,
        name: examProfile.name,
        description: examProfile.description
      },
      objectives: examProfile.objectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        weight: obj.weight,
        level: obj.level
      }))
    });

  } catch (error) {
    console.error('🃏 CERT FLASHCARD API: Error listing objectives:', error);
    
    return NextResponse.json(
      { error: 'Failed to list exam objectives' },
      { status: 500 }
    );
  }
}
