"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Question as AIQuestion } from "@sandbox-apps/ai"
import { ArrowLeft, BookOpen, Brain, Check, X, ChevronRight, Plus, RotateCcw, ArrowDown, ArrowRight, Target } from 'lucide-react'

interface MinimalQuizProps {
  job: {
    id: string
    url: string
    skills: string[]
    questions: any[]
    analysis?: any
    thinking?: string
  }
  onExit: () => void
}

interface QuestionData {
  question: AIQuestion | null
  streamingText: string
  loading: boolean
  answered: boolean | null
  showResult: boolean
  isStreaming: boolean
}

export const MinimalQuiz: React.FC<MinimalQuizProps> = ({ job, onExit }) => {
  const [mode, setMode] = useState<'quiz' | 'learn'>('quiz')
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionsData, setQuestionsData] = useState<{ [key: string]: QuestionData }>({})
  const [flashcards, setFlashcards] = useState<{ [key: string]: any[] | any | null }>({})
  const [previousQuestions, setPreviousQuestions] = useState<AIQuestion[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const flashcardsRef = useRef<HTMLDivElement>(null)

  const currentSkill = job.skills[currentSkillIndex]
  const questionKey = `${currentSkillIndex}-${currentQuestionIndex}`
  const currentQuestion = questionsData[questionKey]

  // Get questions count for current skill
  const getQuestionsForSkill = (skillIndex: number) => {
    return Object.keys(questionsData).filter((key) => key.startsWith(`${skillIndex}-`)).length
  }

  // Initialize first question or flashcard
  useEffect(() => {
    if (mode === 'quiz' && !questionsData[questionKey]) {
      loadQuestion();
    } else if (mode === 'learn' && (!flashcards[currentSkill] || flashcards[currentSkill].length === 0)) {
      loadFlashcard();
    }
  }, [questionKey, mode, currentSkill]);

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
      console.log('MinimalQuiz: Loading question for skill:', currentSkill);
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
                  setQuestionsData(prev => {
                    const current = prev[questionKey] || {};
                    return {
                      ...prev,
                      [questionKey]: {
                        ...current,
                        streamingText: (current.streamingText || '') + data.content
                      }
                    };
                  });
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
      setQuestionsData(prev => ({
        ...prev,
        [questionKey]: {
          ...prev[questionKey],
          question: {
            text: `What is a key concept in ${currentSkill}?`,
            answer: true,
            why: `${currentSkill} is an important skill.`,
            skill: currentSkill
          },
          loading: false,
          isStreaming: false
        }
      }));
    }
  };

  const loadFlashcard = async () => {
    try {
      console.log('MinimalQuiz: Loading flashcard for skill:', currentSkill);
      
      // Auto-scroll to bottom when starting to load
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
                  // Stream the title as it's being generated
                  setFlashcards(prev => ({
                    ...prev,
                    [`${currentSkill}-streaming`]: { title: streamingText, isStreaming: true }
                  }));
                  
                  // Auto-scroll during streaming
                  setTimeout(() => {
                    flashcardsRef.current?.scrollTo({
                      top: flashcardsRef.current.scrollHeight,
                      behavior: 'smooth'
                    });
                  }, 50);
                } else if (data.type === 'complete') {
                  setFlashcards(prev => ({
                    ...prev,
                    [currentSkill]: [...(prev[currentSkill] || []), data.content],
                    [`${currentSkill}-streaming`]: null
                  }));
                  
                  // Final scroll to show completed flashcard
                  setTimeout(() => {
                    flashcardsRef.current?.scrollTo({
                      top: flashcardsRef.current.scrollHeight,
                      behavior: 'smooth'
                    });
                  }, 100);
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
      setFlashcards(prev => ({
        ...prev,
        [currentSkill]: [...(prev[currentSkill] || []), {
          title: `Key ${currentSkill} Concept`,
          content: `${currentSkill} is an important technology with many key concepts.`,
          skill: currentSkill,
          tags: [currentSkill.toLowerCase()]
        }]
      }));
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

  const nextSkill = () => {
    if (currentSkillIndex < job.skills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  // Touch handlers for swipe
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Horizontal swipe (skills)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentSkillIndex > 0) {
        setCurrentSkillIndex(currentSkillIndex - 1);
        setCurrentQuestionIndex(0);
      } else if (deltaX < 0 && currentSkillIndex < job.skills.length - 1) {
        nextSkill();
      }
    }

    // Vertical swipe (questions)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      const questionsCount = getQuestionsForSkill(currentSkillIndex);
      if (deltaY > 0 && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (deltaY < 0 && currentQuestionIndex < questionsCount - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  return (
    <div
      className="h-screen bg-tertiary-9 text-primary-cosmos overflow-hidden flex flex-col font-geist-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      {/* Fixed Header */}
      <div className="flex-none bg-elandi-secondary border-b border-primary-fornax-2/10 px-6 py-4 card-corner">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-tertiary-4 hover:text-primary-cosmos transition-elandi font-dm-mono uppercase text-sm"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold flex items-center gap-3 justify-center font-geist-sans">
              <div className="w-8 h-8 rounded-lg bg-elandi-accent flex items-center justify-center">
                {mode === 'quiz' ? <Brain size={16} className="text-primary-stellar" /> : <BookOpen size={16} className="text-primary-stellar" />}
              </div>
              {mode === 'quiz' ? 'Quiz' : 'Learn'}
            </h1>
            <div className="text-sm text-tertiary-4 font-dm-mono uppercase">
              {currentSkill} • {mode === 'quiz'
                ? `Question ${currentQuestionIndex + 1}/${Math.max(1, getQuestionsForSkill(currentSkillIndex))}`
                : `${(flashcards[currentSkill] || []).length} cards`
              }
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-tertiary-4 font-dm-mono uppercase">
              {currentSkillIndex + 1}/{job.skills.length}
            </div>

            {/* Mode Toggle - Segmented Control */}
            <div className="flex bg-tertiary-8 rounded-lg p-1 border border-tertiary-6">
              <button
                onClick={() => setMode('quiz')}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-elandi font-dm-mono uppercase flex-1 justify-center ${
                  mode === 'quiz'
                    ? 'bg-secondary-ethereal-2 text-primary-stellar shadow-md font-bold'
                    : 'text-tertiary-4 hover:text-primary-cosmos hover:bg-tertiary-7'
                }`}
              >
                <Brain size={16} />
                Quiz
              </button>
              <button
                onClick={() => setMode('learn')}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-elandi font-dm-mono uppercase flex-1 justify-center ${
                  mode === 'learn'
                    ? 'bg-secondary-ethereal-2 text-primary-stellar shadow-md font-bold'
                    : 'text-tertiary-4 hover:text-primary-cosmos hover:bg-tertiary-7'
                }`}
              >
                <BookOpen size={16} />
                Learn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Progress */}
      <div className="flex-none bg-elandi-secondary border-b border-primary-fornax-2/10 px-6 py-4 card-corner">
        <div className="flex justify-center">
          <div className="flex gap-3">
            {job.skills.map((skill, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSkillIndex(index)
                  setCurrentQuestionIndex(0)
                }}
                className={`h-3 rounded-full transition-elandi font-dm-mono uppercase text-xs px-3 py-1 ${
                  index === currentSkillIndex
                    ? 'bg-secondary-ethereal-2 text-primary-stellar w-24'
                    : 'bg-tertiary-7 hover:bg-tertiary-6 text-tertiary-4 hover:text-primary-cosmos w-12'
                }`}
                title={skill}
              >
                {index === currentSkillIndex ? skill.substring(0, 8) + (skill.length > 8 ? '...' : '') : index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col px-6 py-6">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            {/* Current Skill Display */}
            <div className="flex-none mb-6 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 border-elandi-accent border rounded-xl mb-4">
                <div className="w-6 h-6 rounded-md bg-primary-stellar flex items-center justify-center">
                  <Target size={14} className="text-secondary-ethereal-2" />
                </div>
                <h2 className="text-2xl font-bold text-primary-stellar font-geist-sans">
                  {currentSkill}
                </h2>
              </div>
              <div className="text-tertiary-4 text-sm font-dm-mono uppercase">
                {mode === 'quiz' ? 'Testing your knowledge' : 'Learn the fundamentals'}
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center items-center gap-8">
              {mode === 'quiz' && currentQuestion && (
                <div className="w-full max-w-4xl flex justify-center">
                  <div className="flex items-center gap-6 w-full">
                    {/* Quiz Card - Centered */}
                    <div className="flex-1 max-w-2xl mx-auto">
                      {/* Streaming Question */}
                      {currentQuestion.isStreaming && (
                        <div className="bg-elandi-secondary rounded-xl border border-primary-fornax-2/10 p-8 flex flex-col card-corner">
                          <div className="text-center">
                            <div className="text-xl font-medium leading-relaxed text-primary-cosmos font-geist-sans">
                              {currentQuestion.streamingText}
                              <span className="animate-pulse text-secondary-ethereal-2 ml-1">|</span>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Question Card */}
                    {currentQuestion.question && !currentQuestion.isStreaming && (
                      <div className="bg-elandi-secondary rounded-xl border border-primary-fornax-2/10 p-8 transition-elandi card-corner">
                        {!currentQuestion.showResult ? (
                          <>
                            {/* Front of card - Question */}
                            <h3 className="text-xl font-medium mb-8 text-center leading-relaxed text-primary-cosmos font-geist-sans">
                              {currentQuestion.question.text}
                            </h3>

                            <div className="flex gap-6">
                              <button
                                onClick={() => handleAnswer(true)}
                                className="flex-1 bg-tertiary-8 hover:bg-tertiary-7 border-2 border-tertiary-6 hover:border-tertiary-5 rounded-xl p-6 transition-elandi hover:scale-[1.02] active:scale-[0.98] group"
                              >
                                <div className="flex flex-col items-center">
                                  <Check size={28} className="text-tertiary-4 mb-3 group-hover:text-secondary-ethereal-2 group-hover:scale-110 transition-elandi" />
                                  <div className="text-lg font-bold text-tertiary-4 group-hover:text-primary-cosmos font-dm-mono uppercase">TRUE</div>
                                </div>
                              </button>
                              <button
                                onClick={() => handleAnswer(false)}
                                className="flex-1 bg-tertiary-8 hover:bg-tertiary-7 border-2 border-tertiary-6 hover:border-tertiary-5 rounded-xl p-6 transition-elandi hover:scale-[1.02] active:scale-[0.98] group"
                              >
                                <div className="flex flex-col items-center">
                                  <X size={28} className="text-tertiary-4 mb-3 group-hover:text-secondary-ethereal-2 group-hover:scale-110 transition-elandi" />
                                  <div className="text-lg font-bold text-tertiary-4 group-hover:text-primary-cosmos font-dm-mono uppercase">FALSE</div>
                                </div>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Back of card - Explanation */}
                            <div className="text-center">
                              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-bold mb-6 font-dm-mono uppercase ${
                                currentQuestion.answered === currentQuestion.question.answer
                                  ? 'bg-semantic-success-1/20 text-semantic-success-2 border border-semantic-success-2/30'
                                  : 'bg-secondary-ethereal-1/20 text-secondary-ethereal-2 border border-secondary-ethereal-2/30'
                              }`}>
                                {currentQuestion.answered === currentQuestion.question.answer ? (
                                  <><Check size={20} /> Correct!</>
                                ) : (
                                  <><X size={20} /> Incorrect - Answer: {currentQuestion.question.answer ? 'True' : 'False'}</>
                                )}
                              </div>

                              <p className="text-primary-cosmos text-lg leading-relaxed font-geist-sans">
                                {currentQuestion.question.why}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Loading State */}
                    {currentQuestion.loading && !currentQuestion.isStreaming && !currentQuestion.question && (
                      <div className="bg-elandi-secondary rounded-xl border border-primary-fornax-2/10 p-8 flex flex-col items-center justify-center card-corner">
                        <div className="animate-spin w-10 h-10 border-3 border-secondary-ethereal-2 border-t-transparent rounded-full mb-6"></div>
                        <div className="text-tertiary-4 text-lg font-dm-mono uppercase">Loading question...</div>
                      </div>
                    )}
                  </div>

                    {/* Right Side - Next Skill Button */}
                    {currentQuestion.showResult && (
                      <div className="flex-none ml-6">
                        {currentSkillIndex < job.skills.length - 1 ? (
                          <button
                            onClick={nextSkill}
                            className="flex flex-col items-center gap-3 px-6 py-8 bg-secondary-ethereal-2 hover:bg-secondary-ethereal-1 text-primary-stellar rounded-xl transition-elandi hover:scale-105 shadow-lg font-dm-mono uppercase"
                          >
                            <ArrowRight size={28} />
                            <span className="text-sm text-center leading-tight">Next<br/>Skill</span>
                          </button>
                        ) : (
                          <button
                            onClick={onExit}
                            className="flex flex-col items-center gap-3 px-6 py-8 bg-semantic-success-2 hover:bg-semantic-success-2/90 text-primary-stellar rounded-xl transition-elandi hover:scale-105 shadow-lg font-dm-mono uppercase"
                          >
                            <Check size={28} />
                            <span className="text-sm text-center leading-tight">Finish<br/>Quiz</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom - More Questions Button */}
              {mode === 'quiz' && currentQuestion?.showResult && (
                <div className="flex-none">
                  <button
                    onClick={addQuestion}
                    className="flex flex-col items-center gap-3 px-8 py-5 bg-secondary-ethereal-2 hover:bg-secondary-ethereal-1 text-primary-stellar rounded-xl transition-elandi hover:scale-105 shadow-lg font-dm-mono uppercase"
                  >
                    <ArrowDown size={26} />
                    <span className="text-base font-bold">More Questions</span>
                  </button>
                </div>
              )}

              {/* Learn Mode - Flashcards */}
              {mode === 'learn' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Flashcards List - Scrollable */}
                  <div ref={flashcardsRef} className="flex-1 overflow-y-auto space-y-6 pr-2 pb-4pm i76\5['-43] scrollbar-thin scrollbar-thumb-tertiary-6 scrollbar-track-transparent min-h-0">
                    {(flashcards[currentSkill] || []).map((card: any, index: number) => (
                      <div key={index} className="bg-elandi-secondary border border-primary-fornax-2/10 rounded-xl p-6 animate-in slide-in-from-bottom duration-300 card-corner">
                        <div className="flex items-start gap-4">
                          <div className="w-4 h-4 bg-secondary-ethereal-2 rounded-full mt-1 flex-shrink-0"></div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary-cosmos mb-4 font-geist-sans">
                              {card.title}
                            </h3>
                            <p className="text-primary-cosmos leading-relaxed mb-4 text-lg font-geist-sans">
                              {card.content}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {card.tags?.map((tag: string, tagIndex: number) => (
                                <span
                                  key={tagIndex}
                                  className="px-3 py-1.5 bg-tertiary-8 border border-tertiary-6 text-tertiary-4 text-sm rounded-full font-dm-mono uppercase font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Streaming Flashcard at the end */}
                    {flashcards[`${currentSkill}-streaming`] && (
                      <div className="bg-elandi-secondary border-2 border-secondary-ethereal-2 rounded-xl p-6 animate-in slide-in-from-bottom duration-300 card-corner">
                        <div className="flex items-center justify-center gap-3 text-secondary-ethereal-2 mb-6">
                          <RotateCcw size={24} className="animate-spin" />
                          <span className="font-bold text-lg font-dm-mono uppercase">Generating flashcard...</span>
                        </div>
                        <div className="text-xl font-medium text-center leading-relaxed text-primary-cosmos font-geist-sans">
                          {flashcards[`${currentSkill}-streaming`]?.title || ''}
                          <span className="animate-pulse text-secondary-ethereal-2 ml-1">|</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Load More Flashcards - Fixed at bottom */}
                  <div className="flex-none pt-4">
                    <button
                      onClick={loadFlashcard}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-secondary-ethereal-2 hover:bg-secondary-ethereal-1 text-primary-stellar rounded-xl transition-elandi hover:scale-105 shadow-lg font-dm-mono uppercase font-bold text-lg"
                    >
                      <Plus size={20} />
                      Load More Knowledge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
};
