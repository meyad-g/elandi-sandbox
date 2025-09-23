import { NextRequest, NextResponse } from 'next/server';
import { createTutorCopilotAgent } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student, session } = body;

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Mock streaming smart brief generation
          const briefSections = [
            `Analyzing ${student.name}'s profile...`,
            `\n\n**Student Overview**`,
            `\n${student.name} is a ${student.year || student.grade_level} student studying ${session.subject} with ${student.board || session.board || "General curriculum"}.`,
            `\n\n**Recent Progress**`,
            `\n${student.recentProgress}`,
            `\n\n**Current Learning Gaps**`,
            `\nKey areas requiring attention: ${(student.currentGaps || student.current_gaps || ["assessment needed"]).join(', ')}.`,
            `\n\n**Upcoming Session Strategy (${session.time})**`,
            `\nFor today's ${session.duration} ${session.subject} session, focus on ${student.nextFocus}.`,
            `\n\n**Recommended Approach**`,
            `\n• Start with a 5-minute recap of previous learning`,
            `\n• Address ${(student.currentGaps || student.current_gaps || ["core concepts"])[0]} with targeted examples`,
            `\n• Use ${student.board || session.board || "standard"}-specific terminology and methods`,
            `\n• Include practice problems to build confidence`,
            `\n• End with clear next steps toward: ${student.upcomingObjective}`,
            `\n\n**Key Deadlines to Consider**`,
            `\n${student.nextDeadlines.join('\n')}`,
            `\n\n**Session Complete!** ✨`,
          ];

          for (let i = 0; i < briefSections.length; i++) {
            const section = briefSections[i];
            
            // Stream each character with a slight delay for realistic effect
            for (let j = 0; j < section.length; j++) {
              const char = section[j];
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'content',
                content: char
              }) + '\n'));
              
              // Small delay between characters (faster for spaces and punctuation)
              const delay = char === ' ' ? 20 : char.match(/[.!?]/) ? 100 : 50;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            // Longer pause between sections
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'complete'
          }) + '\n'));

          controller.close();
        } catch (error) {
          console.error('Smart brief generation error:', error);
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            content: 'Failed to generate smart brief'
          }) + '\n'));
          controller.close();
        }
      },
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
