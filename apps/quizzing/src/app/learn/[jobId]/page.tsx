'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  Check, 
  X, 
  Loader, 
  ArrowDown, 
  ArrowRight, 
  HelpCircle, 
  Target,
  Shuffle
} from 'lucide-react';
import type { Question as AIQuestion } from "@sandbox-apps/ai";

interface FlashcardData {
  title: string;
  content: string;
  skill: string;
  tags: string[];
}

interface QuestionData {
  question: AIQuestion | null;
  streamingText: string;
  loading: boolean;
  answered: boolean | null;
  showResult: boolean;
  isStreaming: boolean;
}

interface Job {
  id: string;
  url: string;
  skills: string[];
  analysis?: {
    jobTitle: string;
    company?: string;
    location?: string;
    salary?: string;
  };
}

export default function FreeFormLearningPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  
  // All hooks must be at the top
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'quiz' | 'learn'>('learn');
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState<{ [key: string]: QuestionData }>({});
  const [flashcards, setFlashcards] = useState<{ [key: string]: FlashcardData[] | { title: string; isStreaming: boolean; } | null }>({});
  const [previousQuestions, setPreviousQuestions] = useState<AIQuestion[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const flashcardsRef = useRef<HTMLDivElement>(null);

  // Swipe gesture state
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'up' | 'left' | 'down' | 'right' | null>(null);
  const [dragOverlayMessage, setDragOverlayMessage] = useState<string | null>(null);

  // Load job data from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('elandi-jobs');
    if (savedJobs) {
      try {
        const jobs: Job[] = JSON.parse(savedJobs);
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
          setJob(foundJob);
        }
      } catch (error) {
        console.error('Error loading job:', error);
      }
    }
    setLoading(false);
  }, [jobId]);

  // EXACTLY like original MinimalQuiz - compute these OUTSIDE useEffect (with safety checks) 
  const currentSkill = job?.skills?.[currentSkillIndex] || '';
  const questionKey = `${currentSkillIndex}-${currentQuestionIndex}`;
  const currentQuestion = questionsData[questionKey];

  // Get questions count for current skill - EXACTLY like original
  const getQuestionsForSkill = (skillIndex: number) => {
    return Object.keys(questionsData).filter((key) => key.startsWith(`${skillIndex}-`)).length;
  };

  // Initialize first question or flashcard - EXACTLY like original MinimalQuiz
  useEffect(() => {
    if (!job || !currentSkill) return;
    
    if (mode === 'quiz' && !questionsData[questionKey]) {
      loadQuestion();
    } else if (mode === 'learn' && (!flashcards[currentSkill] || (Array.isArray(flashcards[currentSkill]) && (flashcards[currentSkill] as FlashcardData[]).length === 0))) {
      loadFlashcard();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [questionKey, mode, currentSkill]); // Dependencies are intentionally limited to prevent infinite loops

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading learning content...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-white mb-4">Job Not Found</h2>
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const loadFlashcard = async () => {
    try {
      setTimeout(() => {
        flashcardsRef.current?.scrollTo({
          top: flashcardsRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      const response = await fetch('/api/generate-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: currentSkill,
          previousCards: flashcards[currentSkill] || []
        }),
      });

      if (!response.ok) throw new Error('Failed to generate flashcard');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamingText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);

                if (data.type === 'chunk') {
                  streamingText += data.content;
                  setFlashcards(prev => ({
                    ...prev,
                    [`${currentSkill}-streaming`]: { title: streamingText, isStreaming: true }
                  }));
                } else if (data.type === 'complete') {
                  setFlashcards(prev => {
                    const existing = prev[currentSkill];
                    const existingArray = Array.isArray(existing) ? existing : [];
                    const newArray = [...existingArray, data.content];
                    setCurrentFlashcardIndex(newArray.length - 1);
                    return {
                      ...prev,
                      [currentSkill]: newArray,
                      [`${currentSkill}-streaming`]: null
                    };
                  });
                  break;
                }
              } catch (parseError) {
                console.error('Parse error:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading flashcard:', error);
    }
  };

  const loadQuestion = async () => {
    setQuestionsData(prev => ({
      ...prev,
      [questionKey]: {
        question: null,
        streamingText: '',
        loading: true,
        answered: null,
        showResult: false,
        isStreaming: true
      }
    }));

    try {
      const response = await fetch('/api/generate-question-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: currentSkill,
          previousQuestions: previousQuestions
        }),
      });

      if (!response.ok) throw new Error('Failed to generate question');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);

                if (data.type === 'chunk') {
                  setQuestionsData(prev => ({
                    ...prev,
                    [questionKey]: {
                      ...(prev[questionKey] || {
                        question: null,
                        streamingText: '',
                        loading: false,
                        answered: null,
                        showResult: false,
                        isStreaming: true
                      }),
                      streamingText: ((prev[questionKey] || {}).streamingText || '') + data.content
                    } as QuestionData
                  }));
                } else if (data.type === 'complete') {
                  setQuestionsData(prev => ({
                    ...prev,
                    [questionKey]: {
                      ...prev[questionKey],
                      question: data.content,
                      streamingText: '',
                      isStreaming: false,
                      loading: false
                    }
                  }));
                  setPreviousQuestions(prev => [...prev, data.content]);
                  break;
                }
              } catch (parseError) {
                console.error('Parse error:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
  };

  const generateQuestionsFromFlashcard = async () => {
    const currentFlashcard = (flashcards[currentSkill] as FlashcardData[])?.[currentFlashcardIndex];
    if (!currentFlashcard || generatingQuestions) return;

    setGeneratingQuestions(true);
    
    try {
      const response = await fetch('/api/generate-questions-from-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcard: currentFlashcard,
          count: 3,
          difficulty: 'medium'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      const questions = data.questions || [];

      // Add generated questions to the questions data - EXACTLY like original
      questions.forEach((question: AIQuestion, index: number) => {
        const questionIndex = getQuestionsForSkill(currentSkillIndex) + index;
        const key = `${currentSkillIndex}-${questionIndex}`;
        
        setQuestionsData(prev => ({
          ...prev,
          [key]: {
            question,
            streamingText: '',
            loading: false,
            answered: null,
            showResult: false,
            isStreaming: false
          }
        }));
        
        setPreviousQuestions(prev => [...prev, question]);
      });

      // Switch to quiz mode and navigate to first generated question
      setMode('quiz');
      setCurrentQuestionIndex(getQuestionsForSkill(currentSkillIndex));

    } catch (error) {
      console.error('Error generating questions from flashcard:', error);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAnswer = (choice: boolean) => {
    if (!currentQuestion?.question) return;

    setQuestionsData(prev => ({
      ...prev,
      [questionKey]: {
        ...prev[questionKey],
        answered: choice,
        showResult: true
      }
    }));
  };

  const addQuestion = () => {
    const newQuestionIndex = getQuestionsForSkill(currentSkillIndex);
    setCurrentQuestionIndex(newQuestionIndex);
  };

  // Swipe gesture handlers - EXACTLY like original MinimalQuiz
  const handleSwipeUp = () => {
    if (mode === 'quiz' && currentQuestion?.showResult) {
      addQuestion();
    } else if (mode === 'learn') {
      // New flashcard for same skill - AnimatePresence will handle transition
      setCurrentFlashcardIndex(-1);
      loadFlashcard();
    }
  };

  const handleSwipeLeft = () => {
    if (mode === 'quiz' && currentQuestion?.showResult) {
      // Move to previous skill
      if (currentSkillIndex > 0) {
        setCurrentSkillIndex(currentSkillIndex - 1);
        setCurrentQuestionIndex(0);
      }
    } else if (mode === 'learn') {
      // Move to previous skill - AnimatePresence will handle transition
      if (currentSkillIndex > 0) {
        setCurrentSkillIndex(currentSkillIndex - 1);
        setCurrentFlashcardIndex(0);
      }
    }
  };

  const handleSwipeRight = () => {
    if (!job?.skills) return;
    
    if (mode === 'quiz' && currentQuestion?.showResult) {
      // Move to next skill
      if (currentSkillIndex < job.skills.length - 1) {
        setCurrentSkillIndex(currentSkillIndex + 1);
        setCurrentQuestionIndex(0);
      }
    } else if (mode === 'learn') {
      // Move to next skill - AnimatePresence will handle transition
      if (currentSkillIndex < job.skills.length - 1) {
        setCurrentSkillIndex(currentSkillIndex + 1);
        setCurrentFlashcardIndex(0);
      }
    }
  };

  const shuffleSkill = () => {
    if (!job?.skills || job.skills.length === 0) return;
    const randomIndex = Math.floor(Math.random() * job.skills.length);
    setCurrentSkillIndex(randomIndex);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <motion.div
        className="min-h-screen text-white overflow-hidden flex flex-col font-geist-sans"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="flex-none px-6 py-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white/50 transition-all duration-200 text-xs font-light"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="text-center">
              <h1 className="text-lg font-light text-white mb-1">{currentSkill || 'Loading...'}</h1>
              <div className="text-xs font-light text-white/60">
                <div>Free Form Learning • {job.analysis?.company || 'Company'}</div>
                <div>{mode === 'quiz' ? `Question ${currentQuestionIndex + 1}` : 'Exploring'}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={shuffleSkill}
                className="p-2 bg-black/70 backdrop-blur-md rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white/50 transition-all duration-200"
                title="Random skill"
              >
                <Shuffle size={14} />
              </button>
              
              <div className="flex bg-black/70 backdrop-blur-md rounded-full border border-white/30 p-1">
                <button
                  onClick={() => setMode('quiz')}
                  className={`px-4 py-2 rounded-full transition-all duration-200 text-xs font-light ${
                    mode === 'quiz'
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Quiz
                </button>
                <button
                  onClick={() => setMode('learn')}
                  className={`px-4 py-2 rounded-full transition-all duration-200 text-xs font-light ${
                    mode === 'learn'
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Learn
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills Navigation - Horizontal Scroll */}
        <motion.div
          className="flex-none px-6 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex justify-center max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(job.skills || []).map((skill, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSkillIndex(index);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 text-xs font-light whitespace-nowrap ${
                    index === currentSkillIndex
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-black/50 border border-white/30 text-white/80 hover:text-white hover:bg-black/60'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Learning Area */}
        <div className="flex-1 overflow-hidden" style={{ touchAction: 'manipulation' }}>
          <div className="h-full flex flex-col px-3 sm:px-4 py-4 sm:py-6 md:px-6">
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              
              {/* Content Container - Infinite Scroll Style */}
              <motion.div
                className="flex-1 flex flex-col justify-center items-center gap-4 md:gap-6 px-2 sm:px-4 md:px-0 min-h-0 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
              >
                
                {/* Drag Overlay */}
                <AnimatePresence>
                  {isDragging && dragOverlayMessage && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className={`px-6 py-3 rounded-full backdrop-blur-xl border text-sm font-medium ${
                          dragDirection === 'up' ? 'bg-purple-500/20 border-purple-400/50 text-purple-200' :
                          dragDirection === 'down' ? 'bg-orange-500/20 border-orange-400/50 text-orange-200' :
                          dragDirection === 'left' ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' :
                          dragDirection === 'right' ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200' :
                          'bg-white/20 border-white/50 text-white'
                        }`}
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                      >
                        {dragOverlayMessage}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Learn Mode - Flashcards */}
                <AnimatePresence mode="wait">
                  {mode === 'learn' && (
                    <motion.div
                      className="w-full max-w-4xl flex justify-center"
                      key={`flashcard-${currentSkillIndex}-${currentFlashcardIndex}`}
                      initial={{ opacity: 0.8, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="flex-1 max-w-xl sm:max-w-2xl mx-auto w-full relative min-h-[400px]">
                        <motion.div
                          className="relative bg-black/95 backdrop-blur-xl rounded-2xl border border-white/50 p-6 md:p-8 w-full min-h-[320px] flex flex-col"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                          drag
                          dragMomentum={false}
                          dragElastic={0.05}
                          onDrag={handleDrag}
                          onDragEnd={handleDragEnd}
                          whileDrag={{ scale: 1.01, rotate: isDragging ? (
                            dragDirection === 'left' ? -2 : 
                            dragDirection === 'right' ? 2 : 
                            dragDirection === 'up' ? -1 : 
                            dragDirection === 'down' ? 1 : 0
                          ) : 0 }}
                        >
                          <AnimatePresence mode="wait">
                            {/* Current Flashcard */}
                            {(flashcards[currentSkill] as FlashcardData[])?.[currentFlashcardIndex] && currentFlashcardIndex >= 0 && (
                              <motion.div
                                key={`${currentSkill}-${currentFlashcardIndex}`}
                                className="flex flex-col h-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <h3 className="text-lg md:text-xl font-light text-white mb-3 md:mb-4">
                                      {(flashcards[currentSkill] as FlashcardData[])[currentFlashcardIndex]?.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-white/90 font-light leading-relaxed mb-4 md:mb-6">
                                      {(flashcards[currentSkill] as FlashcardData[])[currentFlashcardIndex]?.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {(flashcards[currentSkill] as FlashcardData[])[currentFlashcardIndex]?.tags?.map((tag: string, tagIndex: number) => (
                                        <span
                                          key={tagIndex}
                                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs rounded-full font-light"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    
                                    {/* Quiz Me Button */}
                                    <motion.button
                                      onClick={generateQuestionsFromFlashcard}
                                      disabled={generatingQuestions}
                                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 hover:border-purple-400/50 rounded-full text-purple-300 hover:text-purple-200 transition-all duration-200 text-xs font-light disabled:opacity-50"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      {generatingQuestions ? (
                                        <>
                                          <Loader className="w-3 h-3 animate-spin" />
                                          Generating Questions...
                                        </>
                                      ) : (
                                        <>
                                          <HelpCircle className="w-3 h-3" />
                                          Quiz Me on This
                                        </>
                                      )}
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Streaming Flashcard */}
                            {flashcards[`${currentSkill}-streaming`] && (
                              <motion.div
                                key="streaming"
                                className="flex flex-col h-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 flex-1">
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1 min-h-0">
                                    <div className="text-base sm:text-lg md:text-xl font-medium text-white mb-3 sm:mb-4">
                                      {(flashcards[`${currentSkill}-streaming`] as { title: string; isStreaming: boolean; })?.title || ''}
                                      <motion.span
                                        className="text-cyan-400 ml-1"
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                      >
                                        |
                                      </motion.span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Empty state */}
                            {!(flashcards[currentSkill] as FlashcardData[])?.length && currentFlashcardIndex === 0 && !flashcards[`${currentSkill}-streaming`] && (
                              <motion.div
                                key="empty"
                                className="flex flex-col items-center justify-center h-full text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                                  <BookOpen className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-400 text-lg mb-4">Start Learning {currentSkill}</p>
                                <p className="text-slate-500 text-sm">Swipe up or click to generate your first flashcard</p>
                                <button
                                  onClick={loadFlashcard}
                                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full transition-colors text-sm"
                                >
                                  Generate Flashcard
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quiz Mode */}
                <AnimatePresence mode="wait">
                  {mode === 'quiz' && currentQuestion && (
                    <motion.div
                      className="w-full max-w-4xl flex justify-center"
                      key={`quiz-${currentSkillIndex}-${currentQuestionIndex}`}
                      initial={{ opacity: 0.8, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="relative w-full flex justify-center">
                        <div className="max-w-xl sm:max-w-2xl w-full relative min-h-[400px]">
                          <motion.div
                            className="relative bg-black/95 backdrop-blur-xl rounded-2xl border border-white/50 p-6 md:p-8 w-full min-h-[320px] flex flex-col"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                            drag={currentQuestion?.showResult}
                            dragMomentum={false}
                            dragElastic={0.05}
                            onDrag={currentQuestion?.showResult ? handleDrag : undefined}
                            onDragEnd={currentQuestion?.showResult ? handleDragEnd : undefined}
                            whileDrag={currentQuestion?.showResult ? { 
                              scale: 1.01, 
                              rotate: isDragging ? (
                                dragDirection === 'left' ? -2 : 
                                dragDirection === 'right' ? 2 : 
                                dragDirection === 'up' ? -1 : 
                                dragDirection === 'down' ? 1 : 0
                              ) : 0,
                              z: 1
                            } : {}}
                          >
                            <AnimatePresence mode="wait">
                              {/* Streaming State */}
                              {currentQuestion.isStreaming && (
                                <motion.div
                                  key="streaming"
                                  className="flex flex-col h-full"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <div className="flex-1 flex items-center justify-center text-center mb-8">
                                    <div className="text-lg md:text-xl font-light leading-relaxed text-white">
                                      {currentQuestion.streamingText}
                                      <motion.span
                                        className="text-cyan-400 ml-1"
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                      >
                                        |
                                      </motion.span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Question State */}
                              {currentQuestion.question && !currentQuestion.isStreaming && !currentQuestion.showResult && (
                                <motion.div
                                  key="question"
                                  className="flex flex-col h-full"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <div className="flex-1 flex items-center justify-center text-center mb-8">
                                    <h3 className="text-lg md:text-xl font-medium leading-relaxed text-white">
                                      {currentQuestion.question.text}
                                    </h3>
                                  </div>

                                  <div className="flex gap-4 justify-center">
                                    <button
                                      onClick={() => handleAnswer(true)}
                                      className="flex-1 max-w-40 group bg-white/10 hover:bg-green-500/20 border border-white/30 hover:border-green-400/50 rounded-2xl p-4 transition-all duration-200"
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 group-hover:bg-green-500/30 flex items-center justify-center">
                                          <Check size={16} className="text-green-400" />
                                        </div>
                                        <span className="text-xs font-light text-white">TRUE</span>
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => handleAnswer(false)}
                                      className="flex-1 max-w-40 group bg-white/10 hover:bg-red-500/20 border border-white/30 hover:border-red-400/50 rounded-2xl p-4 transition-all duration-200"
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center">
                                          <X size={16} className="text-red-400" />
                                        </div>
                                        <span className="text-xs font-light text-white">FALSE</span>
                                      </div>
                                    </button>
                                  </div>
                                </motion.div>
                              )}

                              {/* Result State */}
                              {currentQuestion.question && !currentQuestion.isStreaming && currentQuestion.showResult && (
                                <motion.div
                                  key="result"
                                  className="flex flex-col h-full justify-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <div className="text-center">
                                    <motion.div
                                      className={`inline-flex items-center gap-3 px-4 md:px-6 py-3 rounded-full text-base md:text-lg font-normal mb-6 uppercase ${
                                        currentQuestion.answered === currentQuestion.question.answer
                                          ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                                          : 'bg-red-500/20 text-red-300 border border-red-400/30'
                                      }`}
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                    >
                                      {currentQuestion.answered === currentQuestion.question.answer ? (
                                        <><Check size={20} className="text-green-300" /> Correct!</>
                                      ) : (
                                        <><X size={20} className="text-red-300" /> Incorrect - Answer: {currentQuestion.question.answer ? 'True' : 'False'}</>
                                      )}
                                    </motion.div>

                                    <p className="text-white/80 font-light text-base md:text-lg leading-relaxed">
                                      {currentQuestion.question.why}
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {/* Loading State */}
                              {currentQuestion?.loading && !currentQuestion.isStreaming && (
                                <motion.div
                                  key="loading"
                                  className="flex flex-col items-center justify-center h-full"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <div className="relative mb-6">
                                    <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                                    </div>
                                  </div>
                                  <div className="text-slate-400 text-lg font-medium">Loading question...</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Instructions */}
                <motion.div
                  className="text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center items-center gap-4 mb-3 flex-wrap text-xs font-light">
                    <div className="flex items-center gap-1 text-green-400">
                      <ArrowDown className="w-3 h-3" />
                      <span>{mode === 'quiz' ? 'New Q' : 'New Card'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <ArrowLeft className="w-3 h-3" />
                      <ArrowRight className="w-3 h-3" />
                      <span>Skills</span>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Target className="w-3 h-3" />
                      <span>Swipe to learn</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Drag handlers
  function handleDrag(_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) {
    const threshold = 50;
    const { offset } = info;
    
    if (!isDragging) {
      setIsDragging(true);
    }
    
    let newDirection: 'up' | 'left' | 'down' | 'right' | null = null;
    let overlayMessage: string | null = null;
    
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -threshold) {
        newDirection = 'up';
        overlayMessage = mode === 'quiz' && currentQuestion?.showResult ? 'New question' : 'New flashcard';
      } else if (offset.y > threshold) {
        newDirection = 'down';
        overlayMessage = 'Swipe further for more';
      }
    } else {
      if (offset.x < -threshold) {
        newDirection = 'left';
        overlayMessage = currentSkillIndex > 0 ? 'Previous skill' : null;
      } else if (offset.x > threshold) {
        newDirection = 'right';
        overlayMessage = (job?.skills && currentSkillIndex < job.skills.length - 1) ? 'Next skill' : null;
      }
    }
    
    setDragDirection(newDirection);
    setDragOverlayMessage(overlayMessage);
  }

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) {
    const threshold = 100;
    const { offset, velocity } = info;
    
    setIsDragging(false);
    setDragDirection(null);
    setDragOverlayMessage(null);
    
    const swipeDetected = (
      Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500 ||
      Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500
    );
    
    if (swipeDetected) {
      if (offset.y < -threshold || velocity.y < -500) {
        handleSwipeUp();
      } else if (offset.x < -threshold || velocity.x < -500) {
        handleSwipeLeft();
      } else if (offset.x > threshold || velocity.x > 500) {
        handleSwipeRight();
      }
    }
  }
}
