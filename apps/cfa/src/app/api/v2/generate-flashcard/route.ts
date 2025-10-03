import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { getExamProfile, getExamObjective } from '@/lib/certifications';
import { buildFlashcardPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { examId, objectiveId, focusArea } = await request.json();

    console.log('🃏 V2 FLASHCARD API: Generating flashcard:', { examId, objectiveId, focusArea });

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

    // Generate the prompt
    const prompt = buildFlashcardPrompt({
      examProfile,
      objective,
      focusArea
    });

    console.log('🃏 V2 FLASHCARD API: Starting Gemini generation...');

    // Generate flashcard content
    const flashcard = await generateJSON<{
      front: string;
      back: string;
      tags: string[];
    }>(prompt);

    console.log('🃏 V2 FLASHCARD API: Flashcard generated successfully');

    return NextResponse.json({
      success: true,
      flashcard: {
        title: flashcard.front,
        content: flashcard.back,
        tags: flashcard.tags,
        skill: objective.title,
        examId: examProfile.id,
        objectiveId: objective.id
      },
      exam: {
        id: examProfile.id,
        name: examProfile.name,
        provider: examProfile.provider
      },
      objective: {
        id: objective.id,
        title: objective.title,
        weight: objective.weight,
        level: objective.level
      }
    });

  } catch (error) {
    console.error('🃏 V2 FLASHCARD API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate flashcard'
      },
      { status: 500 }
    );
  }
}
