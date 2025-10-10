'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { CertificationQuizPage } from '../CertificationQuizPage';
import { Button } from '../../ui/Button';

interface FlashcardQuestionModeProps {
  question: {
    text: string;
    type: 'multiple_choice';
    options: string[];
    correct: number;
    why: string;
  };
  index: number;
  onAnswer: (answer: {selectedOption?: number; correct?: boolean}) => void;
  answered: {selectedOption?: number; correct?: boolean} | null;
  examName: string;
  objectiveName?: string;
  isStreaming?: boolean;
  streamingState?: {
    questionText: string;
    options: string[];
    explanation: string;
    correctAnswer: number;
    isComplete: boolean;
  };
  onNext: () => void;
  onBackToFlashcards: () => void;
  flashcardContext?: {
    title: string;
    id: string;
  };
}

export const FlashcardQuestionMode: React.FC<FlashcardQuestionModeProps> = ({
  question,
  index,
  onAnswer,
  answered,
  examName,
  objectiveName,
  isStreaming,
  streamingState,
  onNext,
  onBackToFlashcards,
  flashcardContext
}) => {
  return (
    <div className="space-y-4">
      {/* Flashcard Context Banner */}
      {flashcardContext && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Question from Flashcard</h3>
                <p className="text-cyan-300 text-sm">{flashcardContext.title}</p>
              </div>
            </div>
            
            <Button
              onClick={onBackToFlashcards}
              variant="outline"
              size="small"
              className="flex items-center gap-2 bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Flashcards
            </Button>
          </div>
        </motion.div>
      )}

      {/* Regular Question Display */}
      <CertificationQuizPage
        question={question}
        index={index}
        onAnswer={onAnswer}
        answered={answered}
        examName={examName}
        objectiveName={objectiveName}
        isStreaming={isStreaming}
        streamingState={streamingState}
        onNext={onNext}
      />
    </div>
  );
};
