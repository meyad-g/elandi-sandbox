'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ExamProfile } from '@/lib/certifications';
import ShaderBackground from '@/components/ShaderBackground';
import GuildDataInput from './components/GuildDataInput';
import GuildProfileSummary from './components/GuildProfileSummary';

export default function GuildAdminPage() {
  const router = useRouter();
  const [inputData, setInputData] = useState('');
  const [generatedProfile, setGeneratedProfile] = useState<ExamProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputData.trim()) {
      setError('Please provide text input to generate a guild profile.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/generate-guild-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate profile: ${response.statusText}`);
      }

      const profile = await response.json();
      setGeneratedProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the profile');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleReset = () => {
    setInputData('');
    setGeneratedProfile(null);
    setError(null);
  };
  const handleSaveProfile = async () => {
    if (!generatedProfile) return;

    try {
      const response = await fetch('/api/admin/save-guild-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Redirect to exam prep for the new guild profile
      router.push(`/study/data-engineer/data-engineer-cert?mode=prep`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  if (!generatedProfile) {
    // Input Phase - Centered Layout
    return (
      <ShaderBackground>
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 min-h-screen text-white font-geist-sans flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 py-8 w-full">
            {/* Back Button */}
            <motion.div
              className="absolute top-6 left-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.button
                onClick={() => router.push('/certifications')}
                className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Certifications
              </motion.button>
            </motion.div>

            {/* Centered Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4 leading-tight">
                Guild Certificate
                <br />
                <span className="font-medium bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Creator
                </span>
              </h1>
              
              <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                Transform job descriptions, training materials, or curriculum content into a complete 
                certification profile using AI.
              </p>
            </motion.div>

            {/* Centered Input */}
            <motion.div 
              className="max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GuildDataInput
                inputData={inputData}
                onInputChange={setInputData}
                onGenerate={handleGenerate}
                onReset={handleReset}
                isGenerating={isGenerating}
                error={error}
              />
            </motion.div>

            {/* Demo Examples */}
            <motion.div 
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Quick Demo Examples
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  onClick={() => setInputData('Senior Data Engineer role requiring expertise in Python, SQL, cloud platforms (AWS/Azure), data pipelines, ETL processes, big data technologies (Spark, Kafka), data warehousing, machine learning basics, and data governance. Must demonstrate proficiency in building scalable data architectures.')}
                  className="group p-6 text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                    <span className="text-white text-sm font-bold">DE</span>
                  </div>
                  <h4 className="font-medium text-white mb-2 group-hover:text-emerald-300 transition-colors">Data Engineer Role</h4>
                  <p className="text-sm text-white/60 leading-relaxed">Job description with technical requirements</p>
                </motion.button>
                <motion.button
                  onClick={() => setInputData('Full-stack developer certification covering React, Node.js, TypeScript, database design, API development, cloud deployment, testing strategies, security best practices, performance optimization, and modern development workflows including CI/CD.')}
                  className="group p-6 text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mb-4">
                    <span className="text-white text-sm font-bold">FS</span>
                  </div>
                  <h4 className="font-medium text-white mb-2 group-hover:text-blue-300 transition-colors">Full-Stack Developer</h4>
                  <p className="text-sm text-white/60 leading-relaxed">Comprehensive technical curriculum</p>
                </motion.button>
                <motion.button
                  onClick={() => setInputData('Product Management certification focusing on user research, market analysis, roadmap planning, stakeholder communication, agile methodologies, data-driven decision making, competitive analysis, product launch strategies, and cross-functional team leadership.')}
                  className="group p-6 text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                    <span className="text-white text-sm font-bold">PM</span>
                  </div>
                  <h4 className="font-medium text-white mb-2 group-hover:text-purple-300 transition-colors">Product Manager</h4>
                  <p className="text-sm text-white/60 leading-relaxed">Business and strategy focused role</p>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </ShaderBackground>
    );
  }

  // Results Phase - Enhanced Dashboard Layout
  return (
    <ShaderBackground>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 min-h-screen text-white font-geist-sans">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Enhanced Header */}
          <motion.div
            className="mb-8  rounded-xl p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={handleReset}
              className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors  px-4 py-2 rounded-lg "
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Create Another Profile
            </motion.button>
          </motion.div>

          {/* Profile Summary with Better Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GuildProfileSummary
              profile={generatedProfile}
              onSave={handleSaveProfile}
            />
          </motion.div>
        </div>
      </div>
    </ShaderBackground>
  );
}
