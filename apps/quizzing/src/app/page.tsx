'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '../types/quiz';
import { MinimalQuiz } from '../components/quiz/MinimalQuiz';
import { SkillAnalysisResult } from '@sandbox-apps/ai';
import { DollarSign, MapPin, Home as HomeIcon, Briefcase, ExternalLink, Target, Sparkles } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import ShaderBackground from '../components/ShaderBackground';

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<string | null>(null);

  // Quiz state from QuizApp
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [quizMode, setQuizMode] = useState(false);

  // Saved jobs (very simple local state)
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleGetStarted = () => {
    setShowApp(true);
    // Smooth scroll to top when showing app
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleThinking = (jobId: string) => {
    setExpandedThinking(expandedThinking === jobId ? null : jobId);
  };

  const addJob = ({ url, skills, questions, analysis, thinking }: { url: string; skills: string[]; questions: Job['questions']; analysis?: SkillAnalysisResult; thinking?: string }) => {
    const id = Date.now().toString();
    setJobs((prev) => [{ id, url, skills, questions, analysis, thinking }, ...prev]);
  };

  const startQuizFromJob = (job: Job) => {
    console.log('🚀 Starting quiz from job:', job);
    console.log('🚀 Job skills:', job.skills);
    console.log('🚀 Job skills length:', job.skills.length);
    setActiveJob(job);
    setQuizMode(true);
  };

  const exitQuiz = () => {
    setQuizMode(false);
    setActiveJob(null);
  };


  // Show quiz mode with consistent shader background
  if (quizMode && activeJob) {
    return (
      <ShaderBackground>
        {/* Dark overlay to reduce shader visibility */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <motion.div
          className="min-h-screen text-white font-geist-sans relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <MinimalQuiz
            job={activeJob}
            onExit={exitQuiz}
          />
        </motion.div>
      </ShaderBackground>
    );
  }

  // Always use shader background with seamless transitions
  return (
    <ShaderBackground>
      <AnimatePresence mode="wait">
        {!showApp ? (
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection onGetStarted={handleGetStarted} onAddJob={addJob} />
          </motion.div>
        ) : (
          <motion.div
            key="jobs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {renderJobsInterface()}
          </motion.div>
        )}
      </AnimatePresence>
    </ShaderBackground>
  );

  function renderJobsInterface() {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-20 max-w-6xl mx-auto px-6">
          {/* Simple header with consistent styling */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Your <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Learning Journey</span>
            </h2>
            <p className="text-xs font-light text-white/70 mb-8">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} analyzed and ready for learning
            </p>
          </motion.div>

          <AnimatePresence>
            {jobs.length === 0 && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto border border-white/20">
                  <Target className="w-8 h-8 text-white/70" />
                </div>
                <h4 className="text-xl font-light text-white mb-3">
                  No Jobs Saved Yet
                </h4>
                <p className="text-xs font-light text-white/70 max-w-md mx-auto leading-relaxed">
                  Go back to analyze your first job posting
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className={`grid gap-6 ${jobs.length === 1 ? 'place-items-center' : 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
              <AnimatePresence>
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    className={`group relative bg-black/70 backdrop-blur-xl rounded-2xl border border-white/40 hover:border-cyan-400/60 transition-all duration-300 hover:bg-black/95 p-6 cursor-pointer ${
                      jobs.length === 1 ? 'max-w-lg' : ''
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => startQuizFromJob(job)}
                    style={{
                      filter: "url(#glass-effect)",
                    }}
                  >
                    {/* Job Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1 line-clamp-1 text-lg">
                            {job.analysis?.jobTitle || 'Job Position'}
                          </h4>
                          <p className="text-white/70 text-sm font-light">
                            {job.analysis?.company || 'Company'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                          <Target className="w-3 h-3 text-white/70" />
                          <span className="text-white/90 text-xs font-light">{job.skills?.length || 0} skills</span>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                        {job.analysis?.salary && (
                          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                            <DollarSign size={14} className="text-green-400" />
                            <span className="text-green-300 text-xs font-light">{job.analysis.salary}</span>
                          </span>
                        )}
                        {job.analysis?.location && (
                          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30">
                            <MapPin size={14} className="text-blue-400" />
                            <span className="text-blue-300 text-xs font-light">{job.analysis.location}</span>
                          </span>
                        )}
                        {job.analysis?.remote && (
                          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30">
                            <HomeIcon size={14} className="text-purple-400" />
                            <span className="text-purple-300 text-xs font-light">Remote</span>
                          </span>
                        )}
                        {job.analysis?.employmentType && (
                          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                            <Briefcase size={14} className="text-indigo-400" />
                            <span className="text-indigo-300 text-xs font-light">{job.analysis.employmentType}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skills Preview */}
                    {(job.skills || []).length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {(job.skills || []).slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/20 font-light"
                            >
                              {skill}
                            </span>
                          ))}
                          {(job.skills || []).length > 4 && (
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs border border-white/30 font-light">
                              +{(job.skills || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          startQuizFromJob(job);
                        }}
                        className="flex-1 group flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-black font-normal text-xs shadow-lg transition-all duration-200 hover:bg-white/90"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Target className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Start Learning
                      </motion.button>
                      <motion.a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 rounded-full bg-transparent border border-white/30 text-white/90 hover:bg-white/10 hover:border-white/50 transition-all duration-200 flex items-center justify-center font-light text-xs"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    </div>

                    {/* Agent Thinking Section */}
                    {job.thinking && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button
                          onClick={() => toggleThinking(job.id)}
                          className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>AI Analysis</span>
                          <span className="text-xs ml-auto">
                            {expandedThinking === job.id ? '−' : '+'}
                          </span>
        </button>

                        <AnimatePresence>
                          {expandedThinking === job.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                            >
                              <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {job.thinking}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
}
