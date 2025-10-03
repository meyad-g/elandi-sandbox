import { NextRequest, NextResponse } from 'next/server';
import { createQuestionGenerationAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { flashcard, skill } = await request.json();
    console.log('🃏 API: Generating question from flashcard:', flashcard.title, 'skill:', skill);

    if (!flashcard || !flashcard.title || !flashcard.content || !flashcard.skill) {
      return NextResponse.json(
        { error: 'Valid flashcard object is required' },
        { status: 400 }
      );
    }

    console.log('🃏 API: Creating question generation agent...');
    const questionGenerator = createQuestionGenerationAgent();

    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          console.log('🃏 API: Starting to generate question from flashcard stream...');
          // Generate a question based on the flashcard content
          for await (const chunk of questionGenerator.generateQuestionFromFlashcard(flashcard)) {
            console.log('🃏 API: Got chunk:', chunk);
            const data = JSON.stringify(chunk) + '\n';
            controller.enqueue(encoder.encode(data));
            
            // If we got the complete question, we're done
            if (chunk.type === 'complete') {
              console.log('🃏 API: Question generation from flashcard complete');
              break;
            }
          }
          controller.close();
        } catch (error) {
          console.error('🃏 API: Streaming error:', error);
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Failed to generate question from flashcard'
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

  } catch (error) {
    console.error('🃏 API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate question from flashcard'
      },
      { status: 500 }
    );
  }
}
