import { NextRequest, NextResponse } from 'next/server';
import { createInterviewStructureAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { jobAnalysis, company, role } = await request.json();

    if (!jobAnalysis) {
      return NextResponse.json(
        { error: 'Job analysis is required' },
        { status: 400 }
      );
    }

    const interviewAnalyzer = createInterviewStructureAgent();
    
    const interviewStructure = await interviewAnalyzer.analyzeInterviewStructure(
      jobAnalysis, 
      company, 
      role
    );

    return NextResponse.json(interviewStructure);

  } catch (error) {
    console.error('Error analyzing interview structure:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to analyze interview structure'
      },
      { status: 500 }
    );
  }
}
