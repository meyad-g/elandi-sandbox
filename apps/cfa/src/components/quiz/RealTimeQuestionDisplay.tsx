'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Zap, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface StreamingQuestionState {
  thinking: string;
  questionText: string;
  options: Array<{ text: string; index: number }>;
  explanation: string;
  correctAnswer: number;
  isComplete: boolean;
}

interface QuestionAnswer {
  selectedOption: number;
  correct: boolean;
  points: number;
}

interface RealTimeQuestionDisplayProps {
  examName: string;
  objectiveName: string;
  questionNumber: number;
  onAnswer: (answer: QuestionAnswer) => void;
  onNext: () => void;
  streamingState: StreamingQuestionState;
  isGenerating: boolean;
  answered?: QuestionAnswer;
}

export const RealTimeQuestionDisplay: React.FC<RealTimeQuestionDisplayProps> = ({
  examName,
  objectiveName,
  questionNumber,
  onAnswer,
  onNext,
  streamingState,
  isGenerating,
  answered
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (answered) {
      setSelectedOption(answered.selectedOption);
      setShowExplanation(true);
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
    }
  }, [answered, questionNumber]);

  const handleOptionSelect = (optionIndex: number) => {
    if (showExplanation || !streamingState.isComplete) return;
    
    const correct = optionIndex === streamingState.correctAnswer;
    const answer: QuestionAnswer = {
      selectedOption: optionIndex,
      correct,
      points: correct ? 1 : 0
    };
    
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    onAnswer(answer);
  };

  const canProceed = showExplanation && streamingState.isComplete && streamingState.explanation;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-none p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{questionNumber}</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Question {questionNumber}</h2>
              <div className="text-white/70 text-sm">{objectiveName}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-white/90 text-sm font-medium">{examName}</span>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Question Text */}
          <AnimatePresence>
            {streamingState.questionText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-bold">Question</span>
                </div>
                <h3 className="text-white text-xl font-bold leading-relaxed">
                  {streamingState.questionText}
                </h3>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options - Stream in one by one */}
          <div className="space-y-3">
            <AnimatePresence>
              {streamingState.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = showExplanation && index === streamingState.correctAnswer;
                const isIncorrect = showExplanation && isSelected && !isCorrect;
                
                return (
                  <motion.div
                    key={`${questionNumber}-${index}`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    <button
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        showExplanation
                          ? isCorrect
                            ? 'bg-green-500/20 border-green-500/50 text-green-100 transform scale-[1.02]'
                            : isIncorrect
                              ? 'bg-red-500/20 border-red-500/50 text-red-100'
                              : 'bg-white/5 border-white/20 text-white/70'
                          : isSelected
                            ? 'bg-purple-500/20 border-purple-400/60 text-purple-100 transform scale-[1.02]'
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:transform hover:scale-[1.01]'
                      }`}
                      disabled={!streamingState.isComplete || showExplanation}
                      onClick={() => handleOptionSelect(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                          showExplanation && isCorrect
                            ? 'border-green-500 bg-green-500 text-white shadow-lg'
                            : showExplanation && isIncorrect
                              ? 'border-red-500 bg-red-500 text-white'
                              : isSelected
                                ? 'border-purple-400 bg-purple-400 text-white shadow-lg'
                                : 'border-white/40 text-white/80'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1 text-lg leading-relaxed">{option.text}</span>
                        {showExplanation && isCorrect && (
                          <CheckCircle className="w-6 h-6 text-green-400 animate-bounce" />
                        )}
                        {showExplanation && isIncorrect && (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Options Loading Indicator */}
            {isGenerating && streamingState.questionText && streamingState.options.length < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-white/60 text-sm p-4"
              >
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading answer options...</span>
              </motion.div>
            )}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && streamingState.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  {answered?.correct ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-bold">
                      <CheckCircle className="w-5 h-5" />
                      Correct! 
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white font-bold">
                      <XCircle className="w-5 h-5" />
                      Incorrect
                    </div>
                  )}
                  
                  <span className="text-white/70 text-sm">
                    +{answered?.points || 0} point{(answered?.points || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="text-white leading-relaxed text-lg mb-4">
                  {streamingState.explanation}
                </div>
                
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Ready for the next question</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Explanation Loading */}
          {isGenerating && streamingState.options.length > 0 && !streamingState.explanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/60 text-sm p-4"
            >
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Preparing explanation...</span>
            </motion.div>
          )}
        </div>

        {/* Floating Thinking Box - Bottom Right */}
        <AnimatePresence>
          {streamingState.thinking && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 20 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-purple-300 text-sm font-bold">Gemini AI is thinking...</span>
                </div>
                <div className="text-white/80 text-xs leading-relaxed max-h-32 overflow-y-auto">
                  {streamingState.thinking}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-none p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-center">
          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canProceed}
            className={`px-8 py-3 text-lg font-bold ${
              canProceed 
                ? 'bg-purple-500 hover:bg-purple-600 shadow-lg' 
                : 'bg-gray-600 opacity-50 cursor-not-allowed'
            } transition-all`}
          >
            {canProceed ? 'Next Question →' : 'Answer First'}
          </Button>
        </div>
      </div>
    </div>
  );
};
