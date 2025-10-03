
import { NextRequest, NextResponse } from 'next/server';
import { createJobAnalysisAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { input, stream } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required (URL or search term)' },
        { status: 400 }
      );
    }

    // Check if input is a URL or search term
    const isUrl = /^https?:\/\//i.test(input.trim());

    // For URLs, validate format
    if (isUrl && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(input)) {
      return NextResponse.json(
        { error: 'Please enter a valid http(s) URL.' },
        { status: 400 }
      );
    }

    const jobAnalyzer = createJobAnalysisAgent();

    // If streaming is requested, use the streaming method
    if (stream) {
      const encoder = new TextEncoder();
      
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of jobAnalyzer.analyzeJobPostingWithThinking(input)) {
              const data = JSON.stringify(chunk) + '\n';
              controller.enqueue(encoder.encode(data));
            }
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Failed to analyze job posting'
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
      // Non-streaming response (original method)
      const analysis = await jobAnalyzer.analyzeJobPosting(input);
      return NextResponse.json(analysis);
    }

  } catch (error) {
    console.error('Error analyzing job posting:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to analyze job posting'
      },
      { status: 500 }
    );
  }
}
