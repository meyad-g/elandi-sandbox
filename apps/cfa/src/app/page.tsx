'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SimpleCertificationHero } from '../components/SimpleCertificationHero';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/certifications');
  };

  return <SimpleCertificationHero onGetStarted={handleGetStarted} />;
}
