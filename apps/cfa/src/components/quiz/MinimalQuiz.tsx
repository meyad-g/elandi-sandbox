"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import type { Question as AIQuestion, SkillAnalysisResult } from "@sandbox-apps/ai"

interface FlashcardData {
  title: string;
  content: string;
  skill: string;
  tags: string[];
}

// Using AIQuestion directly
import { ArrowLeft, BookOpen, Check, X, Loader, ArrowDown, ArrowRight } from 'lucide-react'

interface MinimalQuizProps {
  job: {
    id: string
    url: string
    skills: string[]
    questions: AIQuestion[]
    analysis?: SkillAnalysisResult
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
  const [flashcards, setFlashcards] = useState<{ [key: string]: FlashcardData[] | { title: string; isStreaming: boolean; } | null }>({})
  const [previousQuestions, setPreviousQuestions] = useState<AIQuestion[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const skillsRef = useRef<HTMLDivElement>(null)
  const flashcardsRef = useRef<HTMLDivElement>(null)

  const currentSkill = job.skills[currentSkillIndex]
  const questionKey = `${currentSkillIndex}-${currentQuestionIndex}`
  const currentQuestion = questionsData[questionKey]

  // Swipe gesture state
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'up' | 'left' | 'down' | 'right' | null>(null)
  const [dragOverlayMessage, setDragOverlayMessage] = useState<string | null>(null)
  const [showFlashcardHistory, setShowFlashcardHistory] = useState(false)
  const [showQuizHistory, setShowQuizHistory] = useState(false)
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)

  // Get questions count for current skill
  const getQuestionsForSkill = (skillIndex: number) => {
    return Object.keys(questionsData).filter((key) => key.startsWith(`${skillIndex}-`)).length
  }

  // Initialize first question or flashcard
  useEffect(() => {
    if (mode === 'quiz' && !questionsData[questionKey]) {
      loadQuestion()
    } else if (mode === 'learn' && (!flashcards[currentSkill] || (Array.isArray(flashcards[currentSkill]) && (flashcards[currentSkill] as FlashcardData[]).length === 0))) {
      loadFlashcard()
    }
  }, [questionKey, mode, currentSkill]) // Dependencies are intentionally limited to prevent infinite loops

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
    }))

    try {
      const response = await fetch('/api/generate-question-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: currentSkill,
          previousQuestions: previousQuestions
        }),
      })

      if (!response.ok) throw new Error('Failed to generate question')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)

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
                  }))
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
                  }))
                  setPreviousQuestions(prev => [...prev, data.content])
                  break
                }
              } catch (parseError) {
                console.error('Parse error:', parseError)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading question:', error)
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
      }))
    }
  }

  const loadFlashcard = async () => {
    try {
      setTimeout(() => {
        flashcardsRef.current?.scrollTo({
          top: flashcardsRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)

      const response = await fetch('/api/generate-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: currentSkill,
          previousCards: flashcards[currentSkill] || []
        }),
      })

      if (!response.ok) throw new Error('Failed to generate flashcard')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let streamingText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)

                if (data.type === 'chunk') {
                  streamingText += data.content
                  setFlashcards(prev => ({
                    ...prev,
                    [`${currentSkill}-streaming`]: { title: streamingText, isStreaming: true }
                  }))

                  setTimeout(() => {
                    flashcardsRef.current?.scrollTo({
                      top: flashcardsRef.current.scrollHeight,
                      behavior: 'smooth'
                    })
                  }, 50)
                } else if (data.type === 'complete') {
                  setFlashcards(prev => {
                    const existing = prev[currentSkill];
                    const existingArray = Array.isArray(existing) ? existing : [];
                    const newArray = [...existingArray, data.content];
                    // Set current index to the newest flashcard
                    setCurrentFlashcardIndex(newArray.length - 1);
                    return {
                      ...prev,
                      [currentSkill]: newArray,
                      [`${currentSkill}-streaming`]: null
                    };
                  })

                  setTimeout(() => {
                    flashcardsRef.current?.scrollTo({
                      top: flashcardsRef.current.scrollHeight,
                      behavior: 'smooth'
                    })
                  }, 100)
                  break
                }
              } catch (parseError) {
                console.error('Parse error:', parseError)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading flashcard:', error)
      setFlashcards(prev => {
        const existing = prev[currentSkill];
        const existingArray = Array.isArray(existing) ? existing : [];
        return {
          ...prev,
          [currentSkill]: [...existingArray, {
            title: `Key ${currentSkill} Concept`,
            content: `${currentSkill} is an important technology with many key concepts.`,
            skill: currentSkill,
            tags: [currentSkill.toLowerCase()]
          }]
        };
      })
    }
  }

  const handleAnswer = (choice: boolean) => {
    if (!currentQuestion?.question) return

    setQuestionsData(prev => ({
      ...prev,
      [questionKey]: {
        ...prev[questionKey],
        answered: choice,
        showResult: true
      }
    }))
  }

  const addQuestion = () => {
    const newQuestionIndex = getQuestionsForSkill(currentSkillIndex)
    setCurrentQuestionIndex(newQuestionIndex)
  }

  // Swipe gesture handlers
  const handleSwipeUp = () => {
    if (mode === 'quiz' && currentQuestion?.showResult) {
      addQuestion()
    } else if (mode === 'learn') {
      // New flashcard for same skill - AnimatePresence will handle transition
      setCurrentFlashcardIndex(-1)
      loadFlashcard()
    }
  }

  const handleSwipeLeft = () => {
    if (mode === 'quiz' && currentQuestion?.showResult) {
      // Move to previous skill
      if (currentSkillIndex > 0) {
        setCurrentSkillIndex(currentSkillIndex - 1)
        setCurrentQuestionIndex(0)
      }
      // If currentSkillIndex === 0, no action taken, card will snap back
    } else if (mode === 'learn') {
      // Move to previous skill - AnimatePresence will handle transition
      if (currentSkillIndex > 0) {
        setCurrentSkillIndex(currentSkillIndex - 1)
        setCurrentFlashcardIndex(0)
      }
      // If currentSkillIndex === 0, no action taken, card will snap back
    }
  }

  const handleSwipeRight = () => {
    if (mode === 'quiz' && currentQuestion?.showResult) {
      // Move to next skill
      if (currentSkillIndex < job.skills.length - 1) {
        nextSkill()
      }
      // If on last skill in quiz mode, handled by nextSkill logic
    } else if (mode === 'learn') {
      // Move to next skill - AnimatePresence will handle transition
      if (currentSkillIndex < job.skills.length - 1) {
        setCurrentSkillIndex(currentSkillIndex + 1)
        setCurrentFlashcardIndex(0)
      }
      // If on last skill, no action taken, card will snap back
    }
  }

  const handleSwipeDown = () => {
    if (mode === 'quiz') {
      // Show quiz history
      setShowQuizHistory(true)
    } else if (mode === 'learn') {
      setShowFlashcardHistory(true)
    }
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const threshold = 100
    const { offset, velocity } = info
    
    setIsDragging(false)
    setDragDirection(null)
    setDragOverlayMessage(null)
    
    // Check if swipe threshold was met
    const swipeDetected = (
      Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500 ||
      Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500
    )
    
    if (swipeDetected) {
      // Swipe up - new question/flashcard
      if (offset.y < -threshold || velocity.y < -500) {
        handleSwipeUp()
      }
      // Swipe down - show flashcard history
      else if (offset.y > threshold || velocity.y > 500) {
        handleSwipeDown()
      }
      // Swipe left - next skill or flashcard history
      else if (offset.x < -threshold || velocity.x < -500) {
        handleSwipeLeft()
      }
      // Swipe right - new flashcard (learn mode only)  
      else if (offset.x > threshold || velocity.x > 500) {
        handleSwipeRight()
      }
    }
  }

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const threshold = 50
    const { offset } = info
    
    if (!isDragging) {
      setIsDragging(true)
    }
    
    // Determine drag direction for visual feedback
    let newDirection: 'up' | 'left' | 'down' | 'right' | null = null
    let overlayMessage: string | null = null
    
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -threshold) {
        newDirection = 'up'
        if (mode === 'quiz' && currentQuestion?.showResult) {
          overlayMessage = 'Release for more questions'
        } else if (mode === 'learn') {
          overlayMessage = 'Release for new flashcard'
        }
      } else if (offset.y > threshold) {
        newDirection = 'down'
        overlayMessage = 'Release to view history'
      }
    } else {
      if (offset.x < -threshold) {
        newDirection = 'left'
        if (currentSkillIndex > 0) {
          overlayMessage = 'Release for previous skill'
        } else {
          overlayMessage = null // No action available, will snap back
        }
      } else if (offset.x > threshold) {
        newDirection = 'right'
        if (currentSkillIndex < job.skills.length - 1) {
          overlayMessage = 'Release for next skill'
        } else if (mode === 'quiz') {
          overlayMessage = 'Release to finish quiz'
        } else {
          overlayMessage = null // No action available, will snap back
        }
      }
    }
    
    setDragDirection(newDirection)
    setDragOverlayMessage(overlayMessage)
  }

  const nextSkill = () => {
    if (currentSkillIndex < job.skills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1)
      setCurrentQuestionIndex(0)
    }
  }


  return (
    <motion.div
      className="min-h-screen text-white overflow-hidden flex flex-col font-geist-sans"
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >

      {/* Minimal Clean Header */}
      <motion.div
        className="flex-none px-6 py-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <motion.button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white/50 transition-all duration-200 text-xs font-light"
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ filter: "url(#glass-effect)" }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </motion.button>

          <div className="text-center">
            <h1 className="text-lg font-light text-white mb-1">{currentSkill}</h1>
            <div className="text-xs font-light text-white/60">
              {mode === 'quiz' ? `Question ${currentQuestionIndex + 1}` : 'Learning'}
            </div>
          </div>

          <div className="flex bg-black/70 backdrop-blur-md rounded-full border border-white/30 p-1" style={{ filter: "url(#glass-effect)" }}>
            <motion.button
              onClick={() => setMode('quiz')}
              className={`px-4 py-2 rounded-full transition-all duration-200 text-xs font-light ${
                mode === 'quiz'
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Quiz
            </motion.button>
            <motion.button
              onClick={() => setMode('learn')}
              className={`px-4 py-2 rounded-full transition-all duration-200 text-xs font-light ${
                mode === 'learn'
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Skills Navigation */}
      <motion.div
        className="flex-none px-6 pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex justify-center max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {job.skills.map((skill, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setCurrentSkillIndex(index)
                  setCurrentQuestionIndex(0)
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 text-xs font-light whitespace-nowrap ${
                  index === currentSkillIndex
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-black/50 border border-white/30 text-white/80 hover:text-white hover:bg-black/60'
                }`}
                style={index === currentSkillIndex ? {} : { filter: "url(#glass-effect)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
              >
                {skill}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content - Improved mobile layout */}
      <div className="flex-1 overflow-hidden" style={{ touchAction: 'manipulation' }}>
        <div className="h-full flex flex-col px-3 sm:px-4 py-4 sm:py-6 md:px-6">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col">


            {/* Content Container - Mobile-first centered layout */}
            <motion.div
              className="flex-1 flex flex-col justify-center items-center gap-4 md:gap-6 px-2 sm:px-4 md:px-0 min-h-0 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
            >
              
              {/* Drag Overlay Message */}
              <AnimatePresence>
                {isDragging && dragOverlayMessage && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
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
                      transition={{ type: "spring", duration: 0.3 }}
                    >
                      {dragOverlayMessage}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {mode === 'quiz' && currentQuestion && !showQuizHistory && (
                  <motion.div
                    className="w-full max-w-4xl flex justify-center"
                    key={`quiz-${currentSkillIndex}-${currentQuestionIndex}`}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="relative w-full flex justify-center">
                      {/* Quiz Card - Always centered */}
                      <div className="max-w-xl sm:max-w-2xl w-full relative min-h-[400px]">

                        <motion.div
                          className="relative bg-black/95 backdrop-blur-xl rounded-2xl border border-white/50 p-6 md:p-8 w-full min-h-[320px] flex flex-col"
                          style={{
                            filter: "url(#glass-effect)",
                            willChange: "transform",
                            transform: "translateZ(0)"
                          }}
                          initial={{ opacity: 0, scale: 0.95, x: 0, y: 0 }}
                          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
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
                          {/* Content area - animate content only, not container */}
                          <AnimatePresence mode="wait">
                            {/* Streaming State */}
                            {currentQuestion.isStreaming && (
                                <motion.div
                                key="streaming"
                                className="flex flex-col h-full"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                >
                                {/* Question text area */}
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
                                
                                {/* Pre-allocated button space (invisible) */}
                                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 opacity-0 pointer-events-none">
                                  <div className="flex-1 rounded-xl p-4 md:p-6">
                                    <div className="flex flex-col items-center">
                                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full mb-3"></div>
                                      <div className="text-base md:text-lg font-semibold">TRUE</div>
                                    </div>
                                  </div>
                                  <div className="flex-1 rounded-xl p-4 md:p-6">
                                    <div className="flex flex-col items-center">
                                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full mb-3"></div>
                                      <div className="text-base md:text-lg font-semibold">FALSE</div>
                                    </div>
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
                                transition={{ duration: 0.2 }}
                              >
                                {/* Question text */}
                                <div className="flex-1 flex items-center justify-center text-center mb-8">
                                  <motion.h3
                                    className="text-lg md:text-xl font-medium leading-relaxed text-white"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {currentQuestion.question.text}
                                  </motion.h3>
                                </div>

                                {/* True/False Buttons */}
                                  <motion.div
                                  className="flex gap-4 justify-center"
                                  initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1, duration: 0.3 }}
                                  >
                                    <motion.button
                                      onClick={() => handleAnswer(true)}
                                      className="flex-1 max-w-40 group bg-white/10 hover:bg-green-500/20 border border-white/30 hover:border-green-400/50 rounded-2xl p-4 transition-all duration-200"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 group-hover:bg-green-500/30 flex items-center justify-center">
                                          <Check size={16} className="text-green-400" />
                                        </div>
                                        <span className="text-xs font-light text-white">TRUE</span>
                                      </div>
                                    </motion.button>
                                    <motion.button
                                      onClick={() => handleAnswer(false)}
                                      className="flex-1 max-w-40 group bg-white/10 hover:bg-red-500/20 border border-white/30 hover:border-red-400/50 rounded-2xl p-4 transition-all duration-200"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center">
                                          <X size={16} className="text-red-400" />
                                        </div>
                                        <span className="text-xs font-light text-white">FALSE</span>
                                      </div>
                                    </motion.button>
                                  </motion.div>
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
                                transition={{ duration: 0.2 }}
                              >
                                {/* Result content */}
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

                                    <motion.p
                                      className="text-white/80 font-light text-base md:text-lg leading-relaxed"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                      {currentQuestion.question.why}
                                    </motion.p>
                                  </div>
                                </motion.div>
                              )}

                        {/* Loading State */}
                        {currentQuestion.loading && !currentQuestion.isStreaming && !currentQuestion.question && (
                          <motion.div
                                key="loading"
                                className="flex flex-col items-center justify-center h-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
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

                          {/* Desktop Navigation Arrows - Outside Quiz Card */}
                          <div className="hidden md:flex justify-center gap-4 mt-6">
                            {/* View All History Button - Replaces Up Arrow */}
                            <motion.button
                              onClick={() => handleSwipeDown()}
                              className={`p-3 backdrop-blur-md rounded-full border transition-all duration-200 ${
                                mode === 'quiz'
                                  ? 'bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50'
                                  : 'bg-purple-500/20 border-purple-400/30 text-purple-300 hover:bg-purple-500/30 hover:border-purple-400/50'
                              }`}
                              style={{ filter: "url(#glass-effect)" }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              title="View all history"
                            >
                              <BookOpen size={18} />
                            </motion.button>

                            {/* Left Arrow - Previous Skill */}
                            <motion.button
                              onClick={() => handleSwipeLeft()}
                              className={`p-3 backdrop-blur-md rounded-full border transition-all duration-200 ${
                                currentSkillIndex === 0
                                  ? 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed'
                                  : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:border-white/40'
                              }`}
                              style={{ filter: "url(#glass-effect)" }}
                              whileHover={currentSkillIndex === 0 ? {} : { scale: 1.05, x: -2 }}
                              whileTap={currentSkillIndex === 0 ? {} : { scale: 0.95 }}
                              disabled={currentSkillIndex === 0}
                              title={currentSkillIndex === 0 ? "At first skill" : "Previous skill"}
                            >
                              <ArrowLeft size={18} />
                            </motion.button>

                            {/* Right Arrow - Next Skill */}
                            <motion.button
                              onClick={() => handleSwipeRight()}
                              className={`p-3 backdrop-blur-md rounded-full border transition-all duration-200 ${
                                currentSkillIndex === job.skills.length - 1
                                  ? 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed'
                                  : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:border-white/40'
                              }`}
                              style={{ filter: "url(#glass-effect)" }}
                              whileHover={currentSkillIndex === job.skills.length - 1 ? {} : { scale: 1.05, x: 2 }}
                              whileTap={currentSkillIndex === job.skills.length - 1 ? {} : { scale: 0.95 }}
                              disabled={currentSkillIndex === job.skills.length - 1}
                              title={currentSkillIndex === job.skills.length - 1 ? "At last skill" : "Next skill"}
                            >
                              <ArrowRight size={18} />
                            </motion.button>

                            {/* New Content Button - Down Arrow Logic (only in quiz mode) */}
                            {mode === 'quiz' && currentQuestion?.showResult && !showQuizHistory && (
                              <motion.button
                                onClick={() => handleSwipeUp()}
                                className="p-3 bg-green-500/20 backdrop-blur-md rounded-full border border-green-400/30 text-green-300 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200"
                                style={{ filter: "url(#glass-effect)" }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                title="Generate new question"
                              >
                                <ArrowDown size={18} />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>

                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>



              {/* Learn Mode - Single Flashcard with Swipe */}
              <AnimatePresence mode="wait">
                {mode === 'learn' && !showFlashcardHistory && (
                  <motion.div
                    className="w-full max-w-4xl flex justify-center"
                    key={`flashcard-${currentSkillIndex}-${currentFlashcardIndex}`}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="flex-1 max-w-xl sm:max-w-2xl mx-auto w-full relative min-h-[400px]">

                      {/* Current Flashcard */}
                        <motion.div
                          className="relative bg-black/95 backdrop-blur-xl rounded-2xl border border-white/50 p-6 md:p-8 w-full min-h-[320px] flex flex-col"
                          style={{
                            filter: "url(#glass-effect)",
                            willChange: "transform",
                            transform: "translateZ(0)"
                          }}
                          initial={{ opacity: 0, scale: 0.95, x: 0, y: 0 }}
                          animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                          drag
                          dragMomentum={false}
                          dragElastic={0.05}
                          onDrag={handleDrag}
                          onDragEnd={handleDragEnd}
                          whileDrag={{ 
                            scale: 1.01, 
                            rotate: isDragging ? (
                              dragDirection === 'left' ? -2 : 
                              dragDirection === 'right' ? 2 : 
                              dragDirection === 'up' ? -1 : 
                              dragDirection === 'down' ? 1 : 0
                            ) : 0,
                            z: 1
                          }}
                        >
                        <AnimatePresence mode="wait">
                          {/* Current Flashcard Content */}
                          {(flashcards[currentSkill] as FlashcardData[])?.[currentFlashcardIndex] && currentFlashcardIndex >= 0 && (
                            <motion.div
                              key={`${currentSkill}-${currentFlashcardIndex}`}
                              className="flex flex-col h-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <h3 className="text-lg md:text-xl font-light text-white mb-3 md:mb-4">
                                      {(flashcards[currentSkill] as FlashcardData[])[currentFlashcardIndex]?.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-white/90 font-light leading-relaxed mb-4 md:mb-6">
                                      {(flashcards[currentSkill] as FlashcardData[])[currentFlashcardIndex]?.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {(flashcards[currentSkill] as FlashcardData[])[currentFlashcardIndex]?.tags?.map((tag: string, tagIndex: number) => (
                                        <span
                                          key={tagIndex}
                                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs rounded-full font-light"
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

                          {/* Streaming Flashcard */}
                        {flashcards[`${currentSkill}-streaming`] && (
                          <motion.div
                              key="streaming"
                              className="flex flex-col h-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
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
                                  {(flashcards[`${currentSkill}-streaming`] as { title: string; isStreaming: boolean; })?.title && (
                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                      <Loader size={16} className="animate-spin" />
                                      <span className="font-light">Generating more content...</span>
                                    </div>
                                  )}
                                </div>
                            </div>
                          </motion.div>
                        )}

                          {/* Generating new flashcard state */}
                          {currentFlashcardIndex === -1 && !flashcards[`${currentSkill}-streaming`] && (
                            <motion.div
                              key="generating"
                              className="flex flex-col items-center justify-center h-full text-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="relative mb-6">
                                <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                                </div>
                              </div>
                              <p className="text-slate-400 text-lg">Generating new flashcard...</p>
                            </motion.div>
                          )}

                          {/* No flashcards yet (first time) */}
                          {!(flashcards[currentSkill] as FlashcardData[])?.length && currentFlashcardIndex === 0 && !flashcards[`${currentSkill}-streaming`] && (
                            <motion.div
                              key="empty"
                              className="flex flex-col items-center justify-center h-full text-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-400 text-lg mb-4">No flashcards yet</p>
                              <p className="text-slate-500 text-sm">Swipe up to generate your first flashcard</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Desktop Navigation Arrows - Outside Flashcard Card */}
                      <div className="hidden md:flex justify-center gap-4 mt-6">
                        {/* View All History Button - Replaces Up Arrow */}
                        <motion.button
                          onClick={() => handleSwipeDown()}
                          className="p-3 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-200"
                          style={{ filter: "url(#glass-effect)" }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          title="View all history"
                        >
                          <BookOpen size={18} />
                        </motion.button>

                        {/* Left Arrow - Previous Skill */}
                        <motion.button
                          onClick={() => handleSwipeLeft()}
                          className={`p-3 backdrop-blur-md rounded-full border transition-all duration-200 ${
                            currentSkillIndex === 0
                              ? 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed'
                              : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:border-white/40'
                          }`}
                          style={{ filter: "url(#glass-effect)" }}
                          whileHover={currentSkillIndex === 0 ? {} : { scale: 1.05, x: -2 }}
                          whileTap={currentSkillIndex === 0 ? {} : { scale: 0.95 }}
                          disabled={currentSkillIndex === 0}
                          title={currentSkillIndex === 0 ? "At first skill" : "Previous skill"}
                        >
                          <ArrowLeft size={18} />
                        </motion.button>

                        {/* Right Arrow - Next Skill */}
                        <motion.button
                          onClick={() => handleSwipeRight()}
                          className={`p-3 backdrop-blur-md rounded-full border transition-all duration-200 ${
                            currentSkillIndex === job.skills.length - 1
                              ? 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed'
                              : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:border-white/40'
                          }`}
                          style={{ filter: "url(#glass-effect)" }}
                          whileHover={currentSkillIndex === job.skills.length - 1 ? {} : { scale: 1.05, x: 2 }}
                          whileTap={currentSkillIndex === job.skills.length - 1 ? {} : { scale: 0.95 }}
                          disabled={currentSkillIndex === job.skills.length - 1}
                          title={currentSkillIndex === job.skills.length - 1 ? "At last skill" : "Next skill"}
                        >
                          <ArrowRight size={18} />
                        </motion.button>

                        {/* New Content Button - Down Arrow Logic (only in learn mode) */}
                        {mode === 'learn' && (
                          <motion.button
                            onClick={() => handleSwipeUp()}
                            className="p-3 bg-green-500/20 backdrop-blur-md rounded-full border border-green-400/30 text-green-300 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200"
                            style={{ filter: "url(#glass-effect)" }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            title="Generate new flashcard"
                          >
                            <ArrowDown size={18} />
                          </motion.button>
                        )}
                      </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                      </AnimatePresence>

              {/* Quiz History View */}
                      <AnimatePresence>
                {mode === 'quiz' && showQuizHistory && (
                          <motion.div
                    className="w-full max-w-4xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-light text-white">Question History</h3>
                      <button
                        onClick={() => setShowQuizHistory(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-full text-xs font-light transition-all duration-200"
                      >
                        Back to Current
                      </button>
                            </div>
                    
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                      {Object.keys(questionsData)
                        .filter(key => key.startsWith(`${currentSkillIndex}-`) && questionsData[key].question)
                        .map((key, index) => {
                          const question = questionsData[key];
                          const questionIndex = parseInt(key.split('-')[1]);
                          return (
                            <motion.div
                              key={key}
                              className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:border-white/30 transition-all duration-200 cursor-pointer min-h-fit"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              whileHover={{ scale: 1.01, x: 5 }}
                              onClick={() => {
                                setCurrentQuestionIndex(questionIndex)
                                setShowQuizHistory(false)
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  question.answered === question.question?.answer 
                                    ? 'bg-green-400' 
                                    : question.answered !== null 
                                      ? 'bg-red-400' 
                                      : 'bg-gray-400'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-light text-white mb-1 text-sm leading-tight">
                                    Q{questionIndex + 1}: {question.question?.text || ''}
                                  </h4>
                                  <p className="text-white/70 font-light text-xs">
                                    {question.answered !== null 
                                      ? `Your answer: ${question.answered ? 'True' : 'False'}` 
                                      : 'Not answered yet'
                                    }
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

              {/* Flashcard History View */}
              <AnimatePresence>
                {mode === 'learn' && showFlashcardHistory && (
                    <motion.div
                    className="w-full max-w-4xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-light text-white">Flashcard History</h3>
                      <button
                        onClick={() => setShowFlashcardHistory(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-full text-xs font-light transition-all duration-200"
                      >
                        Back to Current
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                      {(flashcards[currentSkill] as FlashcardData[] || []).map((card, index) => (
                        <motion.div
                          key={index}
                            className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:border-white/30 transition-all duration-200 cursor-pointer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                          onClick={() => {
                            setCurrentFlashcardIndex(index)
                            setShowFlashcardHistory(false)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-light text-white mb-1 text-sm leading-tight">
                                {card.title}
                              </h4>
                              <p className="text-white/70 font-light text-xs leading-relaxed">
                                {card.content}
                              </p>
                            </div>
                          </div>
                    </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* Learn Mode Instructions - Always visible */}
              {mode === 'learn' && !showFlashcardHistory && (
                <motion.div
                  className="text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center items-center gap-4 mb-3 flex-wrap text-xs font-light">
                    <div className="flex items-center gap-1 text-green-400">
                      <ArrowDown className="w-3 h-3" />
                      <span>New</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <BookOpen className="w-3 h-3" />
                      <span>History</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <ArrowLeft className="w-3 h-3" />
                      <ArrowRight className="w-3 h-3" />
                      <span>Skills</span>
                    </div>
                  </div>
            </motion.div>
              )}

              {/* Quiz Mode Instructions - Only visible after answering */}
              {mode === 'quiz' && !showQuizHistory && currentQuestion?.showResult && (
                <motion.div
                  className="text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center items-center gap-4 mb-3 flex-wrap text-xs font-light">
                    <div className="flex items-center gap-1 text-green-400">
                      <ArrowDown className="w-3 h-3" />
                      <span>New Q</span>
          </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <BookOpen className="w-3 h-3" />
                      <span>History</span>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400">
                      <ArrowLeft className="w-3 h-3" />
                      <ArrowRight className="w-3 h-3" />
                      <span>Skills</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}