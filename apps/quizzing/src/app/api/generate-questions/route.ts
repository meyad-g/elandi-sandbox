import { NextRequest, NextResponse } from 'next/server';
import { createQuestionGenerationAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { skill, count = 5 } = await request.json();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill is required' },
        { status: 400 }
      );
    }

    // Create and use the question generation agent
    const questionGenerator = createQuestionGenerationAgent();
    const questions = await questionGenerator.generateQuestionsBatch(skill, count);

    return NextResponse.json(questions);

  } catch (error) {
    console.error('Error generating questions:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate questions'
      },
      { status: 500 }
    );
  }
}
