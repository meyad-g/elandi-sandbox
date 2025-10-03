'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProfile } from '@/lib/certifications';
import { Brain, Target, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
  tags: string[];
  objectiveId: string;
  objectiveTitle: string;
}

interface FixedFlashcardsProps {
  examProfile: ExamProfile;
}

export const FixedFlashcards: React.FC<FixedFlashcardsProps> = ({
  examProfile
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const currentCard = flashcards[currentCardIndex];

  useEffect(() => {
    if (flashcards.length === 0) {
      generateFlashcards();
    }
  }, []);

  const generateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const newFlashcards: Flashcard[] = [];
      
      // Generate flashcards for objectives
      for (const objective of examProfile.objectives.slice(0, 5)) { // Limit to prevent rate limits
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
          } else {
            console.error(`Failed to generate flashcard for ${objective.title}: ${response.status}`);
          }
          
          // Add delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(`Error generating flashcard for ${objective.title}:`, err);
        }
      }
      
      if (newFlashcards.length > 0) {
        setFlashcards(newFlashcards);
      } else {
        setError('Failed to generate flashcards. Rate limited - try again in a moment.');
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

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="flex items-center gap-2 text-white mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Creating Flashcards
          </div>
          <div className="text-white/70 text-sm">
            Generating study cards for {examProfile.name}...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center bg-red-500/20 border border-red-500/40 rounded-xl p-6 max-w-md">
          <h3 className="text-red-400 mb-3 font-bold">Error</h3>
          <p className="text-white text-sm mb-4">{error}</p>
          <button
            onClick={generateFlashcards}
            className="px-4 py-2 bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">No flashcards available</div>
          <button
            onClick={generateFlashcards}
            className="px-4 py-2 bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
          >
            Generate Flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto min-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-medium">Flashcards</h3>
          <div className="text-white/70 text-sm">{examProfile.name}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-white/70 text-sm">
            {currentCardIndex + 1} / {flashcards.length}
          </div>
          <div className="text-green-300 text-sm">
            {knownCards.size} known
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {currentCard && (
            <div className="relative h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  // Front of card
                  <motion.div
                    key="front"
                    initial={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white/20 border border-white/40 rounded-xl p-6 flex flex-col justify-center items-center shadow-lg"
                  >
                    <div className="text-purple-300 text-xs mb-3 text-center">
                      {currentCard.objectiveTitle}
                    </div>
                    <div className="text-white text-lg font-medium text-center leading-relaxed">
                      {currentCard.front}
                    </div>
                    <div className="text-white/60 text-xs mt-4">
                      Tap to reveal answer
                    </div>
                  </motion.div>
                ) : (
                  // Back of card
                  <motion.div
                    key="back"
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white/20 border border-white/40 rounded-xl p-6 flex flex-col justify-center shadow-lg"
                  >
                    <div className="text-purple-300 text-xs mb-3">
                      Answer:
                    </div>
                    <div className="text-white text-sm leading-relaxed mb-4">
                      {currentCard.back}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {currentCard.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-purple-500/30 border border-purple-400/50 rounded text-purple-200 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={previousCard}
          disabled={currentCardIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {isFlipped && (
          <div className="flex gap-2">
            <button
              onClick={markAsStudyMore}
              className="px-3 py-2 bg-orange-500/80 border border-orange-400 rounded text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Study More
            </button>
            <button
              onClick={markAsKnown}
              className="px-3 py-2 bg-green-500/80 border border-green-400 rounded text-white text-sm font-medium hover:bg-green-600 transition-colors"
            >
              I Know This
            </button>
          </div>
        )}

        <button
          onClick={nextCard}
          disabled={currentCardIndex === flashcards.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 border border-purple-400 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Reset */}
      <div className="text-center mt-4">
        <button
          onClick={() => {
            setCurrentCardIndex(0);
            setKnownCards(new Set());
            setIsFlipped(false);
          }}
          className="flex items-center gap-1 px-3 py-1 bg-white/10 border border-white/20 rounded text-white/70 text-xs hover:bg-white/15 hover:text-white transition-colors mx-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Progress
        </button>
      </div>
    </div>
  );
};
