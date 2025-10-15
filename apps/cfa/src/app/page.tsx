'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SimpleCertificationHero } from '../components/SimpleCertificationHero';
import ShaderBackground from '../components/ShaderBackground';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/certifications');
  };

  return (
    <ShaderBackground>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <SimpleCertificationHero onGetStarted={handleGetStarted} />
    </ShaderBackground>
  );
}
