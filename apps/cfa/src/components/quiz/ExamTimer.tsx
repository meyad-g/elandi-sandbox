'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Coffee, 
  AlertTriangle, 
  Timer as TimerIcon,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Button } from '../ui/Button';

export type TimerMode = 'strict' | 'pace' | 'none';
export type PaceStatus = 'ahead' | 'on-track' | 'behind' | 'way-behind';

interface ExamTimerProps {
  mode: TimerMode;
  totalTimeSeconds?: number; // Total time allocated (for strict mode)
  currentQuestion: number;
  totalQuestions: number;
  isActive: boolean;
  onTimeExpired?: () => void;
  onBreakRequested?: () => void;
  isBreakActive?: boolean;
  breakTimeRemaining?: number;
  className?: string;
}

interface TimerDisplayProps {
  timeRemaining: number;
  isWarning: boolean;
  isCritical: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface PaceIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedSeconds: number;
  targetSecondsPerQuestion: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeRemaining, 
  isWarning, 
  isCritical, 
  size = 'medium' 
}) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formatTime = () => {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-xl',
    large: 'text-3xl'
  };

  const colorClass = isCritical 
    ? 'text-red-400' 
    : isWarning 
    ? 'text-yellow-400' 
    : 'text-white';

  return (
    <motion.div
      className={`font-mono font-bold ${sizeClasses[size]} ${colorClass}`}
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={isCritical ? { duration: 1, repeat: Infinity } : {}}
    >
      {formatTime()}
    </motion.div>
  );
};

const PaceIndicator: React.FC<PaceIndicatorProps> = ({ 
  currentQuestion, 
  totalQuestions, 
  elapsedSeconds,
  targetSecondsPerQuestion 
}) => {
  const targetTimeForProgress = currentQuestion * targetSecondsPerQuestion;
  const timeDifference = elapsedSeconds - targetTimeForProgress;
  
  let paceStatus: PaceStatus;
  let paceMessage: string;
  let paceIcon: React.ReactNode;
  let paceColor: string;

  if (timeDifference < -60) {
    paceStatus = 'ahead';
    paceMessage = 'Ahead of pace';
    paceIcon = <TrendingUp className="w-4 h-4" />;
    paceColor = 'text-green-400';
  } else if (timeDifference < 60) {
    paceStatus = 'on-track';
    paceMessage = 'On track';
    paceIcon = <Minus className="w-4 h-4" />;
    paceColor = 'text-blue-400';
  } else if (timeDifference < 300) {
    paceStatus = 'behind';
    paceMessage = 'Behind pace';
    paceIcon = <TrendingDown className="w-4 h-4" />;
    paceColor = 'text-yellow-400';
  } else {
    paceStatus = 'way-behind';
    paceMessage = 'Way behind';
    paceIcon = <AlertTriangle className="w-4 h-4" />;
    paceColor = 'text-red-400';
  }

  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const timePercentage = (elapsedSeconds / (totalQuestions * targetSecondsPerQuestion)) * 100;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TimerIcon className="w-4 h-4 text-white/60" />
          <span className="text-white/90 text-sm font-medium">Pace</span>
        </div>
        <div className={`flex items-center gap-2 ${paceColor}`}>
          {paceIcon}
          <span className="text-sm font-medium">{paceMessage}</span>
        </div>
      </div>
      
      {/* Progress vs Time bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Questions</span>
            <span>{currentQuestion} / {totalQuestions}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Time Used</span>
            <span>{Math.round(timePercentage)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                paceStatus === 'ahead' ? 'bg-green-400' :
                paceStatus === 'on-track' ? 'bg-blue-400' :
                paceStatus === 'behind' ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, timePercentage)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Time difference */}
      <div className="mt-3 text-center">
        <span className="text-xs text-white/60">
          {timeDifference > 0 ? '+' : ''}{Math.round(timeDifference / 60)} min vs target
        </span>
      </div>
    </div>
  );
};

