'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProfile } from '@/lib/certifications';
import { Brain, Target, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
  tags: string[];
  objectiveId: string;
  objectiveTitle: string;
}

interface FlashcardsModeProps {
  examProfile: ExamProfile;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  examProfile
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const currentCard = flashcards[currentCardIndex];
  const progress = flashcards.length > 0 ? Math.round(((currentCardIndex + 1) / flashcards.length) * 100) : 0;

  useEffect(() => {
    // Generate initial flashcards when component mounts
    if (flashcards.length === 0) {
      generateFlashcardsForAllObjectives();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateFlashcardsForAllObjectives = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const newFlashcards: Flashcard[] = [];
      
      // Generate 1-2 flashcards per objective
      for (const objective of examProfile.objectives) {
        try {
          const response = await fetch('/api/v2/generate-flashcard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId: examProfile.id,
              objectiveId: objective.id
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.flashcard) {
              newFlashcards.push({
                front: data.flashcard.title,
                back: data.flashcard.content,
                tags: data.flashcard.tags || [],
                objectiveId: objective.id,
                objectiveTitle: objective.title
              });
            }
          }
        } catch (err) {
          console.error(`Error generating flashcard for ${objective.title}:`, err);
          // Continue with other objectives
        }
      }
      
      if (newFlashcards.length > 0) {
        setFlashcards(newFlashcards);
      } else {
        setError('Failed to generate any flashcards. Please try again.');
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const markAsKnown = () => {
    setKnownCards(prev => new Set([...prev, currentCardIndex]));
    nextCard();
  };

  const markAsStudyMore = () => {
    setKnownCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCardIndex);
      return newSet;
    });
    nextCard();
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <div className="flex items-center gap-2 text-white text-xl mb-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Creating Flashcards
          </div>
          <div className="text-white/70">
            Generating study cards for {examProfile.name}...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-red-500/20 border border-red-500/40 rounded-2xl p-8 max-w-md">
          <h3 className="text-red-400 mb-4 text-xl font-bold">Error</h3>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={generateFlashcardsForAllObjectives}
            className="px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4 text-xl">No flashcards available</div>
          <button
            onClick={generateFlashcardsForAllObjectives}
            className="px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
          >
            Generate Flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Flashcards</h2>
            <div className="text-white/70 text-sm">{examProfile.name}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white/10 border border-white/30 rounded-full">
            <span className="text-white font-medium">
              {currentCardIndex + 1} / {flashcards.length}
            </span>
          </div>
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full">
            <span className="text-green-300 font-medium">
              {knownCards.size} known
            </span>
          </div>
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div 
                  className="w-full h-96 cursor-pointer perspective-1000"
                  onClick={flipCard}
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-white/15 border border-white/40 rounded-2xl p-8 flex flex-col justify-center items-center shadow-2xl backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span className="text-cyan-300 text-sm font-bold">Study This</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold text-center leading-relaxed">
                        {currentCard.front}
                      </h3>
                      <div className="mt-6 text-white/60 text-sm">
                        Click to reveal answer
                      </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white/15 border border-white/40 rounded-2xl p-8 flex flex-col justify-center shadow-2xl backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 text-sm font-bold">{currentCard.objectiveTitle}</span>
                      </div>
                      <div className="text-white text-lg leading-relaxed mb-6">
                        {currentCard.back}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentCard.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-3 py-1 bg-purple-500/30 border border-purple-400/50 rounded-full text-purple-200 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={previousCard}
          disabled={currentCardIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {isFlipped && (
          <div className="flex gap-3">
            <button
              onClick={markAsStudyMore}
              className="px-6 py-3 bg-orange-500/80 border border-orange-400 rounded-full text-white font-medium hover:bg-orange-600 transition-colors"
            >
              Study More
            </button>
            <button
              onClick={markAsKnown}
              className="px-6 py-3 bg-green-500/80 border border-green-400 rounded-full text-white font-medium hover:bg-green-600 transition-colors"
            >
              I Know This
            </button>
          </div>
        )}

        <button
          onClick={nextCard}
          disabled={currentCardIndex === flashcards.length - 1}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 border border-purple-400 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
