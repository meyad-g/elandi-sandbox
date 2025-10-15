// Test endpoint to verify JSON generation is working
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, generateQuestionDirect } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const method = searchParams.get('method') || 'direct';

  try {
    const testPrompt = `You are testing JSON generation for a data engineering certification.

TOPIC: Data modeling fundamentals
OBJECTIVE: Test understanding of dimensional modeling concepts

Create a direct question about star schema characteristics.

STYLE: Direct question (1 sentence, no scenarios)
DIFFICULTY: Intermediate
FOCUS: Technical definition/concept`;

    let result;
    let timing = Date.now();

    if (method === 'direct') {
      // Test the direct non-streaming method
      result = await generateQuestionDirect(testPrompt);
      timing = Date.now() - timing;
      
      return NextResponse.json({
        method: 'generateQuestionDirect',
        success: true,
        result,
        timing: `${timing}ms`,
        validation: {
          hasQuestion: !!result.question,
          hasOptions: Array.isArray(result.options) && result.options.length > 0,
          hasCorrectIndex: typeof result.correct === 'number',
          isValid: !!(result.question && result.options?.length && typeof result.correct === 'number')
        }
      });
      
    } else {
      // Test the basic generateJSON method
      const jsonPrompt = `${testPrompt}

Return ONLY this JSON format:
{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C"],
  "correct": 0
}`;

      result = await generateJSON(jsonPrompt);
      timing = Date.now() - timing;
      
      return NextResponse.json({
        method: 'generateJSON',
        success: true,
        result,
        timing: `${timing}ms`,
        validation: {
          hasQuestion: !!(result as any).question,
          hasOptions: Array.isArray((result as any).options),
          hasCorrectIndex: typeof (result as any).correct === 'number',
          isValid: !!((result as any).question && (result as any).options?.length && typeof (result as any).correct === 'number')
        }
      });
    }

  } catch (error) {
    console.error('JSON Generation Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Try checking Gemini API key and connection'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customPrompt } = await request.json();
    
    if (!customPrompt) {
      return NextResponse.json({ error: 'Custom prompt required' }, { status: 400 });
    }

    // Test with custom prompt
    const result = await generateQuestionDirect(customPrompt);
    
    return NextResponse.json({
      success: true,
      customPrompt: customPrompt.substring(0, 100) + '...',
      result,
      analysis: {
        questionLength: result.question?.length || 0,
        optionCount: result.options?.length || 0,
        questionStarter: result.question?.split(' ').slice(0, 3).join(' '),
        isPrimaryPattern: result.question?.toLowerCase().includes('primary') || false
      }
    });

  } catch (error) {
    console.error('Custom JSON test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
