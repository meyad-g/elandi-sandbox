import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenerativeAI(apiKey);
};

interface ExplanationRequest {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  userSelectedIndex?: number;
  examContext?: {
    examName: string;
    objectiveName: string;
    topicArea: string;
  };
}

function buildExplanationPrompt({
  questionText,
  options,
  correctAnswerIndex,
  userSelectedIndex,
  examContext
}: ExplanationRequest): string {
  const correctOption = options[correctAnswerIndex];
  const userOption = userSelectedIndex !== undefined ? options[userSelectedIndex] : null;
  const wasCorrect = userSelectedIndex === correctAnswerIndex;

  return `You are an expert ${examContext?.examName || 'CFA'} instructor providing concise, focused explanations.

QUESTION: ${questionText}

CORRECT ANSWER: ${String.fromCharCode(65 + correctAnswerIndex)}) ${correctOption}
${userOption ? `USER SELECTED: ${String.fromCharCode(65 + userSelectedIndex!)}) ${userOption} ${wasCorrect ? '✓' : '✗'}` : ''}

Provide a CONCISE explanation (2-3 sentences maximum) that:
1. States why the correct answer is right
2. Briefly explains why other key options are wrong${userOption && !wasCorrect ? `
3. Explains why "${userOption}" was incorrect` : ''}

Keep it short, clear, and focused on essential reasoning only.

Return ONLY a JSON response:
{
  "explanation": "Brief, focused explanation in 2-3 sentences maximum."
}`;
}

export async function POST(request: NextRequest) {
  try {
    const explanationRequest: ExplanationRequest = await request.json();
    
    console.log('🎯 Explanation API: Generating explanation for:', {
      questionLength: explanationRequest.questionText.length,
      optionsCount: explanationRequest.options.length,
      correctIndex: explanationRequest.correctAnswerIndex,
      userIndex: explanationRequest.userSelectedIndex,
      examContext: explanationRequest.examContext
    });

    // Validate request
    if (!explanationRequest.questionText || !explanationRequest.options || explanationRequest.options.length === 0) {
      return NextResponse.json(
        { error: 'Missing question text or options' },
        { status: 400 }
      );
    }

    if (explanationRequest.correctAnswerIndex < 0 || explanationRequest.correctAnswerIndex >= explanationRequest.options.length) {
      return NextResponse.json(
        { error: 'Invalid correct answer index' },
        { status: 400 }
      );
    }

    // Generate explanation prompt
    const prompt = buildExplanationPrompt(explanationRequest);
    
    console.log('🎯 Explanation API: Starting Gemini generation...');

    // Use Gemini to generate explanation
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    
    console.log('🎯 Explanation API: Raw response:', responseText.substring(0, 100) + '...');

    try {
      // Strip markdown code block formatting if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json') && jsonText.endsWith('```')) {
        jsonText = jsonText.slice(7, -3).trim();
      } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
        jsonText = jsonText.slice(3, -3).trim();
      }
      
      console.log('🎯 Explanation API: Cleaned JSON:', jsonText.substring(0, 100) + '...');
      
      const explanationData = JSON.parse(jsonText);
      console.log('🎯 Explanation API: Generated explanation successfully');
      
      return NextResponse.json({
        explanation: explanationData.explanation,
        generatedAt: new Date().toISOString()
      });
      
    } catch (parseError) {
      console.error('🎯 Explanation API: Parse error:', parseError);
      console.error('🎯 Explanation API: Failed to parse:', responseText);
      
      return NextResponse.json(
        { error: 'Failed to parse explanation response' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('🎯 Explanation API: Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
