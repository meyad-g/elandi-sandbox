'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  RotateCcw, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  Brain,
  Plus
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface FlashcardData {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  objectiveId: string;
  sourceQuestionId?: string;
}

interface FlashcardAnswer {
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: 'again' | 'hard' | 'good' | 'easy';
  timeSpent: number;
}

interface FlashcardStudyModeProps {
  flashcard: FlashcardData | null;
  flashcardIndex: number;
  totalFlashcards: number;
  objectiveName?: string;
  examName: string;
  isGenerating?: boolean;
  onAnswer: (answer: FlashcardAnswer) => void;
  onNext: () => void;
  onPrevious: () => void;
  onGenerateQuestion: () => void;
  onGenerateNewFlashcard: () => void;
}

export const FlashcardStudyMode: React.FC<FlashcardStudyModeProps> = ({
  flashcard,
  flashcardIndex,
  totalFlashcards,
  objectiveName,
  examName,
  isGenerating = false,
  onAnswer,
  onNext,
  onPrevious,
  onGenerateQuestion,
  onGenerateNewFlashcard
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime] = useState(new Date());
  const [answered, setAnswered] = useState(false);
  
  // Swipe gesture state
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleMasteryRating = (masteryLevel: 'again' | 'hard' | 'good' | 'easy') => {
    if (!flashcard || answered) return;
    
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    
    const answer: FlashcardAnswer = {
      difficulty: flashcard.difficulty,
      masteryLevel,
      timeSpent
    };
    
    setAnswered(true);
    onAnswer(answer);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      onNext();
      setIsFlipped(false);
      setAnswered(false);
    }, 1000);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0) {
        // Swiped right - previous flashcard
        onPrevious();
      } else {
        // Swiped left - next flashcard  
        onNext();
      }
    }
    
    setIsDragging(false);
    setDragDirection(null);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    setIsDragging(true);
    setDragDirection(offset.x > 50 ? 'right' : offset.x < -50 ? 'left' : null);
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Generating Flashcard...</h3>
          <p className="text-white/70">Creating a learning card for {objectiveName}</p>
        </div>
      </div>
    );
  }

  if (!flashcard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <Brain className="w-16 h-16 text-white/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Flashcards Yet</h3>
        <p className="text-white/70 text-center mb-6">
          Generate your first flashcard for {objectiveName} to start learning
        </p>
        <Button
          onClick={onGenerateNewFlashcard}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Flashcard
        </Button>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/40',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    hard: 'bg-red-500/20 text-red-400 border-red-500/40'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h2 className="text-2xl font-bold text-white">{examName} Flashcards</h2>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyColors[flashcard.difficulty]}`}>
            {flashcard.difficulty.charAt(0).toUpperCase() + flashcard.difficulty.slice(1)}
          </div>
        </div>
        <p className="text-white/70">
          {objectiveName} • Card {flashcardIndex + 1} of {totalFlashcards}
        </p>
      </div>

      {/* Flashcard Container */}
      <div ref={constraintsRef} className="relative">
        {/* Swipe indicators */}
        <AnimatePresence>
          {isDragging && dragDirection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 ${
                dragDirection === 'left' 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-purple-400 bg-purple-400/10'
              }`}
            >
              <div className="text-center">
                {dragDirection === 'left' ? (
                  <>
                    <ArrowRight className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-400 font-medium">Next Card</p>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-400 font-medium">Previous Card</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flashcard */}
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.98 }}
          className="relative perspective-1000"
        >
          <motion.div
            className="relative w-full h-96 cursor-pointer preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/20 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">{flashcard.title}</h3>
                <p className="text-white/60 mb-4">Tap to reveal content</p>
                <RotateCcw className="w-6 h-6 text-white/40 mx-auto" />
              </div>
            </div>

            {/* Back of card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/20 rounded-2xl p-8">
              <div className="h-full flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4">{flashcard.title}</h3>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{flashcard.content}</p>
                </div>
                
                {/* Tags */}
                {flashcard.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {flashcard.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Actions */}
      {isFlipped && !answered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* How well did you know this? */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4">How well did you know this?</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleMasteryRating('again')}
                variant="outline"
                className="flex flex-col gap-1 p-4 bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20"
              >
                <span className="font-medium">Again</span>
                <span className="text-xs">&lt; 1 day</span>
              </Button>
              <Button
                onClick={() => handleMasteryRating('hard')}
                variant="outline"
                className="flex flex-col gap-1 p-4 bg-orange-500/10 border-orange-500/40 text-orange-400 hover:bg-orange-500/20"
              >
                <span className="font-medium">Hard</span>
                <span className="text-xs">1-3 days</span>
              </Button>
              <Button
                onClick={() => handleMasteryRating('good')}
                variant="outline"
                className="flex flex-col gap-1 p-4 bg-blue-500/10 border-blue-500/40 text-blue-400 hover:bg-blue-500/20"
              >
                <span className="font-medium">Good</span>
                <span className="text-xs">3-7 days</span>
              </Button>
              <Button
                onClick={() => handleMasteryRating('easy')}
                variant="outline"
                className="flex flex-col gap-1 p-4 bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20"
              >
                <span className="font-medium">Easy</span>
                <span className="text-xs">1-2 weeks</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={flashcardIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={onGenerateQuestion}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Generate Question
          </Button>
          <Button
            onClick={onGenerateNewFlashcard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Card
          </Button>
        </div>

        <Button
          onClick={onNext}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
