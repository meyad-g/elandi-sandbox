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
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Assessment Results</h2>
            <p className="text-white/60 text-sm">
              {mode === 'prep' ? 'Study Session Complete' : 
               mode === 'efficient' ? 'Diagnostic Assessment' : 
               'Mock Examination'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">{score.toFixed(0)}%</div>
            <div className={`text-sm font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? 'Passing' : 'Needs Review'}
            </div>
          </div>
        </div>

        {/* Predictions for efficient mode */}
        {mode === 'efficient' && predictions && (
          <div className="border-t border-white/10 pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-white">{predictions.fullExamScore.toFixed(0)}%</div>
                <div className="text-xs text-white/60">Predicted Score</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{(predictions.confidence * 100).toFixed(0)}%</div>
                <div className="text-xs text-white/60">Confidence</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{(predictions.passLikelihood * 100).toFixed(0)}%</div>
                <div className="text-xs text-white/60">Pass Likelihood</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ObjectiveBreakdown: React.FC<{ objectives: ObjectiveAnalysis[] }> = ({ objectives }) => {
  const [showAll, setShowAll] = useState(false);
  const displayObjectives = showAll ? objectives : objectives.slice(0, 6);

  return (
    <div className="mb-8">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Topic Performance</h3>
        <div className="space-y-3">
          {displayObjectives.map((obj, index) => (
            <motion.div
              key={obj.objectiveId}
              className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white text-sm font-medium">{obj.title}</h4>
                  <span className="text-white/80 text-sm font-medium">{obj.accuracy.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>{obj.questionsAttempted} questions</span>
                  <span>{obj.averageTime.toFixed(0)}s avg</span>
                  <span className={
                    obj.priority === 'high' ? 'text-red-400' :
                    obj.priority === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }>
                    {obj.priority} priority
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {objectives.length > 6 && (
          <div className="text-center mt-4">
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
    </div>
  );
};

const RecommendationsPanel: React.FC<{ 
  analytics: ModeSpecificAnalytics;
  mode: 'prep' | 'efficient' | 'mock';
  onTakeNextMode?: (mode: 'prep' | 'efficient' | 'mock') => void;
}> = ({ analytics, mode, onTakeNextMode }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
      <h3 className="text-white font-medium mb-3">Recommendations</h3>
      <div className="space-y-3">
        {analytics.recommendations.slice(0, 2).map((rec, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
              rec.priority === 'high' ? 'bg-red-400' :
              rec.priority === 'medium' ? 'bg-yellow-400' :
              'bg-green-400'
            }`} />
            <div className="flex-1">
              <p className="text-white/90 text-sm leading-relaxed">{rec.message}</p>
              {rec.action && onTakeNextMode && (
                <Button
                  onClick={() => {
                    const nextMode = rec.action === 'mock' ? 'mock' : 
                                   rec.action === 'efficient' ? 'efficient' : 'prep';
                    onTakeNextMode(nextMode);
                  }}
                  variant="outline"
                  size="small"
                  className="mt-2 text-white/80 border-white/20 hover:bg-white/10 text-xs"
                >
                  {rec.action}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
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
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {/* Performance Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">Performance Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Accuracy</span>
            <span className="text-white">{analytics.overallScore.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Time per Question</span>
            <span className="text-white">{analytics.timeAnalysis.averagePerQuestion.toFixed(0)}s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Efficiency</span>
            <span className="text-white capitalize">{analytics.timeAnalysis.efficiency}</span>
          </div>
        </div>
      </div>

      {/* Strengths & Areas to Focus */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">Performance Areas</h3>
        <div className="space-y-3">
          {analytics.strengths.length > 0 && (
            <div>
              <div className="text-xs text-green-400 font-medium mb-1">Strong Areas</div>
              <div className="space-y-1">
                {analytics.strengths.slice(0, 2).map((strength, index) => (
                  <div key={index} className="text-white/80 text-xs capitalize">
                    {strength.replace(/-/g, ' ')}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {analytics.weaknesses.length > 0 && (
            <div>
              <div className="text-xs text-yellow-400 font-medium mb-1">Focus Areas</div>
              <div className="space-y-1">
                {analytics.weaknesses.slice(0, 2).map((weakness, index) => (
                  <div key={index} className="text-white/80 text-xs capitalize">
                    {weakness.replace(/-/g, ' ')}
                  </div>
                ))}
              </div>
            </div>
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
          masteryLevel: accuracy >= 85 ? 'mastery' : accuracy >= 70 ? 'proficient' : accuracy >= 60 ? 'developing' : 'novice',
          trend,
          recommendation,
          priority
        };
      });
  }, [studySession, examProfile]);

  // Calculate mode-specific analytics
  const analytics = useMemo((): ModeSpecificAnalytics => {
    const totalQuestions = studySession.totalQuestionsAnswered;
    const totalCorrect = studySession.objectives.reduce((sum, obj) => sum + obj.questionsCorrect, 0);
    const overallScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const passingScore = 70;
    const passed = overallScore >= passingScore;

    // Time analysis
    const totalTime = studySession.objectives.reduce((sum, obj) => sum + obj.totalTimeSpent, 0);
    const averagePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;
    const efficiency = averagePerQuestion < 90 ? 'fast' : averagePerQuestion > 150 ? 'slow' : 'optimal';

    // Identify strengths and weaknesses
    const strengths = objectiveAnalyses.filter(obj => obj.accuracy >= 80).map(obj => obj.objectiveId).slice(0, 3);
    const weaknesses = objectiveAnalyses.filter(obj => obj.accuracy < 70).map(obj => obj.objectiveId).slice(0, 3);

    // Generate recommendations based on mode and performance
    const recommendations: ModeSpecificAnalytics['recommendations'] = [];

    if (studySession.examMode === 'efficient') {
      if (overallScore >= 80) {
        recommendations.push({
          type: 'ready',
          message: 'Strong performance indicates good exam readiness. Consider taking a full mock exam.',
          priority: 'low',
          action: 'mock'
        });
      } else if (overallScore >= 70) {
        recommendations.push({
          type: 'focus',
          message: 'Solid foundation with room for improvement. Focus on weak areas and practice more questions.',
          priority: 'medium',
          action: 'prep'
        });
      } else {
        recommendations.push({
          type: 'retry',
          message: 'Significant gaps identified. Recommend additional study before retaking assessment.',
          priority: 'high',
          action: 'prep'
        });
      }
    }

    if (weaknesses.length > 0) {
      recommendations.push({
        type: 'focus',
        message: `Focus on improving performance in: ${weaknesses.slice(0, 2).join(', ')}`,
        priority: 'high'
      });
    }

    // Predictions for efficient mode
    let predictions: ModeSpecificAnalytics['predictions'] | undefined;
    if (studySession.examMode === 'efficient') {
      const confidence = Math.min(0.9, totalQuestions / 54);
      const fullExamScore = Math.max(0, Math.min(100, overallScore + (Math.random() - 0.5) * 10));
      const passLikelihood = Math.max(0, Math.min(1, (fullExamScore - 50) / 30));
      
      predictions = {
        fullExamScore,
        confidence,
        passLikelihood
      };
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
      predictions,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <ModeIcon mode={studySession.examMode} />
            <h1 className="text-2xl font-semibold text-white">{getModeTitle(studySession.examMode)}</h1>
          </div>
          <p className="text-white/60">
            {studySession.examMode === 'prep' ? 'Learning progress summary' :
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
          className="flex justify-center gap-3 mt-8"
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
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};