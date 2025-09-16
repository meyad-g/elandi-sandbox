'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search } from 'lucide-react';
import { Input } from './ui/Input';
import { SkillAnalysisResult } from '@sandbox-apps/ai';

interface HeroSectionProps {
  onGetStarted: () => void;
  onAddJob: (data: { url: string; skills: string[]; questions: unknown[]; analysis?: SkillAnalysisResult; thinking?: string }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onAddJob }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentThinking, setAgentThinking] = useState('');

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAgentThinking('');

    try {
      if (!url.trim()) {
        throw new Error('Please enter a job posting URL or search terms.');
      }
      if (url.trim().length < 3) {
        throw new Error('Please enter a more specific job search term or URL.');
      }

      setLoading(true);

      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: url, stream: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze job posting');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let analysis = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (data.type === 'thinking') {
                setAgentThinking(prev => prev + data.content);
              } else if (data.type === 'result') {
                analysis = data.content;
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch {
              console.warn('Could not parse streaming chunk:', line);
            }
          }
        }
      }

      if (!analysis) {
        throw new Error('No analysis result received');
      }

      const finalThinking = agentThinking;

      onAddJob({
        url,
        skills: analysis.skills,
        questions: [],
        analysis,
        thinking: finalThinking
      });

      // Just launch the app to show jobs grid - don't redirect to another analysis page
      onGetStarted();
      
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job posting');
    } finally {
      setLoading(false);
      setAgentThinking('');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
        {/* Logo/Brand */}
        <motion.div
          className="inline-flex items-center px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm mb-8 relative border border-white/20"
          style={{
            filter: "url(#glass-effect)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-xs font-light relative z-10 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            ✨ AI-Powered Learning Platform
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-6">
            <span className="font-medium italic">Master</span> Any
            <br />
            <span className="font-light tracking-tight text-white">Skill</span>
          </h2>
          
          <motion.p
            className="text-xs font-light text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Analyze job postings and generate personalized learning paths with AI-powered skill assessment
          </motion.p>

          {/* Job Analysis Input - Integrated into Hero */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <form onSubmit={handleAddJob} className="space-y-6">
              <div className="relative">
                <Input
                  label=""
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste job posting URL or describe your target role..."
                  error={error}
                  className="bg-black/40 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 text-xs font-light py-3 px-6 rounded-full"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4 text-white/50" />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3 rounded-full bg-white text-black font-normal text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Start Learning"
                )}
              </motion.button>
            </form>

            {/* Agent thinking display */}
            {agentThinking && (
              <motion.div
                className="mt-6 p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20"
                style={{
                  filter: "url(#glass-effect)",
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-xs font-light">AI analyzing...</span>
                </div>
                <div className="text-white/70 text-xs font-light font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {agentThinking}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
