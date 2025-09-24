'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Job {
  id: string;
  url: string;
  skills: string[];
  analysis?: {
    jobTitle: string;
    company?: string;
    location?: string;
    salary?: string;
    experienceLevel?: string;
  };
  interviewStructure?: {
    company: string;
    role: string;
    totalProcess: string;
    stages: Array<{
      id: string;
      name: string;
      description: string;
      duration: string;
      focus: string[];
      questionTypes: string[];
      tips: string[];
    }>;
    preparationTips: string[];
    commonTopics: string[];
  };
  thinking?: string;
}

export default function JobOverviewPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  // Load job data from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('elandi-jobs');
    if (savedJobs) {
      try {
        const jobs: Job[] = JSON.parse(savedJobs);
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
          console.log('📋 Loaded job from localStorage:', foundJob);
          console.log('📋 Interview structure:', foundJob.interviewStructure?.stages?.length || 0, 'stages');
          setJob(foundJob);
        } else {
          console.log('❌ Job not found in localStorage, jobId:', jobId);
          console.log('❌ Available jobs:', jobs.map(j => ({ id: j.id, company: j.analysis?.company })));
        }
      } catch (error) {
        console.error('Error loading job:', error);
      }
    } else {
      console.log('❌ No saved jobs found in localStorage');
    }
    setLoading(false);
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading interview overview...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-white mb-4">Job Not Found</h2>
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'Hard':
        return 'text-red-400 bg-red-500/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {(job.analysis?.company || job.interviewStructure?.company || 'C')[0]}
              </span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
                {job.analysis?.jobTitle || job.interviewStructure?.role || 'Job Position'}
              </h1>
              <p className="text-xl font-light text-cyan-300 mb-4">
                {job.analysis?.company || job.interviewStructure?.company || 'Company'}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {job.analysis?.location && (
                  <>
                    <span>{job.analysis.location}</span>
                    <span>•</span>
                  </>
                )}
                {job.analysis?.salary && (
                  <>
                    <span>{job.analysis.salary}</span>
                    <span>•</span>
                  </>
                )}
                <span>{job.interviewStructure?.totalProcess || 'Multiple interview stages'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Process Overview */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/30 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-light text-white mb-4">Interview Process Overview</h2>
          <p className="text-white/80 font-light mb-6">
            {job.interviewStructure?.totalProcess || 'Structured interview process with multiple stages'}
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-white/60">Progress:</span>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <span className="text-sm text-white/60">0/{job.interviewStructure?.stages.length || 0} stages</span>
          </div>
        </motion.div>

        {/* Debug Info */}
        {!job.interviewStructure && (
          <motion.div
            className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-yellow-300 font-medium mb-2">Interview Structure Missing</h3>
            <p className="text-yellow-200 text-sm mb-4">The interview structure hasn&apos;t been generated yet.</p>
            <button
              onClick={async () => {
                console.log('🔧 Manually triggering interview structure analysis...');
                try {
                  const response = await fetch('/api/analyze-interview-structure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      jobAnalysis: job.analysis,
                      company: job.analysis?.company,
                      role: job.analysis?.jobTitle
                    }),
                  });
                  
                  if (response.ok) {
                    const interviewStructure = await response.json();
                    console.log('📋 Got interview structure:', interviewStructure);
                    
                    // Update localStorage and state
                    const savedJobs = localStorage.getItem('elandi-jobs');
                    if (savedJobs) {
                      const jobs = JSON.parse(savedJobs);
                      const updatedJobs = jobs.map((j: Job) => 
                        j.id === job.id ? { ...j, interviewStructure } : j
                      );
                      localStorage.setItem('elandi-jobs', JSON.stringify(updatedJobs));
                      setJob(prev => prev ? { ...prev, interviewStructure } : null);
                    }
                  }
                } catch (error) {
                  console.error('Error generating interview structure:', error);
                }
              }}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Generate Interview Structure
            </button>
          </motion.div>
        )}

        {/* Interview Stages */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto mb-8">
          {(job.interviewStructure?.stages || []).map((stage, index) => {
            console.log('🎯 Rendering stage:', stage.id, stage.name);
            return (
              <motion.div
                key={stage.id}
                className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/40 hover:border-cyan-400/60 transition-all duration-300 p-6 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
              {/* Stage Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">{stage.name}</h3>
                  <p className="text-white/70 text-sm font-light mb-3">{stage.description}</p>
                  <p className="text-cyan-400 text-xs font-light">{stage.duration}</p>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white/90 mb-2">Focus Areas:</h4>
                <div className="flex flex-wrap gap-2">
                  {stage.focus.map((area, i) => (
                    <span key={i} className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white/90 mb-2">Question Types:</h4>
                <div className="flex flex-wrap gap-2">
                  {stage.questionTypes.map((type, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link 
                href={`/prep/${jobId}/${stage.id}`}
                className="block w-full"
                onClick={() => {
                  console.log('🚀 Clicking stage:', stage.id, 'navigating to:', `/prep/${jobId}/${stage.id}`);
                }}
              >
                <motion.button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-all duration-200 group-hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-4 h-4" />
                  Start Preparation
                </motion.button>
              </Link>
            </motion.div>
            );
          })}
        </div>

        {/* Preparation Tips */}
        <motion.div
          className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/30 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl font-light text-white mb-6">General Preparation Tips</h2>
          <div className="space-y-4">
            {(job.interviewStructure?.preparationTips || []).map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80 font-light leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
