import { NextRequest, NextResponse } from 'next/server';
import { createQuestionGenerationAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { skill, stream = true } = await request.json();
    console.log('🚀 API: Generating question for skill:', skill, 'stream:', stream);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill is required' },
        { status: 400 }
      );
    }

    console.log('🚀 API: Creating question generation agent...');
    const questionGenerator = createQuestionGenerationAgent();

    if (stream) {
      const encoder = new TextEncoder();
      
      const readable = new ReadableStream({
        async start(controller) {
          try {
            console.log('🚀 API: Starting to generate question stream...');
            // Generate a single question and stream it chunk by chunk
            for await (const chunk of questionGenerator.generateSingleQuestion(skill)) {
              console.log('🚀 API: Got chunk:', chunk);
              const data = JSON.stringify(chunk) + '\n';
              controller.enqueue(encoder.encode(data));
              
              // If we got the complete question, we're done
              if (chunk.type === 'complete') {
                console.log('🚀 API: Question generation complete');
                break;
              }
            }
            controller.close();
          } catch (error) {
            console.error('🚀 API: Streaming error:', error);
            const errorData = JSON.stringify({
              error: error instanceof Error ? error.message : 'Failed to generate question'
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
    } else {
      // Non-streaming - generate a single question
      const question = await questionGenerator.generateSingleQuestionSync(skill);
      return NextResponse.json(question);
    }

  } catch (error) {
    console.error('Error generating question:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate question'
      },
      { status: 500 }
    );
  }
}
