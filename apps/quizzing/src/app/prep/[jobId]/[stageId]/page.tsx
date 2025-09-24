'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  MessageSquare, 
  Target, 
  PlayCircle,
  Clock,
  Lightbulb,
  Users,
  Code,
  Settings,
  TrendingUp
} from 'lucide-react';

import { CompanyResearchContent } from '@/components/prep/CompanyResearchContent';
import { TechnicalContent } from '@/components/prep/TechnicalContent';
import { BehavioralContent } from '@/components/prep/BehavioralContent';

// Stage-specific configurations
const getStageConfig = (stageId: string) => {
  console.log('🎯 Getting stage config for stageId:', stageId);
  
  const configs = {
    screening: {
      name: 'Initial Screening',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-600',
      description: 'Phone/video call with recruiter to assess basic fit',
      focus: 'Company knowledge, role understanding, and background review',
      prepTypes: [
        { id: 'company-research', name: 'Company Research', icon: BookOpen },
        { id: 'role-questions', name: 'Role Questions', icon: Target },
        { id: 'mock-screening', name: 'Mock Screening', icon: MessageSquare }
      ]
    },
    technical: {
      name: 'Technical Interview',
      icon: Code,
      color: 'from-blue-500 to-cyan-600',
      description: 'Live coding session with senior engineers',
      focus: 'Data structures, algorithms, and problem-solving skills',
      prepTypes: [
        { id: 'coding-practice', name: 'Coding Practice', icon: Code },
        { id: 'algorithms', name: 'Algorithms', icon: Target },
        { id: 'mock-technical', name: 'Mock Interview', icon: PlayCircle }
      ]
    },
    behavioral: {
      name: 'Behavioral Interview',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      description: 'Discussion of past experiences and cultural fit',
      focus: 'STAR stories, leadership examples, and company values alignment',
      prepTypes: [
        { id: 'star-stories', name: 'STAR Stories', icon: BookOpen },
        { id: 'company-values', name: 'Company Values', icon: Target },
        { id: 'mock-behavioral', name: 'Mock Interview', icon: Users }
      ]
    },
    'system-design': {
      name: 'System Design',
      icon: Settings,
      color: 'from-orange-500 to-red-600',
      description: 'Design scalable systems and discuss architecture',
      focus: 'Architecture patterns, scalability, and trade-off discussions',
      prepTypes: [
        { id: 'design-patterns', name: 'Design Patterns', icon: Settings },
        { id: 'scalability', name: 'Scalability', icon: TrendingUp },
        { id: 'mock-design', name: 'Mock Design', icon: PlayCircle }
      ]
    },
    final: {
      name: 'Final Round',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-600',
      description: 'Meet with senior leadership and strategic discussion',
      focus: 'Strategic thinking, culture fit, and long-term vision',
      prepTypes: [
        { id: 'strategic-thinking', name: 'Strategic Thinking', icon: Lightbulb },
        { id: 'culture-fit', name: 'Culture Fit', icon: Users },
        { id: 'mock-final', name: 'Mock Interview', icon: TrendingUp }
      ]
    }
  };
  
  // Smart matching for stage IDs that might not be exact
  const stageIdLower = stageId.toLowerCase();
  
  // Try exact match first
  if (configs[stageId as keyof typeof configs]) {
    console.log('✅ Exact match found for:', stageId);
    return configs[stageId as keyof typeof configs];
  }
  
  // Try fuzzy matching
  if (stageIdLower.includes('screen') || stageIdLower.includes('initial')) {
    console.log('✅ Matched screening for:', stageId);
    return configs.screening;
  } else if (stageIdLower.includes('technical') || stageIdLower.includes('coding')) {
    console.log('✅ Matched technical for:', stageId);
    return configs.technical;
  } else if (stageIdLower.includes('behavioral') || stageIdLower.includes('culture')) {
    console.log('✅ Matched behavioral for:', stageId);
    return configs.behavioral;
  } else if (stageIdLower.includes('system') || stageIdLower.includes('design') || stageIdLower.includes('architecture')) {
    console.log('✅ Matched system-design for:', stageId);
    return configs['system-design'];
  } else if (stageIdLower.includes('final') || stageIdLower.includes('last') || stageIdLower.includes('onsite')) {
    console.log('✅ Matched final for:', stageId);
    return configs.final;
  }
  
  // Default fallback with warning
  console.warn('⚠️ No match found for stageId:', stageId, '- defaulting to technical');
  return configs.technical;
};

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
    industry?: string;
  };
}

