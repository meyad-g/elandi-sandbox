'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Brain, 
  BookOpen, 
  CreditCard, 
  Filter,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StudySession } from '@/lib/studySession';

interface LearningHistoryProps {
  studySession: StudySession;
  onClose?: () => void;
}

type FilterType = 'all' | 'questions' | 'flashcards' | 'correct' | 'incorrect';
type SortType = 'newest' | 'oldest' | 'performance';

export const LearningHistory: React.FC<LearningHistoryProps> = ({
  studySession,
  onClose
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');

  // Combine all learning activities
  const allActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'question' | 'flashcard';
      timestamp: Date;
      objectiveId: string;
      correct?: boolean;
      timeSpent: number;
      difficulty?: string;
      masteryLevel?: string;
      attempt: number;
    }> = [];

    // Add question attempts
    studySession.objectives.forEach(objective => {
      objective.attempts.forEach(attempt => {
        activities.push({
          id: attempt.questionId,
          type: 'question',
          timestamp: attempt.timestamp,
          objectiveId: attempt.objectiveId,
          correct: attempt.correct,
          timeSpent: attempt.timeSpent,
          difficulty: attempt.difficulty,
          attempt: attempt.attempt
        });
      });

      // Add flashcard attempts
      objective.flashcardAttempts?.forEach(attempt => {
        activities.push({
          id: attempt.flashcardId,
          type: 'flashcard',
          timestamp: attempt.timestamp,
          objectiveId: attempt.objectiveId,
          timeSpent: attempt.timeSpent,
          difficulty: attempt.difficulty,
          masteryLevel: attempt.masteryLevel,
          attempt: attempt.attempt
        });
      });
    });

    return activities;
  }, [studySession]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    // Apply filters
    switch (filter) {
      case 'questions':
        filtered = filtered.filter(a => a.type === 'question');
        break;
      case 'flashcards':
        filtered = filtered.filter(a => a.type === 'flashcard');
        break;
      case 'correct':
        filtered = filtered.filter(a => 
          a.type === 'question' ? a.correct === true : 
          a.type === 'flashcard' ? ['good', 'easy'].includes(a.masteryLevel || '') : false
        );
        break;
      case 'incorrect':
        filtered = filtered.filter(a => 
          a.type === 'question' ? a.correct === false : 
          a.type === 'flashcard' ? ['again', 'hard'].includes(a.masteryLevel || '') : false
        );
        break;
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        break;
      case 'performance':
        filtered.sort((a, b) => {
          const aScore = a.type === 'question' ? (a.correct ? 1 : 0) : 
            a.masteryLevel === 'easy' ? 4 : a.masteryLevel === 'good' ? 3 : 
            a.masteryLevel === 'hard' ? 2 : 1;
          const bScore = b.type === 'question' ? (b.correct ? 1 : 0) : 
            b.masteryLevel === 'easy' ? 4 : b.masteryLevel === 'good' ? 3 : 
            b.masteryLevel === 'hard' ? 2 : 1;
          return bScore - aScore;
        });
        break;
    }

    return filtered;
  }, [allActivities, filter, sort]);

  // Calculate statistics
  const stats = useMemo(() => {
    const questionAttempts = allActivities.filter(a => a.type === 'question');
    const flashcardAttempts = allActivities.filter(a => a.type === 'flashcard');
    
    const correctQuestions = questionAttempts.filter(a => a.correct).length;
    const goodFlashcards = flashcardAttempts.filter(a => ['good', 'easy'].includes(a.masteryLevel || '')).length;
    
    const totalTimeSpent = allActivities.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTimePerActivity = allActivities.length > 0 ? totalTimeSpent / allActivities.length : 0;

    return {
      totalActivities: allActivities.length,
      questionAttempts: questionAttempts.length,
      flashcardAttempts: flashcardAttempts.length,
      correctQuestions,
      goodFlashcards,
      questionAccuracy: questionAttempts.length > 0 ? (correctQuestions / questionAttempts.length) * 100 : 0,
      flashcardMastery: flashcardAttempts.length > 0 ? (goodFlashcards / flashcardAttempts.length) * 100 : 0,
      totalTimeSpent,
      averageTimePerActivity
    };
  }, [allActivities]);

  const getObjectiveName = (objectiveId: string) => {
    const objective = studySession.examProfile.objectives.find(obj => obj.id === objectiveId);
    return objective?.title || 'Unknown Objective';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Learning History</h2>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/60">Total Activities</span>
              </div>
              <p className="text-xl font-bold text-white">{stats.totalActivities}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/60">Questions</span>
              </div>
              <p className="text-xl font-bold text-white">{stats.questionAttempts}</p>
              <p className="text-xs text-green-400">{Math.round(stats.questionAccuracy)}% correct</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white/60">Flashcards</span>
              </div>
              <p className="text-xl font-bold text-white">{stats.flashcardAttempts}</p>
              <p className="text-xs text-purple-400">{Math.round(stats.flashcardMastery)}% mastery</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-white/60">Avg. Time</span>
              </div>
              <p className="text-xl font-bold text-white">{formatTime(Math.round(stats.averageTimePerActivity))}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">Filter:</span>
              <div className="flex gap-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'questions', label: 'Questions' },
                  { key: 'flashcards', label: 'Flashcards' },
                  { key: 'correct', label: 'Correct' },
                  { key: 'incorrect', label: 'Incorrect' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as FilterType)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filter === key
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xs text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={`${activity.id}-${activity.timestamp.getTime()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'question'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {activity.type === 'question' ? (
                          <BookOpen className="w-4 h-4" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">
                            {activity.type === 'question' ? 'Question' : 'Flashcard'}
                          </h4>
                          <span className="text-xs text-white/60">
                            {getObjectiveName(activity.objectiveId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span>{formatDate(activity.timestamp)}</span>
                          <span>{formatTime(activity.timeSpent)}</span>
                          {activity.difficulty && (
                            <span className="capitalize">{activity.difficulty}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {activity.type === 'question' ? (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          activity.correct 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {activity.correct ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span className="text-xs font-medium">
                            {activity.correct ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      ) : (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.masteryLevel === 'easy' ? 'bg-green-500/20 text-green-400' :
                          activity.masteryLevel === 'good' ? 'bg-blue-500/20 text-blue-400' :
                          activity.masteryLevel === 'hard' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {activity.masteryLevel?.charAt(0).toUpperCase()}{activity.masteryLevel?.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No activities found</h3>
                <p className="text-white/60">
                  {filter === 'all' 
                    ? 'Start studying to see your learning history here'
                    : 'Try adjusting your filters to see more activities'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
