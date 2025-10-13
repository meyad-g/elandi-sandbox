'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Zap, 
  FileText, 
  Clock, 
  Trophy, 
  TrendingUp,
  BookOpen,
  Timer,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/Button';

export type StudyMode = 'prep' | 'efficient' | 'mock';

interface StudyModeSelectorProps {
  onModeSelect: (mode: StudyMode) => void;
  onBack?: () => void;
  previousAttempts?: {
    prep?: { sessions: number; avgScore?: number };
    efficient?: { sessions: number; avgScore?: number; predictedScore?: number };
    mock?: { sessions: number; avgScore?: number; passed?: boolean };
  };
}

interface ModeCardProps {
  mode: StudyMode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  timeEstimate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  onSelect: () => void;
  previousAttempts?: { sessions: number; avgScore?: number; predictedScore?: number; passed?: boolean };
}

const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  title,
  subtitle,
  description,
  features,
  icon,
  color,
  bgGradient,
  timeEstimate,
  difficulty,
  onSelect,
  previousAttempts
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'Intermediate': return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'Advanced': return 'bg-red-500/20 text-red-300 border border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
    }
  };

  const getModeIndex = () => {
    switch (mode) {
      case 'prep': return 1;
      case 'efficient': return 2;
      case 'mock': return 3;
      default: return 1;
    }
  };

  return (
    <motion.div
      className="group relative bg-black/60 backdrop-blur-xl border border-white/30 hover:border-cyan-400/60 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Hover gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-white font-bold`}>
              {getModeIndex()}
            </div>
          </div>
          
          {/* Previous Attempts or Award Icon */}
          {previousAttempts && previousAttempts.sessions > 0 ? (
            <div className="text-right">
              <div className="text-white/90 text-sm font-medium">
                {previousAttempts.sessions} attempt{previousAttempts.sessions > 1 ? 's' : ''}
              </div>
              {previousAttempts.avgScore && (
                <div className="text-white/60 text-xs">
                  Avg: {Math.round(previousAttempts.avgScore)}%
                </div>
              )}
              {previousAttempts.predictedScore && (
                <div className="text-cyan-400 text-xs">
                  Predicted: {Math.round(previousAttempts.predictedScore)}%
                </div>
              )}
              {previousAttempts.passed !== undefined && (
                <div className={`text-xs ${previousAttempts.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {previousAttempts.passed ? 'Passed' : 'Need Improvement'}
                </div>
              )}
            </div>
          ) : (
            <Trophy className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/60 text-sm mb-3">{subtitle}</p>
          <p className="text-white/70 text-sm mb-4 leading-relaxed">{description}</p>
          
          {/* Difficulty badge */}
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
            <Target className="w-3 h-3" />
            {difficulty}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="text-white/80 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs">Duration</span>
            </div>
            <div className="text-white font-semibold text-sm">{timeEstimate}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs">Focus</span>
            </div>
            <div className="text-white font-semibold text-sm">
              {mode === 'prep' ? 'Practice' : mode === 'efficient' ? 'Assessment' : 'Simulation'}
            </div>
          </div>
        </div>

        {/* Action */}
        <motion.div
          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors"
          animate={{ 
            scale: isHovered ? 1.02 : 1,
            backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
          }}
        >
          <span className="text-white font-medium text-sm">
            {mode === 'prep' ? 'Start Practice' : 
             mode === 'efficient' ? 'Begin Assessment' : 
             'Start Simulation'}
          </span>
          <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  onModeSelect,
  onBack,
  previousAttempts
}) => {
  const modes = [
    {
      mode: 'prep' as StudyMode,
      title: 'Practice Mode',
      subtitle: 'Build Strong Foundations',
      description: 'Master concepts at your own pace with unlimited practice questions and adaptive learning. Perfect for building confidence and deep understanding.',
      features: [
        'Unlimited questions across all topics',
        'Interactive flashcards with spaced repetition',
        'Personalized learning paths',
        'Detailed explanations and references',
        'Progress tracking and weak area identification',
        'No time constraints - focus on learning'
      ],
      icon: <Target className="w-6 h-6 text-white" />,
      color: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/20 to-teal-600/20',
      timeEstimate: 'Self-paced',
      difficulty: 'Beginner' as const
    },
    {
      mode: 'efficient' as StudyMode,
      title: 'Smart Assessment',
      subtitle: 'AI-Powered Evaluation',
      description: 'Get an accurate prediction of your exam readiness with our intelligent adaptive testing. Covers all topics with maximum efficiency.',
      features: [
        '50-60 AI-selected diagnostic questions',
        'Real-time performance prediction',
        'Adaptive difficulty based on responses',
        'Comprehensive topic coverage analysis',
        'Confidence intervals and success probability',
        'Personalized study recommendations'
      ],
      icon: <Zap className="w-6 h-6 text-white" />,
      color: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/20 to-orange-600/20',
      timeEstimate: '75-90 min',
      difficulty: 'Intermediate' as const
    },
    {
      mode: 'mock' as StudyMode,
      title: 'Full Mock Exam',
      subtitle: 'Complete Simulation',
      description: 'Experience the authentic exam environment with full-length practice tests. Build stamina and test-day confidence under real conditions.',
      features: [
        'Complete 180-question exam simulation',
        'Authentic 4.5-hour time constraint',
        'Two-session format with scheduled break',
        'Real exam interface and navigation',
        'Detailed performance breakdown',
        'Pass/fail prediction with analysis'
      ],
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-500/20 to-pink-600/20',
      timeEstimate: '4.5 hours',
      difficulty: 'Advanced' as const
    }
  ];

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {onBack && (
            <motion.button
              className="flex items-center gap-2 text-white/70 hover:text-white group"
              onClick={onBack}
              whileHover={{ x: -5 }}
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back
            </motion.button>
          )}
          <motion.div
            className="text-center flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-white">
                Choose Your <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Study Mode</span>
              </h1>
            </div>
            <p className="text-base text-white/70 max-w-2xl mx-auto">
              Select the approach that best matches your preparation stage and available time. Each mode is designed to optimize your learning experience.
            </p>
          </motion.div>
        </div>

        {/* Mode Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modes.map((modeConfig, index) => (
            <ModeCard
              key={modeConfig.mode}
              {...modeConfig}
              onSelect={() => onModeSelect(modeConfig.mode)}
              previousAttempts={previousAttempts?.[modeConfig.mode]}
            />
          ))}
        </div>

        {/* Progress Overview */}
        {previousAttempts && (
          <motion.div
            className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Your Learning Progress</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(previousAttempts).map(([mode, data]) => {
                if (!data || data.sessions === 0) return null;
                return (
                  <div key={mode} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/90 font-medium capitalize">{mode} Mode</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {data.sessions} session{data.sessions > 1 ? 's' : ''}
                    </div>
                    {data.avgScore && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/60 text-sm">Average Score</span>
                        <span className="text-cyan-400 font-semibold">{Math.round(data.avgScore)}%</span>
                      </div>
                    )}
                    {'predictedScore' in data && data.predictedScore && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/60 text-sm">Predicted Score</span>
                        <span className="text-emerald-400 font-semibold">{Math.round(data.predictedScore)}%</span>
                      </div>
                    )}
                    {'passed' in data && data.passed !== undefined && (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        data.passed ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'
                      }`}>
                        {data.passed ? 'Passed' : 'Need Improvement'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
