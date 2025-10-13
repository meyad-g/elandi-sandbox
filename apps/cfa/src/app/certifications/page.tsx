'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CertificationSelector } from '../../components/CertificationSelector';
import ShaderBackground from '../../components/ShaderBackground';

export default function CertificationsPage() {
  const router = useRouter();

  const handleCertificationSelect = (trackId: string, levelId: string) => {
    // Check if it's a guild certification - skip mode selection and go straight to prep
    if (trackId.includes('data-engineer') || 
        trackId.includes('ml-engineer') || 
        trackId.includes('software-engineer') ||
        trackId.includes('data-architect') ||
        trackId.includes('data-scientist') ||
        trackId.includes('ai-engineer') ||
        trackId.includes('business-intelligence')) {
      // Guild certifications go straight to prep mode
      router.push(`/study/${trackId}/${levelId}?mode=prep`);
    } else {
      // Other certifications go to mode selection first
      router.push(`/study/${trackId}/${levelId}`);
    }
  };

  return (
    <ShaderBackground>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 min-h-screen text-white font-geist-sans">
        <CertificationSelector onSelectLevel={handleCertificationSelect} />
      </div>
    </ShaderBackground>
  );
}
