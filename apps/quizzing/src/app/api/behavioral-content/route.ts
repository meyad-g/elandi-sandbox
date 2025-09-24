import { NextRequest, NextResponse } from 'next/server';
import { createBehavioralInterviewAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { company, role } = await request.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      );
    }

    const behavioralAgent = createBehavioralInterviewAgent();
    
    const content = await behavioralAgent.generateBehavioralContent(company, role);

    return NextResponse.json(content);

  } catch (error) {
    console.error('Error generating behavioral content:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate behavioral content'
      },
      { status: 500 }
    );
  }
}
