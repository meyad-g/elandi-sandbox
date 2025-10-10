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
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/Button';

export type StudyMode = 'prep' | 'efficient' | 'mock';

interface StudyModeSelectorProps {
  onModeSelect: (mode: StudyMode) => void;
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
  isRecommended?: boolean;
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
  previousAttempts,
  isRecommended
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <motion.div
      className="relative bg-slate-800/40 border border-slate-600/30 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-slate-500/50 hover:bg-slate-800/60"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
    >

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            <p className="text-white/60 text-sm">{subtitle}</p>
          </div>
        </div>
        
        {/* Previous Attempts */}
        {previousAttempts && previousAttempts.sessions > 0 && (
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
        )}
      </div>

      {/* Description */}
      <p className="text-white/75 text-sm leading-relaxed mb-4">{description}</p>

      {/* Features */}
      <div className="space-y-2 mb-5">
        {features.slice(0, 3).map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full flex-shrink-0" />
            <span className="text-white/80 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/50" />
            <span className="text-white/80 text-xs">{timeEstimate}</span>
          </div>
          <span className="text-white/50 text-xs">•</span>
          <span className="text-white/60 text-xs">{difficulty}</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="primary"
        className="w-full bg-white/10 hover:bg-white/15 border-white/20 text-white text-sm"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {mode === 'prep' ? 'Start Practice' : 
         mode === 'efficient' ? 'Begin Assessment' : 
         'Start Simulation'}
      </Button>
    </motion.div>
  );
};

export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  onModeSelect,
  previousAttempts
}) => {
  const modes = [
    {
      mode: 'prep' as StudyMode,
      title: 'Prep Mode',
      subtitle: 'Unlimited Practice',
      description: 'Perfect for building foundational knowledge and practicing specific topics. Study at your own pace with instant feedback and comprehensive explanations.',
      features: [
        'Infinite questions across all topics',
        'Interactive flashcards with spaced repetition',
        'No time pressure - learn thoroughly',
        'Detailed explanations for every answer',
        'Switch between topics anytime'
      ],
      icon: <Target className="w-6 h-6 text-white" />,
      color: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/20 to-cyan-600/20',
      timeEstimate: 'Flexible',
      difficulty: 'Beginner' as const,
      isRecommended: false
    },
    {
      mode: 'efficient' as StudyMode,
      title: 'Efficient Exam',
      subtitle: 'Smart Assessment',
      description: 'Get a reliable prediction of your exam performance with just 30% of the questions. Our AI algorithm focuses on the most diagnostic questions.',
      features: [
        '54 strategically selected questions',
        'Covers all CFA Level I topics proportionally',
        'Real-time score prediction with confidence intervals',
        'Pace guidance and performance analytics',
        'Identify weak areas quickly'
      ],
      icon: <Zap className="w-6 h-6 text-white" />,
      color: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-500/20 to-orange-600/20',
      timeEstimate: '~90 minutes',
      difficulty: 'Intermediate' as const,
      isRecommended: false
    },
    {
      mode: 'mock' as StudyMode,
      title: 'Mock Exam',
      subtitle: 'Full Simulation',
      description: 'Experience the complete CFA Level I exam with 180 questions under strict time constraints. Perfect final preparation before the real exam.',
      features: [
        'Full 180-question exam simulation',
        'Strict 4.5-hour time limit (270 minutes)',
        'Two-session format with break timer',
        'Realistic exam interface and conditions',
        'Comprehensive performance analysis'
      ],
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-500/20 to-pink-600/20',
      timeEstimate: '4.5 hours',
      difficulty: 'Advanced' as const,
      isRecommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-semibold text-white mb-3">Select Study Mode</h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Choose the approach that best fits your preparation stage and available time.
          </p>
        </motion.div>

        {/* Mode Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
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
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Your Progress Overview</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(previousAttempts).map(([mode, data]) => {
                if (!data || data.sessions === 0) return null;
                return (
                  <div key={mode} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/90 font-medium capitalize">{mode} Mode</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {data.sessions} session{data.sessions > 1 ? 's' : ''}
                    </div>
                    {data.avgScore && (
                      <div className="text-white/60 text-sm">
                        Average Score: {Math.round(data.avgScore)}%
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
