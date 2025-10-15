'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, GraduationCap } from 'lucide-react';

interface SimpleCertificationHeroProps {
  onGetStarted: () => void;
}

export const SimpleCertificationHero: React.FC<SimpleCertificationHeroProps> = ({ 
  onGetStarted 
}) => {
  return (
    <section className="relative z-20 min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        {/* Main content */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light text-white mb-8 leading-[1.1]">
            Master Professional
            <br />
            <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Certifications
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light mb-12">
            Get certified in CFA, AWS, and other premium credentials. AI-powered practice questions 
            that adapt to help you pass on your first attempt.
          </p>

          <motion.button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl text-lg shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Target className="w-5 h-5" />
            Choose Your Certification
          </motion.button>
        </motion.div>

        {/* Clean, simple design without bottom boxes */}
      </div>
    </section>
  );
};
