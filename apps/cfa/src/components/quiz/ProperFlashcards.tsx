'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ExamProfile } from '@/lib/certifications';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Check, X } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
  tags: string[];
  objectiveId: string;
  objectiveTitle: string;
}

interface ProperFlashcardsProps {
  examProfile: ExamProfile;
}

export const ProperFlashcards: React.FC<ProperFlashcardsProps> = ({
  examProfile
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const currentCard = flashcards[currentCardIndex];
  const totalKnown = knownCards.size;
  const progressPercent = flashcards.length > 0 ? Math.round((totalKnown / flashcards.length) * 100) : 0;

  useEffect(() => {
    if (flashcards.length === 0) {
      generateFlashcards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const newFlashcards: Flashcard[] = [];
      
      // Generate fewer cards to avoid rate limits
      for (const objective of examProfile.objectives.slice(0, 3)) {
        try {
          console.log(`Generating flashcard for ${objective.title}...`);
          
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
            console.error(`Failed: ${response.status}`);
          }
          
          // Delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch {
          console.error(`Error generating flashcard`);
        }
      }
      
      if (newFlashcards.length > 0) {
        setFlashcards(newFlashcards);
      } else {
        setError('Rate limited. Try again in a moment.');
      }
    } catch (err) {
      setError('Failed to generate flashcards.');
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
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-white mb-2">Creating Flashcards</div>
          <div className="text-white/70 text-sm">This may take a moment...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-red-500/20 border border-red-500/40 rounded-xl p-6">
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
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <div className="text-white mb-4">No flashcards yet</div>
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
    <div className="p-4 max-w-4xl mx-auto min-h-[70vh] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-medium">Flashcards</div>
            <div className="text-white/60 text-sm">{examProfile.name}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-white/70 text-sm">
            {currentCardIndex + 1} / {flashcards.length}
          </div>
          <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
            <span className="text-green-300 text-sm">{totalKnown} known ({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Main Flashcard - Bigger and properly spaced */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="w-full max-w-2xl">
          {currentCard && (
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-80 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  // Front of card
                  <motion.div
                    key="front"
                    initial={{ rotateY: 0 }}
                    exit={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-white/20 border border-white/40 rounded-2xl p-8 flex flex-col justify-center shadow-xl backdrop-blur-md"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-center">
                      <div className="text-purple-300 text-sm mb-4">{currentCard.objectiveTitle}</div>
                      <div className="text-white text-xl font-bold leading-relaxed mb-6">
                        {currentCard.front}
                      </div>
                      <div className="text-white/60 text-sm">
                        Click to reveal answer
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Back of card
                  <motion.div
                    key="back"
                    initial={{ rotateY: -180 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-white/20 border border-white/40 rounded-2xl p-6 flex flex-col shadow-xl backdrop-blur-md overflow-y-auto"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-purple-300 text-sm mb-3">{currentCard.objectiveTitle}</div>
                    
                    {/* Properly rendered content */}
                    <div className="flex-1 overflow-y-auto text-white text-sm leading-relaxed">
                      <ReactMarkdown 
                        components={{
                          p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                          strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                          em: ({children}) => <em className="text-purple-200">{children}</em>,
                          code: ({children}) => <code className="bg-black/40 px-1 py-0.5 rounded text-purple-200">{children}</code>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                          li: ({children}) => <li className="text-white/90">{children}</li>
                        }}
                      >
                        {currentCard.back}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Tags */}
                    {currentCard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-white/20">
                        {currentCard.tags.slice(0, 4).map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-purple-500/30 border border-purple-400/50 rounded text-purple-200 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation - Clean and spaced */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousCard}
          disabled={currentCardIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Study actions - only show when flipped */}
        {isFlipped && (
          <div className="flex gap-3">
            <button
              onClick={markAsStudyMore}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/80 border border-orange-400 rounded text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Study More
            </button>
            <button
              onClick={markAsKnown}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/80 border border-green-400 rounded text-white text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <Check className="w-4 h-4" />
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

      {/* Reset button */}
      <div className="text-center mt-4">
        <button
          onClick={() => {
            setCurrentCardIndex(0);
            setKnownCards(new Set());
            setIsFlipped(false);
          }}
          className="flex items-center gap-1 px-3 py-1 bg-white/10 border border-white/20 rounded text-white/70 text-xs hover:bg-white/15 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Progress
        </button>
      </div>
    </div>
  );
};
