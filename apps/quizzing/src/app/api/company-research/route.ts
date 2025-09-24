import { NextRequest, NextResponse } from 'next/server';
import { createCompanyResearchAgent } from '@sandbox-apps/ai';

export async function POST(request: NextRequest) {
  try {
    const { company, role } = await request.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      );
    }

    const researchAgent = createCompanyResearchAgent();
    
    const research = await researchAgent.generateCompanyResearch(company, role);

    return NextResponse.json(research);

  } catch (error) {
    console.error('Error generating company research:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate company research'
      },
      { status: 500 }
    );
  }
}
