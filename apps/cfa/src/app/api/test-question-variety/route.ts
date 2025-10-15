// Quick test endpoint to verify question variety and fix repetition issues
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { getExamProfile } from '@/lib/certifications';
import { QuestionOptimizationManager } from '@/lib/questionOptimizations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const examId = searchParams.get('examId') || 'data-engineer-cert';
  const count = parseInt(searchParams.get('count') || '5');

  try {
    const examProfile = getExamProfile(examId);
    if (!examProfile) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const objective = examProfile.objectives[0]; // Use first objective for testing
    
    // Generate multiple questions to test variety
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      const template = QuestionOptimizationManager.getOptimizedTemplate(
        examProfile.id,
        'direct', // Test direct questions since they were repetitive
        objective
      );
      
      const varietyPrompt = `${template}

CRITICAL: Generate a unique question that varies from previous attempts.

OBJECTIVE: ${objective.title}
KEY TOPICS: ${objective.keyTopics?.join(', ') || 'General topics'}

VARIETY REQUIREMENTS FOR THIS QUESTION #${i + 1}:
- Use a DIFFERENT question starter than "What is the primary..."
- Choose from: "How does...", "Which factor...", "What distinguishes...", "In what way...", "When does...", "Which statement..."
- Test understanding of: ${objective.keyTopics?.[i % (objective.keyTopics?.length || 1)] || 'core concepts'}
- Make it unique and engaging

Return ONLY this JSON format:
{
  "question": "Your unique question here?",
  "options": ["Option A", "Option B", "Option C"],
  "correct": 0
}`;

      try {
        const result = await generateJSON(varietyPrompt, 'gemini-2.5-flash-lite');
        questions.push({
          questionNumber: i + 1,
          question: result.question,
          options: result.options,
          correct: result.correct,
          startsWithPrimary: result.question.toLowerCase().startsWith('what is the primary'),
          questionStarter: result.question.split(' ').slice(0, 3).join(' ').toLowerCase()
        });
      } catch (error) {
        questions.push({
          questionNumber: i + 1,
          error: `Failed to generate question: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    // Analyze variety
    const starters = questions
      .filter(q => !q.error)
      .map(q => q.questionStarter);
    
    const uniqueStarters = new Set(starters);
    const primaryCount = questions.filter(q => q.startsWithPrimary).length;
    
    const varietyAnalysis = {
      totalQuestions: questions.length,
      uniqueStarters: uniqueStarters.size,
      starterVariety: Array.from(uniqueStarters),
      repetitivePrimaryCount: primaryCount,
      varietyScore: Math.round((uniqueStarters.size / questions.length) * 100),
      isImproved: primaryCount < questions.length * 0.3 // Less than 30% repetitive is good
    };

    return NextResponse.json({
      examId,
      objective: {
        id: objective.id,
        title: objective.title,
        keyTopics: objective.keyTopics?.slice(0, 3) || []
      },
      questions,
      varietyAnalysis,
      recommendations: varietyAnalysis.isImproved 
        ? ['✅ Question variety looks good!', 'Questions show diverse patterns', 'System is working as expected']
        : ['⚠️ Still seeing some repetition', 'Consider adjusting prompt templates', 'May need stronger variety enforcement']
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
