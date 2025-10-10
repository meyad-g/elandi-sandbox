'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Coffee, 
  AlertTriangle, 
  ArrowRight,
  Play,
  Pause,
  CheckCircle,
  Eye,
  EyeOff,
  Flag
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { StudySession } from '@/lib/studySession';
import { ExamProfile } from '@/lib/certifications';

interface CertificationAnswer {
  questionId?: string;
  booleanAnswer?: boolean;
  selectedOption?: number;
  selectedOptions?: number[];
  essayText?: string;
  correct?: boolean;
  points?: number;
}

interface MockExamModeProps {
  studySession: StudySession;
  examProfile: ExamProfile;
  question: {
    text: string;
    type: 'multiple_choice';
    options: string[];
    correct: number;
    why: string;
  };
  index: number;
  onAnswer: (answer: CertificationAnswer) => void;
  answered: CertificationAnswer | null;
  isStreaming: boolean;
  streamingState: {
    questionText: string;
    options: string[];
    explanation: string;
    correctAnswer: number;
    isComplete: boolean;
  };
  onNext: () => void;
  onComplete?: () => void;
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
}

const LoadingQuestion: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <motion.div
          className="w-12 h-12 border-3 border-red-400 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="text-white/80 text-lg"
        >
          Generating question...
        </motion.div>
        <div className="text-white/50 text-sm mt-2">Please wait</div>
      </div>
    </div>
  );
};

