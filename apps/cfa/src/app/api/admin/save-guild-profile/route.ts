import { NextRequest } from 'next/server';
import { ExamProfile, addGuildProfile } from '@/lib/certifications';

export async function POST(request: NextRequest) {
  try {
    const profile: ExamProfile = await request.json();
    
    // Validate required fields
    if (!profile.id || !profile.name || !profile.objectives) {
      return Response.json(
        { error: 'Invalid profile data: missing required fields' },
        { status: 400 }
      );
    }

    // Add the profile to the in-memory store
    addGuildProfile(profile);

    return Response.json({ 
      success: true, 
      message: 'Guild profile saved successfully',
      profileId: profile.id
    });
    
  } catch (error) {
    console.error('Error saving guild profile:', error);
    
    return Response.json(
      { 
        error: 'Failed to save guild profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

