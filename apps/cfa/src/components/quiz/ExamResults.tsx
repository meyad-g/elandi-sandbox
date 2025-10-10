'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Brain,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Home,
  Star,
  Award,
  Zap,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StudySession, ObjectiveProgress } from '@/lib/studySession';
import { ExamProfile } from '@/lib/certifications';

interface ExamResultsProps {
  studySession: StudySession;
  examProfile: ExamProfile;
  onRetry?: () => void;
  onBackToMenu?: () => void;
  onContinueStudy?: () => void;
  onTakeNextMode?: (mode: 'prep' | 'efficient' | 'mock') => void;
}

interface ObjectiveAnalysis {
  objectiveId: string;
  title: string;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  masteryLevel: 'novice' | 'developing' | 'proficient' | 'mastery';
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface ModeSpecificAnalytics {
  overallScore: number;
  passingScore: number;
  passed: boolean;
  strengths: string[];
  weaknesses: string[];
  timeAnalysis: {
    totalTime: number;
    averagePerQuestion: number;
    efficiency: 'fast' | 'optimal' | 'slow';
  };
  predictions?: {
    fullExamScore: number;
    confidence: number;
    passLikelihood: number;
  };
  recommendations: Array<{
    type: 'continue' | 'focus' | 'ready' | 'retry';
    message: string;
    priority: 'high' | 'medium' | 'low';
    action?: string;
  }>;
}

const ModeIcon: React.FC<{ mode: 'prep' | 'efficient' | 'mock' }> = ({ mode }) => {
  switch (mode) {
    case 'prep': return <Target className="w-6 h-6" />;
    case 'efficient': return <Zap className="w-6 h-6" />;
    case 'mock': return <FileText className="w-6 h-6" />;
  }
};

const ScoreDisplay: React.FC<{
  score: number;
  passed: boolean;
  mode: 'prep' | 'efficient' | 'mock';
  predictions?: { fullExamScore: number; confidence: number; passLikelihood: number };
}> = ({ score, passed, mode, predictions }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 70) return 'from-yellow-400 to-orange-500'; 
    if (score >= 60) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <motion.div
      className="text-center mb-8"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Main score circle */}
      <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColor(score)} flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
        <div className="text-white text-center">
          <div className="text-3xl font-bold">{score.toFixed(0)}%</div>
          <div className="text-sm opacity-90">
            {mode === 'prep' ? 'Progress' : mode === 'efficient' ? 'Current' : 'Final'}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        passed ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'
      } mb-4`}>
        {passed ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
        <span className={`font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? 'Passing Score!' : 'Below Passing'}
        </span>
      </div>

      {/* Predictions for efficient mode */}
      {mode === 'efficient' && predictions && (
        <div className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">Full Exam Prediction</h3>
          <div className="text-2xl font-bold text-purple-400 mb-2">
            {predictions.fullExamScore.toFixed(0)}%
          </div>
          <div className="text-sm text-white/70 mb-2">
            Confidence: {(predictions.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-white/70">
            Pass Likelihood: {(predictions.passLikelihood * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ObjectiveBreakdown: React.FC<{ objectives: ObjectiveAnalysis[] }> = ({ objectives }) => {
  const [showAll, setShowAll] = useState(false);
  const displayObjectives = showAll ? objectives : objectives.slice(0, 6);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Topic Performance</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {displayObjectives.map((obj, index) => (
          <motion.div
            key={obj.objectiveId}
            className={`bg-white/5 border border-white/10 rounded-xl p-4 ${
              obj.priority === 'high' ? 'border-red-400/30 bg-red-500/10' :
              obj.priority === 'medium' ? 'border-yellow-400/30 bg-yellow-500/10' :
              'border-green-400/30 bg-green-500/10'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium text-sm leading-tight">{obj.title}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                obj.accuracy >= 80 ? 'bg-green-500/20 text-green-400' :
                obj.accuracy >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {obj.accuracy.toFixed(0)}%
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span>{obj.questionsAttempted} questions</span>
              <span>{obj.averageTime.toFixed(0)}s avg</span>
            </div>
            
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className={`h-full rounded-full ${
                  obj.accuracy >= 80 ? 'bg-green-400' :
                  obj.accuracy >= 70 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${obj.accuracy}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
            
            <p className="text-xs text-white/70 leading-tight">{obj.recommendation}</p>
          </motion.div>
        ))}
      </div>

      {objectives.length > 6 && (
        <div className="text-center">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            size="small"
            className="border-white/20 text-white"
          >
            {showAll ? 'Show Less' : `Show All ${objectives.length} Topics`}
          </Button>
        </div>
      )}
    </div>
  );
};

const RecommendationsPanel: React.FC<{ 
  analytics: ModeSpecificAnalytics;
  mode: 'prep' | 'efficient' | 'mock';
  onTakeNextMode?: (mode: 'prep' | 'efficient' | 'mock') => void;
}> = ({ analytics, mode, onTakeNextMode }) => {
  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Personalized Recommendations</h3>
      </div>

      <div className="space-y-4">
        {analytics.recommendations.map((rec, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-xl border ${
              rec.priority === 'high' ? 'bg-red-500/10 border-red-400/30' :
              rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-400/30' :
              'bg-green-500/10 border-green-400/30'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                rec.priority === 'high' ? 'bg-red-400' :
                rec.priority === 'medium' ? 'bg-yellow-400' :
                'bg-green-400'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm leading-relaxed">{rec.message}</p>
                {rec.action && onTakeNextMode && (
                  <Button
                    onClick={() => {
                      const nextMode = rec.action === 'mock' ? 'mock' : 
                                     rec.action === 'efficient' ? 'efficient' : 'prep';
                      onTakeNextMode(nextMode);
                    }}
                    variant="outline"
                    size="small"
                    className="mt-3 text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/20"
                  >
                    {rec.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DetailedAnalytics: React.FC<{ 
  analytics: ModeSpecificAnalytics;
  objectives: ObjectiveAnalysis[];
}> = ({ analytics, objectives }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Overall Performance */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="font-bold text-white">Overall Performance</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/70">Accuracy</span>
            <span className="text-white font-medium">{analytics.overallScore.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Status</span>
            <span className={`font-medium ${analytics.passed ? 'text-green-400' : 'text-red-400'}`}>
              {analytics.passed ? 'Passed' : 'Below Passing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Time Efficiency</span>
            <span className={`font-medium capitalize ${
              analytics.timeAnalysis.efficiency === 'optimal' ? 'text-green-400' :
              analytics.timeAnalysis.efficiency === 'fast' ? 'text-blue-400' :
              'text-yellow-400'
            }`}>
              {analytics.timeAnalysis.efficiency}
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <h3 className="font-bold text-white">Strengths</h3>
        </div>
        
        <div className="space-y-2">
          {analytics.strengths.length > 0 ? analytics.strengths.map((strength, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/90 text-sm capitalize">{strength.replace(/-/g, ' ')}</span>
            </div>
          )) : (
            <p className="text-white/50 text-sm">No clear strengths identified yet. Keep practicing!</p>
          )}
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="font-bold text-white">Focus Areas</h3>
        </div>
        
        <div className="space-y-2">
          {analytics.weaknesses.length > 0 ? analytics.weaknesses.map((weakness, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-white/90 text-sm capitalize">{weakness.replace(/-/g, ' ')}</span>
            </div>
          )) : (
            <p className="text-white/50 text-sm">Great! No major weak areas identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ExamResults: React.FC<ExamResultsProps> = ({
  studySession,
  examProfile,
  onRetry,
  onBackToMenu,
  onContinueStudy,
  onTakeNextMode
}) => {
  // Calculate objective analyses
  const objectiveAnalyses = useMemo((): ObjectiveAnalysis[] => {
    return studySession.objectives
      .filter(obj => obj.questionsAttempted > 0)
      .map(obj => {
        const profileObj = examProfile.objectives.find(po => po.id === obj.objectiveId);
        const accuracy = (obj.questionsCorrect / obj.questionsAttempted) * 100;
        const averageTime = obj.totalTimeSpent / obj.questionsAttempted;

        // Simple trend analysis
        const recentAttempts = obj.attempts.slice(-3);
        const olderAttempts = obj.attempts.slice(0, -3);
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        
        if (recentAttempts.length >= 2 && olderAttempts.length >= 2) {
          const recentAvg = recentAttempts.reduce((sum, att) => sum + (att.correct ? 1 : 0), 0) / recentAttempts.length;
          const olderAvg = olderAttempts.reduce((sum, att) => sum + (att.correct ? 1 : 0), 0) / olderAttempts.length;
          
          if (recentAvg > olderAvg + 0.1) trend = 'improving';
          else if (recentAvg < olderAvg - 0.1) trend = 'declining';
        }

        // Generate recommendation
        let recommendation = '';
        let priority: 'high' | 'medium' | 'low' = 'low';

        if (accuracy < 60) {
          recommendation = 'Requires significant additional study and practice';
          priority = 'high';
        } else if (accuracy < 70) {
          recommendation = 'Good foundation, focus on challenging concepts';
          priority = 'medium';
        } else if (accuracy < 85) {
          recommendation = 'Strong performance, minor refinements needed';
          priority = 'low';
        } else {
          recommendation = 'Excellent mastery of this topic';
          priority = 'low';
        }

        return {
          objectiveId: obj.objectiveId,
          title: profileObj?.title || obj.objectiveId,
          questionsAttempted: obj.questionsAttempted,
          correctAnswers: obj.questionsCorrect,
          accuracy,
          averageTime,
          masteryLevel: obj.masteryLevel,
          trend,
          recommendation,
          priority
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.accuracy - b.accuracy; // Lowest scores first within same priority
      });
  }, [studySession.objectives, examProfile.objectives]);

  // Calculate mode-specific analytics
  const analytics = useMemo((): ModeSpecificAnalytics => {
    const overallScore = studySession.totalQuestionsAnswered > 0 
      ? (studySession.totalCorrectAnswers / studySession.totalQuestionsAnswered) * 100
      : 0;
    
    const passingScore = 70; // CFA passing threshold
    const passed = overallScore >= passingScore;
    
    // Identify strengths and weaknesses
    const strengths = objectiveAnalyses
      .filter(obj => obj.accuracy >= 75)
      .slice(0, 3)
      .map(obj => obj.objectiveId);
    
    const weaknesses = objectiveAnalyses
      .filter(obj => obj.accuracy < 65)
      .slice(0, 3)
      .map(obj => obj.objectiveId);

    // Time analysis
    const totalTime = studySession.objectives.reduce((sum, obj) => sum + obj.totalTimeSpent, 0);
    const averagePerQuestion = studySession.totalQuestionsAnswered > 0 
      ? totalTime / studySession.totalQuestionsAnswered 
      : 0;
    
    let efficiency: 'fast' | 'optimal' | 'slow' = 'optimal';
    if (averagePerQuestion < 60) efficiency = 'fast';
    else if (averagePerQuestion > 120) efficiency = 'slow';

    // Generate recommendations based on mode
    const recommendations = [];

    if (studySession.examMode === 'prep') {
      if (overallScore >= 75) {
        recommendations.push({
          type: 'ready' as const,
          message: 'You\'re performing well! Consider taking an efficient assessment to gauge exam readiness.',
          priority: 'medium' as const,
          action: 'efficient'
        });
      } else if (overallScore >= 60) {
        recommendations.push({
          type: 'focus' as const,
          message: 'Good foundation. Focus additional practice on weak areas before assessment.',
          priority: 'high' as const
        });
      } else {
        recommendations.push({
          type: 'continue' as const,
          message: 'Continue building fundamental knowledge across all topics.',
          priority: 'high' as const
        });
      }
    } else if (studySession.examMode === 'efficient') {
      if (overallScore >= 70) {
        recommendations.push({
          type: 'ready' as const,
          message: 'Strong performance! You appear ready for a full mock exam.',
          priority: 'high' as const,
          action: 'mock'
        });
      } else {
        recommendations.push({
          type: 'focus' as const,
          message: 'More preparation needed. Focus on identified weak areas.',
          priority: 'high' as const,
          action: 'prep'
        });
      }
    } else if (studySession.examMode === 'mock') {
      if (passed) {
        recommendations.push({
          type: 'ready' as const,
          message: 'Excellent! You\'re well-prepared for the actual CFA Level I exam.',
          priority: 'high' as const
        });
      } else {
        recommendations.push({
          type: 'retry' as const,
          message: 'Additional preparation recommended before the real exam.',
          priority: 'high' as const,
          action: 'prep'
        });
      }
    }

    // Add specific recommendations for weak areas
    if (weaknesses.length > 0) {
      recommendations.push({
        type: 'focus' as const,
        message: `Prioritize additional study in: ${weaknesses.slice(0, 2).map(w => w.replace(/-/g, ' ')).join(', ')}`,
        priority: 'high' as const
      });
    }

    return {
      overallScore,
      passingScore,
      passed,
      strengths,
      weaknesses,
      timeAnalysis: {
        totalTime,
        averagePerQuestion,
        efficiency
      },
      predictions: studySession.examMode === 'efficient' ? {
        fullExamScore: Math.min(100, overallScore * 1.02), // Simple prediction
        confidence: Math.min(1, studySession.totalQuestionsAnswered / 30), // Based on sample size
        passLikelihood: overallScore >= 70 ? 0.85 : overallScore >= 60 ? 0.6 : 0.3
      } : undefined,
      recommendations
    };
  }, [studySession, objectiveAnalyses]);

  const getModeTitle = (mode: 'prep' | 'efficient' | 'mock') => {
    switch (mode) {
      case 'prep': return 'Practice Session Results';
      case 'efficient': return 'Efficient Assessment Results';
      case 'mock': return 'Mock Exam Results';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <ModeIcon mode={studySession.examMode} />
            <h1 className="text-3xl font-bold text-white">{getModeTitle(studySession.examMode)}</h1>
          </div>
          <p className="text-white/70 text-lg">
            {studySession.examMode === 'prep' ? 'Your learning progress summary' :
             studySession.examMode === 'efficient' ? 'Performance prediction and insights' :
             'Complete exam simulation analysis'}
          </p>
        </motion.div>

        {/* Score Display */}
        <ScoreDisplay
          score={analytics.overallScore}
          passed={analytics.passed}
          mode={studySession.examMode}
          predictions={analytics.predictions}
        />

        {/* Detailed Analytics */}
        <DetailedAnalytics analytics={analytics} objectives={objectiveAnalyses} />

        {/* Objective Breakdown */}
        <ObjectiveBreakdown objectives={objectiveAnalyses} />

        {/* Recommendations */}
        <RecommendationsPanel 
          analytics={analytics} 
          mode={studySession.examMode}
          onTakeNextMode={onTakeNextMode}
        />

        {/* Action Buttons */}
        <motion.div
          className="flex justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry {studySession.examMode === 'prep' ? 'Session' : studySession.examMode === 'efficient' ? 'Assessment' : 'Mock Exam'}
            </Button>
          )}
          
          {onContinueStudy && studySession.examMode !== 'prep' && (
            <Button
              onClick={onContinueStudy}
              variant="primary"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Continue Practice
            </Button>
          )}
          
          {onBackToMenu && (
            <Button
              onClick={onBackToMenu}
              variant="secondary"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          )}
        </motion.div>

        {/* Session Summary Stats */}
        <motion.div
          className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Session Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {studySession.totalQuestionsAnswered}
              </div>
              <div className="text-white/60 text-sm">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {studySession.totalCorrectAnswers}
              </div>
              <div className="text-white/60 text-sm">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {Math.floor(analytics.timeAnalysis.totalTime / 60)}m
              </div>
              <div className="text-white/60 text-sm">Time Spent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {objectiveAnalyses.length}
              </div>
              <div className="text-white/60 text-sm">Topics Covered</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