export default function StagePreparationPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const stageId = params.stageId as string;
  
  console.log('🎭 StagePreparationPage loaded with:', { jobId, stageId });
  
  // All hooks must be at the top
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('company-research'); // Default tab
  const [progress] = useState({
    flashcardsCompleted: 0,
    questionsCompleted: 0,
    totalTime: 0
  });

  // Load job data from localStorage
  useEffect(() => {
    console.log('🔍 Loading job from localStorage for:', { jobId, stageId });
    
    const savedJobs = localStorage.getItem('elandi-jobs');
    if (savedJobs) {
      try {
        const jobs: Job[] = JSON.parse(savedJobs);
        console.log('📋 Available jobs:', jobs.map(j => ({ id: j.id, company: j.analysis?.company })));
        
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
          console.log('✅ Found job:', foundJob.analysis?.company, foundJob.analysis?.jobTitle);
          setJob(foundJob);
          
          // Set default tab based on stage
          const stageConfig = getStageConfig(stageId);
          console.log('🎯 Stage config selected:', stageConfig.name);
          setActiveTab(stageConfig.prepTypes[0].id);
        } else {
          console.error('❌ Job not found with ID:', jobId);
        }
      } catch (error) {
        console.error('Error loading job:', error);
      }
    } else {
      console.error('❌ No saved jobs found in localStorage');
    }
    setLoading(false);
  }, [jobId, stageId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading preparation content...</p>
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

  const stageConfig = getStageConfig(stageId);
  const StageIcon = stageConfig.icon;

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
            href={`/prep/${jobId}/overview`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stageConfig.color} flex items-center justify-center`}>
              <StageIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
                {stageConfig.name}
              </h1>
              <p className="text-xl font-light text-cyan-300 mb-4">
                {job.analysis?.company || 'Company'} • {job.analysis?.jobTitle || 'Role'}
              </p>
              <p className="text-white/70 font-light leading-relaxed max-w-2xl">
                {stageConfig.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stage Focus & Progress */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Focus Areas
            </h3>
            <p className="text-white/80 font-light leading-relaxed">
              {stageConfig.focus}
            </p>
          </motion.div>

          <motion.div
            className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Your Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Concepts learned</span>
                <span className="text-cyan-300 font-medium">{progress.flashcardsCompleted}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Questions practiced</span>
                <span className="text-cyan-300 font-medium">{progress.questionsCompleted}/15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Time spent</span>
                <span className="text-cyan-300 font-medium">{progress.totalTime} min</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Preparation Tabs */}
        <motion.div
          className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/40 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-black/50 rounded-xl">
            {stageConfig.prepTypes.map((prepType) => {
              const PrepIcon = prepType.icon;
              return (
                <button
                  key={prepType.id}
                  onClick={() => setActiveTab(prepType.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === prepType.id
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <PrepIcon className="w-4 h-4" />
                  {prepType.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent(activeTab, job)}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
            <PlayCircle className="w-5 h-5" />
            Start Mock Interview
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
            <Target className="w-5 h-5" />
            Quick Practice
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors">
            <BookOpen className="w-5 h-5" />
            Study Guide
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Render different content based on the active tab and stage
function renderTabContent(activeTab: string, job: Job) {
  const level = job.analysis?.experienceLevel?.toLowerCase() || 'mid';
  const company = job.analysis?.company || 'Company';
  const role = job.analysis?.jobTitle || 'Role';

  switch (activeTab) {
    case 'company-research':
      return <CompanyResearchContent company={company} role={role} />;
      
    case 'coding-practice':
      return (
        <TechnicalContent 
          company={company} 
          role={role} 
          level={level}
          contentType="coding" 
        />
      );
      
    case 'algorithms':
      return (
        <TechnicalContent 
          company={company} 
          role={role} 
          level={level}
          contentType="algorithms" 
        />
      );
      
    case 'design-patterns':
    case 'scalability':
      return (
        <TechnicalContent 
          company={company} 
          role={role} 
          level={level}
          contentType="system-design" 
        />
      );
      
    case 'star-stories':
    case 'company-values':
      return <BehavioralContent company={company} role={role} />;
      
    case 'role-questions':
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-light text-white">Role-Specific Questions</h3>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">Common {role} Questions at {company}</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-white/90 mb-2">&quot;Why do you want to work at {company} specifically?&quot;</p>
                <p className="text-white/70 text-sm">Research company mission, recent projects, and values alignment</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-white/90 mb-2">&quot;What interests you about the {role} role?&quot;</p>
                <p className="text-white/70 text-sm">Connect your experience to role responsibilities</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <p className="text-white/90 mb-2">&quot;How do you stay current with industry trends?&quot;</p>
                <p className="text-white/70 text-sm">Show continuous learning and passion for the field</p>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-cyan-400" />
          </div>
          <h4 className="text-xl font-light text-white mb-2">
            Coming Soon
          </h4>
          <p className="text-white/70">
            This preparation module is being built with AI-powered, company-specific content.
          </p>
        </div>
      );
  }
}
