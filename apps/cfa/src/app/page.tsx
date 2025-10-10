'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CertificationSelector } from '../components/CertificationSelector';
import { StudyModeSelector, StudyMode } from '../components/StudyModeSelector';
import { EnhancedCertificationQuiz } from '../components/EnhancedCertificationQuiz';
import { SimpleCertificationHero } from '../components/SimpleCertificationHero';
import ShaderBackground from '../components/ShaderBackground';

type AppState = 'hero' | 'certification-select' | 'mode-select' | 'quiz';

interface SelectedCertification {
  trackId: string;
  levelId: string;
}

interface StudyConfig {
  certification: SelectedCertification;
  mode: StudyMode;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('hero');
  const [studyConfig, setStudyConfig] = useState<StudyConfig | null>(null);

  const handleGetStarted = () => {
    setAppState('certification-select');
    // Smooth scroll to top when showing app
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCertificationSelect = (trackId: string, levelId: string) => {
    setStudyConfig(prev => ({
      certification: { trackId, levelId },
      mode: prev?.mode || 'prep'
    }));
    setAppState('mode-select');
  };

  const handleModeSelect = (mode: StudyMode) => {
    if (!studyConfig?.certification) return;
    
    setStudyConfig(prev => ({
      ...prev!,
      mode
    }));
    setAppState('quiz');
  };

  const handleExitQuiz = () => {
    setAppState('certification-select');
    setStudyConfig(null);
  };

  const handleBackToModeSelect = () => {
    setAppState('mode-select');
  };


  // Show quiz mode with consistent shader background
  if (appState === 'quiz' && studyConfig) {
    return (
      <ShaderBackground>
        {/* Dark overlay to reduce shader visibility */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <motion.div
          className="min-h-screen text-white font-geist-sans relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <EnhancedCertificationQuiz
            levelId={studyConfig.certification.levelId}
            onExit={handleExitQuiz}
            studyMode="comprehensive"
            examMode={studyConfig.mode}
            onBackToModeSelect={handleBackToModeSelect}
          />
        </motion.div>
      </ShaderBackground>
    );
  }

  // Always use shader background with seamless transitions
  return (
    <ShaderBackground>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 min-h-screen text-white font-geist-sans">
        <AnimatePresence mode="wait">
          {appState === 'hero' ? (
            <motion.div
              key="hero"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SimpleCertificationHero onGetStarted={handleGetStarted} />
            </motion.div>
          ) : appState === 'certification-select' ? (
            <motion.div
              key="certification-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CertificationSelector onSelectLevel={handleCertificationSelect} />
            </motion.div>
          ) : appState === 'mode-select' ? (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StudyModeSelector 
                onModeSelect={handleModeSelect}
                previousAttempts={undefined} // TODO: Load from localStorage/database
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ShaderBackground>
  );

}
