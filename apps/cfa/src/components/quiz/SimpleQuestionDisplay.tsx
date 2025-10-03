'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, ArrowRight } from 'lucide-react';

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

interface SimpleQuestionDisplayProps {
  objectiveName: string;
  questionNumber: number;
  onAnswer: (answer: QuestionAnswer) => void;
  onNext: () => void;
  streamingState: StreamingQuestionState;
  isGenerating: boolean;
  answered?: QuestionAnswer;
}

export const SimpleQuestionDisplay: React.FC<SimpleQuestionDisplayProps> = ({
  objectiveName,
  questionNumber,
  onAnswer,
  onNext,
  streamingState,
  answered
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Reset when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
  }, [questionNumber, streamingState.questionText]);

  useEffect(() => {
    if (answered) {
      setSelectedOption(answered.selectedOption);
      setShowExplanation(true);
    }
  }, [answered]);

  const handleOptionSelect = (optionIndex: number) => {
    if (showExplanation || !streamingState.isComplete) return;
    
    const correct = optionIndex === streamingState.correctAnswer;
    const answer: QuestionAnswer = {
      selectedOption: optionIndex,
      correct,
      points: correct ? 1 : 0
    };
    
    setSelectedOption(optionIndex);
    onAnswer(answer);
    setTimeout(() => setShowExplanation(true), 100);
  };

  // Show explanation (replaces everything)
  if (showExplanation && streamingState.explanation) {
    return (
      <div className="p-4 max-w-xl mx-auto min-h-[70vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Result badge */}
          <div className="text-center">
            {answered?.correct ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium">
                <CheckCircle className="w-4 h-4" />
                Correct
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium">
                <XCircle className="w-4 h-4" />
                Incorrect
              </div>
            )}
          </div>

          {/* Your answer */}
          <div className="bg-white/15 border border-white/30 rounded-lg p-4">
            <div className="text-white/70 text-sm mb-2">Your Answer:</div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                {String.fromCharCode(65 + (selectedOption || 0))}
              </span>
              <span className="text-white text-sm">
                {streamingState.options[selectedOption || 0]?.text || ''}
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white/15 border border-white/30 rounded-lg p-4">
            <div className="text-white/70 text-sm mb-2">Explanation:</div>
            <div className="text-white text-sm leading-relaxed">
              {streamingState.explanation}
            </div>
          </div>

          {/* Continue button */}
          <div className="text-center pt-2">
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show question
  return (
    <div className="p-4 max-w-xl mx-auto min-h-[70vh] flex flex-col justify-center">
      <div className="space-y-4">
        
        {/* Question info */}
        <div className="text-center">
          <div className="text-white/70 text-sm">Question {questionNumber}</div>
          <div className="text-purple-300 text-sm">{objectiveName}</div>
        </div>

        {/* Question text */}
        <AnimatePresence>
          {streamingState.questionText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/15 border border-white/30 rounded-lg p-4"
            >
              <div className="text-white font-medium leading-relaxed">
                {streamingState.questionText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-2">
          {streamingState.options.map((option, index) => {
            const isSelected = selectedOption === index;
            
            return (
              <motion.button
                key={`option-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400/50 text-purple-100'
                    : 'bg-white/10 border-white/30 text-white hover:bg-white/15'
                }`}
                disabled={!streamingState.isComplete}
                onClick={() => handleOptionSelect(index)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded border flex items-center justify-center text-sm font-bold ${
                    isSelected ? 'border-purple-400 bg-purple-500 text-white' : 'border-white/40 text-white/80'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-sm">{option.text}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Compact thinking box */}
      <AnimatePresence>
        {streamingState.thinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 max-w-sm z-50"
          >
            <div className="bg-black/90 border border-purple-500/40 rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300 text-xs">Thinking...</span>
              </div>
              <div className="text-white/80 text-xs leading-tight">
                {streamingState.thinking.slice(0, 60)}...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
