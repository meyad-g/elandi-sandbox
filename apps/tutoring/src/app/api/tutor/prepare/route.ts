import { NextRequest, NextResponse } from 'next/server';
import { createGeminiTutorCopilotAgent, PrepRequest } from '@/lib/gemini-agents';
import { createTutorCopilotAgent } from '@/lib/agents';

// Set max listeners to prevent warning
if (typeof process !== 'undefined' && process.setMaxListeners) {
  process.setMaxListeners(15);
}

export async function POST(request: NextRequest) {
  try {
    const body: PrepRequest = await request.json();
    // Use Gemini for most scenarios, OpenAI for resources
    const geminiAgent = createGeminiTutorCopilotAgent();
    const openaiAgent = body.scenario === 'resources' ? createTutorCopilotAgent() : null;

    // Validate request
    if (!body.scenario || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: scenario and description' },
        { status: 400 }
      );
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let streamClosed = false;
    
    const stream = new ReadableStream({
      async start(controller) {
        const cleanup = () => {
          if (!streamClosed) {
            streamClosed = true;
            controller.close();
          }
        };
        
        try {
          // Route to the appropriate method based on scenario
          let generator;
          switch (body.scenario) {
            case 'lesson':
              generator = geminiAgent.prepareLessonPlan(body);
              break;
            case 'questions':
              generator = geminiAgent.generateQuestions(body);
              break;
            case 'resources':
              if (!openaiAgent) {
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'error',
                  content: 'OpenAI agent not initialized for resources'
                }) + '\n'));
                cleanup();
                return;
              }
              generator = openaiAgent.findResources(body);
              break;
            case 'interview':
              generator = geminiAgent.createInterviewDrill(body);
              break;
            case 'notes':
              generator = geminiAgent.generateWeeklyNote(body);
              break;
            default:
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'error',
                content: `Scenario ${body.scenario} not yet implemented`
              }) + '\n'));
              cleanup();
              return;
          }

          // Stream the results
          for await (const chunk of generator) {
            if (streamClosed) break;
            const data = JSON.stringify(chunk) + '\n';
            controller.enqueue(encoder.encode(data));
          }

          cleanup();
        } catch (error) {
          console.error('Streaming error:', error);
          if (!streamClosed) {
            try {
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'error',
                content: 'An error occurred while generating content'
              }) + '\n'));
            } catch (enqueueError) {
              console.error('Error enqueueing error message:', enqueueError);
            }
          }
          cleanup();
        }
      },
      
      cancel() {
        streamClosed = true;
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
