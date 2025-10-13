'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { StudyModeSelector, StudyMode } from '../../../../components/StudyModeSelector';
import { EnhancedCertificationQuiz } from '../../../../components/EnhancedCertificationQuiz';
import ShaderBackground from '../../../../components/ShaderBackground';

export default function StudyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const trackId = params.trackId as string;
  const levelId = params.levelId as string;
  const mode = searchParams.get('mode') as StudyMode | null;

  // If mode is specified in URL, go directly to quiz
  useEffect(() => {
    // Check if it's a guild certification and no mode specified - default to prep
    if (!mode && (trackId.includes('data-engineer') || 
                  trackId.includes('ml-engineer') || 
                  trackId.includes('software-engineer') ||
                  trackId.includes('data-architect') ||
                  trackId.includes('data-scientist') ||
                  trackId.includes('ai-engineer') ||
                  trackId.includes('business-intelligence'))) {
      router.replace(`/study/${trackId}/${levelId}?mode=prep`);
    }
  }, [mode, trackId, levelId, router]);

  const handleModeSelect = (selectedMode: StudyMode) => {
    router.push(`/study/${trackId}/${levelId}?mode=${selectedMode}`);
  };

  const handleBack = () => {
    router.push('/certifications');
  };

  const handleExit = () => {
    router.push('/certifications');
  };

  const handleBackToModeSelect = () => {
    router.push(`/study/${trackId}/${levelId}`);
  };

  // If mode is specified, show the quiz
  if (mode) {
    return (
      <ShaderBackground>
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="min-h-screen text-white font-geist-sans relative z-20">
          <EnhancedCertificationQuiz
            levelId={levelId}
            onExit={handleExit}
            studyMode="comprehensive"
            examMode={mode}
            onBackToModeSelect={handleBackToModeSelect}
          />
        </div>
      </ShaderBackground>
    );
  }

  // Otherwise show mode selection
  return (
    <ShaderBackground>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 min-h-screen text-white font-geist-sans">
        <StudyModeSelector
          onModeSelect={handleModeSelect}
          onBack={handleBack}
          previousAttempts={undefined} // TODO: Load from localStorage/database
        />
      </div>
    </ShaderBackground>
  );
}
