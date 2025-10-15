'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
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

  const handleGuildAdmin = () => {
    router.push('/admin/guilds');
  };

  return (
    <ShaderBackground>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 min-h-screen text-white font-geist-sans">
        {/* Guild Admin Button */}
        <div className="absolute top-6 right-6 z-50">
          <motion.button
            onClick={handleGuildAdmin}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/20 hover:border-purple-400/50 text-white text-sm font-medium rounded-xl shadow-2xl transition-all duration-300 hover:bg-black/80"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <Settings className="w-3 h-3 text-white" />
            </div>
            <span className="group-hover:text-purple-300 transition-colors">Guild Creator</span>
          </motion.button>
        </div>

        <CertificationSelector onSelectLevel={handleCertificationSelect} />
      </div>
    </ShaderBackground>
  );
}
