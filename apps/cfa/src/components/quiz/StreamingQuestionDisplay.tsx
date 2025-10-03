'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Zap, Target, Book } from 'lucide-react';
import { Button } from '../ui/Button';

// Removed unused interface

interface StreamingAnswer {
  selectedOption?: number;
  selectedOptions?: number[];
  booleanAnswer?: boolean;
  correct?: boolean;
  points?: number;
}

interface StreamingQuestionDisplayProps {
  examName?: string;
  objectiveName?: string;
  questionNumber: number;
  onAnswer: (answer: StreamingAnswer) => void;
  onNext: () => void;
  isGenerating: boolean;
  streamingState: {
    thinking: string;
    questionText: string;
    options: string[];
    isComplete: boolean;
  };
  answered?: StreamingAnswer;
}

export const StreamingQuestionDisplay: React.FC<StreamingQuestionDisplayProps> = ({
  examName,
  objectiveName,
  questionNumber,
  onAnswer,
  onNext,
  isGenerating,
  streamingState,
  answered
}) => {
  const [revealed, setRevealed] = useState(Boolean(answered));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    setRevealed(Boolean(answered));
    if (answered?.selectedOption !== undefined) {
      setSelectedOption(answered.selectedOption);
    } else {
      setSelectedOption(null);
    }
  }, [answered, streamingState.isComplete]);

  const handleOptionSelect = (optionIndex: number) => {
    if (revealed || !streamingState.isComplete) return;
    
    setSelectedOption(optionIndex);
    // For now, assume option 0 is correct (will be replaced with actual logic)
    const correct = optionIndex === 0; // This should come from the question data
    
    const answer: StreamingAnswer = {
      selectedOption: optionIndex,
      correct,
      points: correct ? 1 : 0
    };
    
    onAnswer(answer);
    setRevealed(true);
  };

  const canProceed = revealed && streamingState.isComplete;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Question Header */}
      <div className="flex-none p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{questionNumber}</span>
            </div>
            <div>
              <div className="text-white font-medium text-lg">Question {questionNumber}</div>
              {objectiveName && (
                <div className="text-white/70 text-sm">{objectiveName}</div>
              )}
            </div>
          </div>
          
          {examName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
              <Book className="w-4 h-4 text-white/70" />
              <span className="text-white/90 text-sm">{examName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          
          {/* Thinking Phase */}
          <AnimatePresence>
            {isGenerating && streamingState.thinking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-purple-300 text-sm font-medium">AI is thinking...</span>
                </div>
                <div className="text-white/70 text-sm leading-relaxed">
                  {streamingState.thinking}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Text */}
          <AnimatePresence>
            {streamingState.questionText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-white/70 text-sm">Generating question...</span>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white leading-relaxed">
                    {streamingState.questionText}
                    {!streamingState.isComplete && (
                      <span className="inline-block w-2 h-6 bg-purple-400 animate-pulse ml-1" />
                    )}
                  </h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options */}
          <AnimatePresence>
            {streamingState.options.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="space-y-3">
                  {streamingState.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = revealed && index === 0; // Replace with actual correct answer
                    const isIncorrect = revealed && isSelected && !isCorrect;
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                          revealed
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500/40 text-green-100'
                              : isIncorrect
                                ? 'bg-red-500/20 border-red-500/40 text-red-100'
                                : 'bg-white/5 border-white/20 text-white/70'
                            : isSelected
                              ? 'bg-purple-500/20 border-purple-400/60 text-purple-100'
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                        }`}
                        disabled={!streamingState.isComplete || revealed}
                        onClick={() => handleOptionSelect(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                            revealed && isCorrect
                              ? 'border-green-500 bg-green-500 text-white'
                              : revealed && isIncorrect
                                ? 'border-red-500 bg-red-500 text-white'
                                : isSelected
                                  ? 'border-purple-400 bg-purple-400 text-white'
                                  : 'border-white/30 text-white/70'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1">{option}</span>
                          {revealed && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {revealed && isIncorrect && <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Explanation */}
          <AnimatePresence>
            {revealed && streamingState.isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-br from-white/7 to-white/4 border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {answered?.correct ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-bold">
                        <CheckCircle className="w-4 h-4" />
                        Correct!
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white font-bold">
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </div>
                    )}
                    
                    {answered?.points !== undefined && (
                      <span className="text-white/70 text-sm">
                        +{answered.points} point{answered.points !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-white leading-relaxed mb-4">
                    {streamingState.questionText ? 
                      `Explanation coming soon...` : 
                      'This question tests your understanding of the learning objective.'
                    }
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-none p-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Target className="w-4 h-4" />
            <span className="text-sm">
              {isGenerating ? 'Generating...' : streamingState.isComplete ? 'Question ready' : 'Loading...'}
            </span>
          </div>

          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canProceed}
            className={`px-6 py-3 ${canProceed ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 opacity-50 cursor-not-allowed'} transition-all`}
          >
            {canProceed ? 'Next Question' : 'Answer First'}
          </Button>
        </div>
      </div>
    </div>
  );
};