const ExamHeader: React.FC<{
  currentQuestion: number;
  totalQuestions: number;
  session: number;
  timeRemaining: number;
  isPaused: boolean;
  onTogglePause: () => void;
}> = ({ currentQuestion, totalQuestions, session, timeRemaining, isPaused, onTogglePause }) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formatTime = () => {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining <= 1800; // Last 30 minutes
  const isCritical = timeRemaining <= 300; // Last 5 minutes

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-white text-base font-medium">CFA Level I Mock Examination</h1>
          <div className="text-white/60 text-xs">
            Session {session} • Question {currentQuestion} of {totalQuestions}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/70" />
            <div className={`font-mono text-base font-bold ${
              isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'
            }`}>
              {formatTime()}
            </div>
          </div>

          <Button
            onClick={onTogglePause}
            variant="outline"
            size="small"
            className="flex items-center gap-2 border-white/20 text-white/70 hover:text-white"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const BottomNavigation: React.FC<{
  hasSelectedAnswer: boolean;
  showingExplanation: boolean;
  onToggleExplanation: () => void;
  onSubmitAnswer: () => void;
  onNext: () => void;
  isAnswered: boolean;
  isComplete: boolean;
  currentQuestion: number;
  totalQuestions: number;
  isLoadingExplanation: boolean;
}> = ({ 
  hasSelectedAnswer, 
  showingExplanation, 
  onToggleExplanation, 
  onSubmitAnswer, 
  onNext,
  isAnswered,
  isComplete,
  currentQuestion,
  totalQuestions,
  isLoadingExplanation
}) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-4 z-30">
      <div className="max-w-6xl mx-auto">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>Exam Progress</span>
            <span>{currentQuestion} / {totalQuestions} ({progressPercentage.toFixed(0)}%)</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-white/60 text-sm">
              Question {currentQuestion}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAnswered && (
              <Button
                onClick={onToggleExplanation}
                variant="outline"
                className="flex items-center gap-2 border-white/20 text-white"
                disabled={isLoadingExplanation}
              >
                {isLoadingExplanation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    {showingExplanation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showingExplanation ? 'Hide Explanation' : 'View Explanation'}</span>
                  </>
                )}
              </Button>
            )}

            {!isAnswered && hasSelectedAnswer && (
              <Button
                onClick={onSubmitAnswer}
                variant="primary"
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Answer</span>
              </Button>
            )}

            {isAnswered && (
              <Button
                onClick={onNext}
                variant="primary"
                className="flex items-center gap-2"
              >
                <span>{isComplete ? 'Complete Exam' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BreakScreen: React.FC<{
  timeRemaining: number;
  onEndBreak: () => void;
  session: number;
  questionsCompleted: number;
  totalQuestions: number;
}> = ({ timeRemaining, onEndBreak, session, questionsCompleted, totalQuestions }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-50 flex items-center justify-center p-4"
    >
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <Coffee className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Session Break</h2>
        <p className="text-white/70 mb-8">
          You&apos;ve completed Session {session}. Take a well-deserved break.
        </p>

        {/* Break timer */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="text-5xl font-mono font-bold text-white mb-2">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-white/60">Break time remaining</div>
        </div>

        {/* Simple progress */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
          <div className="text-white/70 mb-2">Session {session} Complete</div>
          <div className="text-white font-medium">
            {questionsCompleted} / {totalQuestions} questions
          </div>
        </div>

        <Button
          onClick={onEndBreak}
          variant="primary"
          className="flex items-center gap-2 px-8 py-3"
        >
          <Play className="w-4 h-4" />
          <span>Start Session {session + 1}</span>
        </Button>
      </div>
    </motion.div>
  );
};

export const MockExamMode: React.FC<MockExamModeProps> = ({
  studySession,
  examProfile,
  question,
  index,
  onAnswer,
  answered,
  isStreaming,
  streamingState,
  onNext,
  onComplete,
  onBreakStart,
  onBreakEnd
}) => {
  const [timeRemaining, setTimeRemaining] = useState(studySession.timeRemaining || 16200); // 4.5 hours in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(900); // 15 minutes
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const totalQuestions = studySession.examConditions.totalQuestions;
  const currentQuestion = studySession.totalQuestionsAnswered + 1;
  const isExamComplete = studySession.totalQuestionsAnswered >= totalQuestions;
  const currentSession = currentQuestion <= Math.floor(totalQuestions / 2) ? 1 : 2;
  const isBreakEligible = currentQuestion === Math.floor(totalQuestions / 2) + 1;

  // Reset selection when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
    setExplanationText('');
  }, [question, index]);

  // Load explanation on-demand
  const loadExplanation = async () => {
    if (explanationText || isLoadingExplanation) return; // Already loaded or loading
    
    setIsLoadingExplanation(true);
    
    try {
      const response = await fetch('/api/generate-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.text,
          options: question.options,
          correctAnswerIndex: question.correct,
          userSelectedIndex: answered?.selectedOption,
          examContext: {
            examName: examProfile.name,
            objectiveName: studySession.examProfile.objectives.find(obj => 
              obj.id === studySession.currentObjectiveId
            )?.title,
            topicArea: studySession.currentObjectiveId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      setExplanationText(data.explanation);
    } catch (error) {
      console.error('Error loading explanation:', error);
      setExplanationText('Failed to load explanation. Please try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleToggleExplanation = async () => {
    if (!showExplanation) {
      // Show explanation - load if not already loaded
      await loadExplanation();
      setShowExplanation(true);
    } else {
      // Hide explanation
      setShowExplanation(false);
    }
  };

  // Main exam timer
  useEffect(() => {
    if (isPaused || isBreakActive || isExamComplete) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0 && onComplete) {
          // Auto-submit when time expires
          if (answered === null && selectedOption !== null) {
            handleSubmitAnswer();
          }
          setTimeout(() => onComplete(), 1000);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isBreakActive, isExamComplete, answered, selectedOption, onComplete]);

  // Break timer
  useEffect(() => {
    if (!isBreakActive) return;

    const interval = setInterval(() => {
      setBreakTimeRemaining(prev => {
        if (prev <= 1) {
          handleBreakEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakActive]);

  const handleBreakStart = useCallback(() => {
    setIsBreakActive(true);
    setBreakTimeRemaining(900);
    onBreakStart?.();
  }, [onBreakStart]);

  const handleBreakEnd = useCallback(() => {
    setIsBreakActive(false);
    onBreakEnd?.();
  }, [onBreakEnd]);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Handle exam completion
  useEffect(() => {
    if (isExamComplete && onComplete) {
      onComplete();
    }
  }, [isExamComplete, onComplete]);

  const handleOptionSelect = (optionIndex: number) => {
    if (answered || isStreaming) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = useCallback(() => {
    if (selectedOption === null || !question) return;
    
    const answer: CertificationAnswer = {
      selectedOption,
      correct: selectedOption === question.correct,
      points: selectedOption === question.correct ? 1 : 0
    };
    
    onAnswer(answer);
  }, [selectedOption, question, onAnswer]);

  // Auto-offer break at midpoint
  useEffect(() => {
    if (isBreakEligible && currentSession === 1 && !isBreakActive && answered) {
      // Show break offer after answering the midpoint question
      setTimeout(() => {
        handleBreakStart();
      }, 2000);
    }
  }, [isBreakEligible, currentSession, isBreakActive, answered, handleBreakStart]);

  // Show loading if streaming or no question yet
  if (isStreaming && !streamingState.questionText && !question.text) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ExamHeader
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          session={currentSession}
          timeRemaining={timeRemaining}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
        />
        <LoadingQuestion />
      </div>
    );
  }

  const currentQuestionText = isStreaming && streamingState.questionText 
    ? streamingState.questionText 
    : question.text;
  
  const currentOptions = isStreaming && streamingState.options.length > 0 
    ? streamingState.options 
    : question.options || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Break Screen */}
      <AnimatePresence>
        {isBreakActive && (
          <BreakScreen
            timeRemaining={breakTimeRemaining}
            onEndBreak={handleBreakEnd}
            session={currentSession - 1}
            questionsCompleted={Math.floor(totalQuestions / 2)}
            totalQuestions={totalQuestions}
          />
        )}
      </AnimatePresence>

      {/* Official Exam Header */}
      <ExamHeader
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        session={currentSession}
        timeRemaining={timeRemaining}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* Main Question Area - Compact */}
      <div className="pt-3 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Question Context */}
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="text-white/60 text-xs">Question {currentQuestion}</span>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <span className="text-white/60 text-xs capitalize">
                {studySession.examProfile.objectives.find(obj => 
                  obj.id === studySession.currentObjectiveId
                )?.title?.split('-').join(' ')}
              </span>
            </div>
          </div>

          {/* Question Text - Compact but readable */}
          <div className="mb-4">
            <motion.h2 
              className="text-white text-base sm:text-lg leading-normal font-normal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestionText || 'Loading question...'}
            </motion.h2>
          </div>

          {/* Main Content Area - Question or Explanation */}
          <AnimatePresence mode="wait">
            {!showExplanation ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {currentOptions.map((option, optionIndex) => {
                  const isSelected = selectedOption === optionIndex;
                  const isAnswered = answered?.selectedOption === optionIndex;
                  
                  return (
                    <motion.button
                      key={optionIndex}
                      onClick={() => handleOptionSelect(optionIndex)}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                        isAnswered
                          ? 'border-blue-400 bg-blue-500/10 text-blue-100'
                          : isSelected
                          ? 'border-blue-400 bg-blue-500/10 text-blue-100'
                          : 'border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/8'
                      } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                      whileHover={!answered ? { scale: 1.002 } : {}}
                      whileTap={!answered ? { scale: 0.998 } : {}}
                      disabled={answered !== null}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-semibold text-xs ${
                          isAnswered || isSelected
                            ? 'border-blue-400 bg-blue-400 text-white'
                            : 'border-white/40 text-white/70'
                        }`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <div className="flex-1 text-sm sm:text-base leading-normal">
                          {option}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Explanation
                  </h3>
                  <div className="text-white/90 text-sm leading-normal">
                    {isLoadingExplanation ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating personalized explanation...</span>
                      </div>
                    ) : (
                      explanationText || 'No explanation available.'
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation
        hasSelectedAnswer={selectedOption !== null}
        showingExplanation={showExplanation}
        onToggleExplanation={handleToggleExplanation}
        onSubmitAnswer={handleSubmitAnswer}
        onNext={onNext}
        isAnswered={answered !== null}
        isComplete={currentQuestion >= totalQuestions}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        isLoadingExplanation={isLoadingExplanation}
      />

      {/* Break Notification - Only at exact midpoint */}
      <AnimatePresence>
        {isBreakEligible && currentSession === 1 && answered && !isBreakActive && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-orange-500/20 border border-orange-400/40 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-white font-medium">Session 1 Complete</div>
                  <div className="text-white/70 text-sm">15-minute break recommended</div>
                </div>
                <Button
                  onClick={handleBreakStart}
                  variant="primary"
                  size="small"
                  className="ml-3 flex items-center gap-2"
                >
                  <span>Take Break</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Warning - Only for critical time */}
      <AnimatePresence>
        {timeRemaining <= 300 && timeRemaining > 0 && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">5 minutes remaining</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};