'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  ArrowRight,
  Flag,
  ChevronLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
  RotateCcw
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

interface EfficientExamModeProps {
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
  onEndEarly?: () => void;
}

const LoadingQuestion: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <motion.div
          className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
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
        <div className="text-white/50 text-sm mt-2">This may take a few moments</div>
      </div>
    </div>
  );
};

const MinimalHeader: React.FC<{
  examName: string;
  currentQuestion: number;
  totalQuestions: number;
  elapsedTime: string;
  onEndEarly: () => void;
}> = ({ examName, currentQuestion, totalQuestions, elapsedTime, onEndEarly }) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-white text-base font-medium">{examName}</h1>
          <div className="text-white/60 text-xs">Efficient Assessment</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-white/80 text-xs">
            Question {currentQuestion} of {totalQuestions}
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <Timer className="w-3 h-3" />
            <span className="font-mono text-xs">{elapsedTime}</span>
          </div>

          <Button
            onClick={onEndEarly}
            variant="outline"
            size="small"
            className="flex items-center gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Flag className="w-4 h-4" />
            <span>End Early</span>
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
  onEndEarly: () => void;
  isAnswered: boolean;
  isComplete: boolean;
  isLoadingExplanation: boolean;
}> = ({ 
  hasSelectedAnswer, 
  showingExplanation, 
  onToggleExplanation, 
  onSubmitAnswer, 
  onNext, 
  onEndEarly,
  isAnswered,
  isComplete,
  isLoadingExplanation
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-4 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onEndEarly}
            variant="outline"
            size="small"
            className="flex items-center gap-2 border-white/20 text-white/70 hover:text-white"
          >
            <Flag className="w-4 h-4" />
            <span>End Assessment</span>
          </Button>
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
              <span>{isComplete ? 'Complete Assessment' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const EndEarlyConfirmation: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  questionsAnswered: number;
  totalQuestions: number;
}> = ({ isOpen, onClose, onConfirm, questionsAnswered, totalQuestions }) => {
  if (!isOpen) return null;

  const completionPercentage = (questionsAnswered / totalQuestions) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <Flag className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">End Assessment Early?</h3>
            <p className="text-white/70">
              You&apos;ve completed {questionsAnswered} of {totalQuestions} questions ({completionPercentage.toFixed(0)}%).
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <h4 className="text-white font-medium mb-2">What happens next:</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Your current performance will be analyzed</li>
              <li>• Score prediction will be calculated</li>
              <li>• Detailed results and recommendations provided</li>
              <li>• You can continue studying or try other modes</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-white/20 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Continue Assessment</span>
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <span>End & View Results</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const EfficientExamMode: React.FC<EfficientExamModeProps> = ({
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
  onEndEarly
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // Format elapsed time
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if exam should naturally end
  const totalQuestions = studySession.examConditions.totalQuestions;
  const currentQuestion = studySession.totalQuestionsAnswered + 1;
  const isNaturallyComplete = studySession.totalQuestionsAnswered >= totalQuestions;

  useEffect(() => {
    if (isNaturallyComplete && onComplete) {
      onComplete();
    }
  }, [isNaturallyComplete, onComplete]);

  const handleEndEarly = () => {
    setShowEndConfirmation(false);
    onEndEarly?.();
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !question) return;
    
    const answer: CertificationAnswer = {
      selectedOption,
      correct: selectedOption === question.correct,
      points: selectedOption === question.correct ? 1 : 0
    };
    
    onAnswer(answer);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (answered || isStreaming) return;
    setSelectedOption(optionIndex);
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

  // Show loading if streaming or no question yet
  if (isStreaming && !streamingState.questionText && !question.text) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <MinimalHeader
          examName={examProfile.name}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          elapsedTime={formatElapsedTime()}
          onEndEarly={() => setShowEndConfirmation(true)}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Minimal Header */}
      <MinimalHeader
        examName={examProfile.name}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        elapsedTime={formatElapsedTime()}
        onEndEarly={() => setShowEndConfirmation(true)}
      />

      {/* Main Question Area - Compact, responsive */}
      <div className="pt-3 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Question Text - Compact but readable */}
          <div className="mb-5">
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
                  const isCorrect = answered && optionIndex === question.correct;
                  const isWrong = answered && isAnswered && !isCorrect;
                  
                  return (
                    <motion.button
                      key={optionIndex}
                      onClick={() => handleOptionSelect(optionIndex)}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                        isAnswered
                          ? isCorrect
                            ? 'border-green-400 bg-green-500/10 text-green-100'
                            : isWrong
                            ? 'border-red-400 bg-red-500/10 text-red-100'
                            : 'border-white/20 bg-white/5 text-white/70'
                          : isSelected
                          ? 'border-blue-400 bg-blue-500/10 text-blue-100'
                          : 'border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/8'
                      } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                      whileHover={!answered ? { scale: 1.005 } : {}}
                      whileTap={!answered ? { scale: 0.995 } : {}}
                      disabled={answered !== null}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-semibold text-xs ${
                          isAnswered
                            ? isCorrect
                              ? 'border-green-400 bg-green-400 text-white'
                              : isWrong
                              ? 'border-red-400 bg-red-400 text-white'
                              : 'border-white/30 text-white/50'
                            : isSelected
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
        onEndEarly={() => setShowEndConfirmation(true)}
        isAnswered={answered !== null}
        isComplete={currentQuestion >= totalQuestions}
        isLoadingExplanation={isLoadingExplanation}
      />

      {/* End Early Confirmation Modal */}
      <EndEarlyConfirmation
        isOpen={showEndConfirmation}
        onClose={() => setShowEndConfirmation(false)}
        onConfirm={handleEndEarly}
        questionsAnswered={studySession.totalQuestionsAnswered}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};