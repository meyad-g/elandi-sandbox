import { NextRequest, NextResponse } from 'next/server';
import { createTechnicalInterviewAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { company, role, level, contentType } = await request.json();

    if (!company || !role || !contentType) {
      return NextResponse.json(
        { error: 'Company, role, and contentType are required' },
        { status: 400 }
      );
    }

    const technicalAgent = createTechnicalInterviewAgent();
    
    const content = await technicalAgent.generateTechnicalContent(
      company, 
      role, 
      level || 'mid', 
      contentType
    );

    return NextResponse.json(content);

  } catch (error) {
    console.error('Error generating technical content:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate technical content'
      },
      { status: 500 }
    );
  }
}
