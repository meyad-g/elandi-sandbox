'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Sparkles, ArrowRight } from 'lucide-react';

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

interface CompactQuestionDisplayProps {
  objectiveName: string;
  questionNumber: number;
  onAnswer: (answer: QuestionAnswer) => void;
  onNext: () => void;
  streamingState: StreamingQuestionState;
  isGenerating: boolean;
  answered?: QuestionAnswer;
}

export const CompactQuestionDisplay: React.FC<CompactQuestionDisplayProps> = ({
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

  // Reset state when question changes or switching objectives
  useEffect(() => {
    console.log(`🔄 Question ${questionNumber} - Resetting display state`);
    setSelectedOption(null);
    setShowExplanation(false);
  }, [questionNumber, streamingState.questionText]);

  // Update when answered
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
    
    console.log(`📝 Selected option ${optionIndex}, correct: ${correct}`);
    setSelectedOption(optionIndex);
    onAnswer(answer);
    
    // Small delay before showing explanation for better UX
    setTimeout(() => setShowExplanation(true), 300);
  };

  // Show explanation view (replaces entire question)
  if (showExplanation && streamingState.explanation) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl bg-white/25 border border-white/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
          >
            {/* Result Header */}
            <div className="text-center mb-8">
              {answered?.correct ? (
                <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-green-500 text-white font-bold text-xl shadow-xl">
                  <CheckCircle className="w-8 h-8" />
                  Excellent Work! 
                </div>
              ) : (
                <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-red-500 text-white font-bold text-xl shadow-xl">
                  <XCircle className="w-8 h-8" />
                  Not Quite Right
                </div>
              )}
              
              <div className="mt-4 px-6 py-2 bg-white/20 border border-white/40 rounded-full inline-block">
                <span className="text-white font-bold text-lg">
                  +{answered?.points || 0} point{(answered?.points || 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Your Answer */}
            <div className="mb-8">
              <h3 className="text-white/80 text-sm font-bold mb-3 uppercase tracking-wide">Your Answer</h3>
              <div className={`p-4 rounded-xl border-2 ${
                answered?.correct 
                  ? 'bg-green-500/20 border-green-400/60 text-green-100' 
                  : 'bg-red-500/20 border-red-400/60 text-red-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                    answered?.correct ? 'border-green-400 bg-green-500 text-white' : 'border-red-400 bg-red-500 text-white'
                  }`}>
                    {String.fromCharCode(65 + (selectedOption || 0))}
                  </div>
                  <span className="text-lg font-medium">
                    {streamingState.options[selectedOption || 0]?.text || 'Unknown option'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-8">
              <h3 className="text-white/80 text-sm font-bold mb-4 uppercase tracking-wide">Explanation</h3>
              <div className="text-white text-lg leading-relaxed">
                {streamingState.explanation}
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={onNext}
                className="inline-flex items-center gap-3 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg rounded-full shadow-xl transition-all hover:scale-105"
              >
                Continue Learning <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show question and options
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Question Text */}
          <AnimatePresence>
            {streamingState.questionText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white/25 border border-white/50 rounded-2xl p-8 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">Question {questionNumber}</span>
                    <span className="text-white/60 text-sm">• {objectiveName}</span>
                  </div>
                  <h3 className="text-white text-2xl font-bold leading-relaxed">
                    {streamingState.questionText}
                  </h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options */}
          <div className="space-y-4">
            <AnimatePresence>
              {streamingState.options.map((option, index) => {
                const isSelected = selectedOption === index;
                
                return (
                  <motion.div
                    key={`option-${index}`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 120
                    }}
                  >
                    <button
                      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 transform ${
                        isSelected
                          ? 'bg-purple-500/30 border-purple-400/70 text-purple-100 scale-[1.02] shadow-xl'
                          : 'bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 hover:scale-[1.01] shadow-lg'
                      }`}
                      disabled={!streamingState.isComplete}
                      onClick={() => handleOptionSelect(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full border-3 flex items-center justify-center font-bold text-lg transition-all ${
                          isSelected
                            ? 'border-purple-300 bg-purple-500 text-white shadow-lg'
                            : 'border-white/60 text-white/90 bg-white/10'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1 text-lg leading-relaxed font-medium">{option.text}</span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Options Loading */}
            {isGenerating && streamingState.questionText && streamingState.options.length < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-white/80 text-sm p-6 bg-white/15 border border-white/30 rounded-xl"
              >
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading answer options...</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Thinking Box - Bottom Right */}
      <AnimatePresence>
        {streamingState.thinking && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 20 }}
            className="fixed bottom-24 right-6 z-50 max-w-xs"
          >
            <div className="bg-black/95 backdrop-blur-xl border border-purple-500/50 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-purple-300 text-xs font-bold">Gemini AI</span>
              </div>
              <div className="text-white/90 text-xs leading-relaxed max-h-24 overflow-y-auto">
                {streamingState.thinking}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