export const ExamTimer: React.FC<ExamTimerProps> = ({
  mode,
  totalTimeSeconds = 0,
  currentQuestion,
  totalQuestions,
  isActive,
  onTimeExpired,
  onBreakRequested,
  isBreakActive = false,
  breakTimeRemaining = 0,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(totalTimeSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasWarned25, setHasWarned25] = useState(false);
  const [hasWarned10, setHasWarned10] = useState(false);
  const [hasWarned5, setHasWarned5] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!isActive || isPaused || mode === 'none') return;

    const interval = setInterval(() => {
      if (mode === 'strict') {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          
          // Warning notifications
          const percentage = (newTime / totalTimeSeconds) * 100;
          if (percentage <= 25 && !hasWarned25) {
            setHasWarned25(true);
          } else if (percentage <= 10 && !hasWarned10) {
            setHasWarned10(true);
          } else if (percentage <= 5 && !hasWarned5) {
            setHasWarned5(true);
          }
          
          if (newTime === 0 && onTimeExpired) {
            onTimeExpired();
          }
          
          return newTime;
        });
      }
      
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, mode, totalTimeSeconds, hasWarned25, hasWarned10, hasWarned5, onTimeExpired]);

  // Break timer
  useEffect(() => {
    if (!isBreakActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakActive]);

  const handlePauseResume = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const isWarning = (timeRemaining / totalTimeSeconds) <= 0.25 && (timeRemaining / totalTimeSeconds) > 0.10;
  const isCritical = (timeRemaining / totalTimeSeconds) <= 0.10;

  if (mode === 'none') {
    return null;
  }

  return (
    <div className={`${className}`}>
      {/* Break Mode Display */}
      <AnimatePresence>
        {isBreakActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coffee className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Break Time</h3>
            </div>
            
            <div className="mb-4">
              <TimerDisplay 
                timeRemaining={breakTimeRemaining} 
                isWarning={breakTimeRemaining <= 300}
                isCritical={breakTimeRemaining <= 60}
                size="large"
              />
            </div>
            
            <p className="text-white/70 text-sm">
              Take a break! You&apos;ll return to question {currentQuestion + 1} when ready.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Timer Display */}
      {!isBreakActive && (
        <div className="space-y-4">
          {/* Strict Timer Mode */}
          {mode === 'strict' && (
            <motion.div
              className={`bg-white/5 border border-white/10 rounded-xl p-4 ${
                isCritical ? 'border-red-400/50 bg-red-500/10' : 
                isWarning ? 'border-yellow-400/50 bg-yellow-500/10' : ''
              }`}
              animate={isCritical ? { 
                boxShadow: ['0 0 0 rgba(248, 113, 113, 0)', '0 0 20px rgba(248, 113, 113, 0.3)', '0 0 0 rgba(248, 113, 113, 0)'] 
              } : {}}
              transition={isCritical ? { duration: 2, repeat: Infinity } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/60" />
                  <span className="text-white/90 font-medium">Time Remaining</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isCritical && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </motion.div>
                  )}
                  
                  <Button
                    onClick={handlePauseResume}
                    variant="outline"
                    size="small"
                    className="text-white border-white/20"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <TimerDisplay 
                  timeRemaining={timeRemaining} 
                  isWarning={isWarning}
                  isCritical={isCritical}
                  size="large"
                />
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-red-400' : isWarning ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeRemaining / totalTimeSeconds) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0:00</span>
                  <span>{Math.floor(totalTimeSeconds / 3600)}:{Math.floor((totalTimeSeconds % 3600) / 60).toString().padStart(2, '0')}:00</span>
                </div>
              </div>

              {/* Break option for mock exams */}
              {totalQuestions > 100 && currentQuestion === Math.floor(totalQuestions / 2) && onBreakRequested && (
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={onBreakRequested}
                    variant="secondary"
                    size="small"
                    className="bg-orange-500/20 border-orange-400/30 text-orange-300 hover:bg-orange-500/30"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Take Break (Recommended)
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Pace Indicator Mode */}
          {mode === 'pace' && (
            <PaceIndicator
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              elapsedSeconds={elapsedSeconds}
              targetSecondsPerQuestion={90} // 1.5 minutes per question
            />
          )}

          {/* Question Progress (for all modes except none) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm font-medium">Progress</span>
              <span className="text-white/70 text-sm">{currentQuestion} / {totalQuestions}</span>
            </div>
            
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
