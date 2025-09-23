"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Brain,
  FileQuestion,
  Search,
  MessageSquare,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  Copy,
  Save,
  RefreshCw,
  Zap,
} from "lucide-react"
import { QuestionSheet } from "./question-sheet"
import { ResourceHunter } from "./resource-hunter"
import { LessonPlanDisplay } from "./lesson-plan-display"
import { InterviewDrillDisplay } from "./interview-drill-display"
import { WeeklyNoteDisplay } from "./weekly-note-display"

interface Student {
  id: string
  name: string
  avatar: string
  year: string
  board: string
  exams: string[]
  nextDeadlines: string[]
  currentGaps: string[]
  lastLessonSummary: string
  upcomingObjective: string
  recentProgress: string
  nextFocus: string
}

interface Session {
  id: string
  time: string
  studentId: string
  student: string
  subject: string
  board: string
  location: string
  status: "active" | "upcoming" | "completed"
  duration: string
  sessionType: string
}

interface SmartPrepStreamProps {
  prepType: string
  student: Student
  session: Session
  onClose: () => void
}

type StreamingState = "thinking" | "generating" | "complete" | "error"

export function SmartPrepStream({ prepType, student, session, onClose }: SmartPrepStreamProps) {
  const [streamingState, setStreamingState] = useState<StreamingState>("thinking")
  const [currentThinking, setCurrentThinking] = useState("")
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    generateContent()
  }, [])

  const getThinkingSteps = (type: string) => {
    const steps = {
      lesson: [
        "Searching exam board specifications...",
        "Researching common misconceptions...",
        "Analyzing student's learning gaps...",
        "Creating structured lesson plan...",
      ],
      questions: [
        "Searching past paper questions...",
        "Analyzing assessment objectives...",
        "Considering student's weak areas...",
        "Creating exam-style questions...",
        "Developing model answers..."
      ],
      resources: [
        "Searching official exam board resources...",
        "Finding reputable educational materials...",
        "Locating educational videos...",
        "Hunting for practice worksheets...",
        "Analyzing best matches for student..."
      ],
      interview: [
        "Researching Oxbridge interview styles...",
        "Analyzing subject-specific approaches...",
        "Considering student's academic level...",
        "Creating challenge questions..."
      ],
      notes: [
        "Reviewing student's recent progress...",
        "Identifying key achievements...",
        "Planning next session focus...",
        "Drafting parent communication..."
      ]
    }
    return steps[type as keyof typeof steps] || steps.lesson
  }

  const generateContent = async () => {
    setStreamingState("thinking")
    setCurrentThinking("")
    setGeneratedContent(null)
    setProgress(0)

    const smartContext = buildSmartContext()
    
    // Fake thinking steps based on prep type
    const thinkingSteps = getThinkingSteps(prepType)
    
    // Show fake thinking steps (slower pace)
    for (let i = 0; i < thinkingSteps.length; i++) {
      setCurrentThinking(thinkingSteps[i])
      setProgress((i + 1) * (90 / thinkingSteps.length))
      await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 800))
    }

    // Now do the actual API call
    try {
      const response = await fetch("/api/tutor/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: prepType,
          description: smartContext.description,
          studentName: student.name,
          examBoard: smartContext.examBoard,
          topic: smartContext.topic,
          level: smartContext.level,
          timeBox: smartContext.timeBox,
          calculatorAllowed: smartContext.calculatorAllowed,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate content")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response reader available")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)

              if (data.type === "result") {
                setStreamingState("complete")
                setGeneratedContent(data.content)
                setProgress(100)
              } else if (data.type === "error") {
                setStreamingState("error")
              }
            } catch (parseError) {
              console.error("Error parsing streaming data:", parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating content:", error)
      setStreamingState("error")
    }
  }

  const buildSmartContext = () => {
    const primaryGap = student.currentGaps?.[0] || student.current_gaps?.[0] || "general concepts"
    const subject = (session?.subject || student.subjects?.[0] || "general").toLowerCase()

    let description = ""
    const topic = primaryGap
    const timeBox = 60

    switch (prepType) {
      case "lesson":
        description = `60-minute lesson on ${primaryGap} for ${student.name} (${student.year || student.grade_level}, ${session?.board || student.grade_level || "General"}). Focus: ${student.nextFocus || student.next_focus?.join(", ") || "Foundation building"}. Recent progress: ${student.recentProgress || student.recent_progress?.join(", ") || "Getting started"}`
        break
      case "questions":
        description = `10 ${session?.board || student.grade_level || "General"} exam questions on ${primaryGap} for ${student.year || student.grade_level}. Target their specific gaps and common mistakes.`
        break
      case "resources":
        description = `Best resources for ${primaryGap} at ${student.year || student.grade_level} level (${session?.board || student.grade_level || "General"}). Include videos, practice materials, and authoritative sources.`
        break
      case "interview":
        description = `Oxbridge interview questions on ${primaryGap} for ${student.year} student. Connect to ${subject} concepts.`
        break
      case "notes":
        description = `Weekly note for ${student.name}'s parents. Progress on ${primaryGap}, next steps toward their goals.`
        break
    }

    return {
      description,
      examBoard: session?.board || student.grade_level || "General",
      topic,
      level: student.year || student.grade_level || "General",
      timeBox,
      calculatorAllowed: subject.includes("math") ? false : true,
    }
  }

  const getIcon = () => {
    switch (prepType) {
      case "lesson":
        return Brain
      case "questions":
        return FileQuestion
      case "resources":
        return Search
      case "interview":
        return MessageSquare
      case "notes":
        return FileText
      default:
        return Sparkles
    }
  }

  const getTitle = () => {
    switch (prepType) {
      case "lesson":
        return `Smart Lesson Plan`
      case "questions":
        return `Exam Questions`
      case "resources":
        return `Resource Hunter`
      case "interview":
        return `Interview Prep`
      case "notes":
        return `Weekly Note`
      default:
        return "AI Content"
    }
  }

  const getColor = () => {
    switch (prepType) {
      case "lesson":
        return "from-blue-400 to-purple-500"
      case "questions":
        return "from-green-400 to-emerald-500"
      case "resources":
        return "from-purple-400 to-pink-500"
      case "interview":
        return "from-orange-400 to-red-500"
      case "notes":
        return "from-teal-400 to-cyan-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const Icon = getIcon()

  return (
    <motion.div
      className="space-y-6 lg:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl border border-white/30 rounded-3xl overflow-hidden shadow-2xl">
        {/* Enhanced glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getColor().replace("from-", "from-").replace("to-", "to-")}/15`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Animated top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative z-10 p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <motion.button
                className="p-4 hover:bg-white/10 rounded-2xl transition-all duration-200 border border-white/20 hover:border-white/40 shadow-lg"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </motion.button>

              <div className={`p-5 bg-gradient-to-br ${getColor()} rounded-2xl shadow-2xl ring-4 ring-white/10`}>
                <Icon className="h-10 w-10 text-white" />
              </div>

              <div className="min-w-0 flex-grow space-y-3">
                <h1 className="text-2xl lg:text-4xl font-light text-white tracking-tight">{getTitle()}</h1>
                <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm rounded-full border border-green-400/40">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Smart Context</span>
                  </div>
                  <div className="text-base text-white/70 font-light">
                    {student.name} • {session?.board || student.board || "General"} • {student.currentGaps?.[0] || student.current_gaps?.[0] || "Assessment needed"}
                  </div>
                </div>
              </div>
            </div>

            {streamingState === "complete" && (
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-xl border border-blue-500/50"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </motion.button>

                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-xl border border-green-500/50"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </motion.button>

                <motion.button
                  onClick={generateContent}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-xl border border-purple-500/50"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {streamingState !== "complete" && (
        <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 shadow-xl">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-start space-x-4">
            {streamingState === "thinking" && (
              <>
                <div className="relative">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-blue-400/20" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Show current thinking with typing effect */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 animate-pulse" />
                    <motion.span
                      className="text-white/90 font-medium"
                      key={currentThinking}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentThinking || `Analyzing ${student.name}'s context...`}
                    </motion.span>
                    {currentThinking.trim() && (
                      <motion.div
                        className="w-0.5 h-4 bg-blue-400 rounded-full"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
            {streamingState === "generating" && (
              <>
                <div className="relative">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                  <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-purple-400/20" />
                </div>
                <span className="text-white/90 font-medium">Generating personalized content...</span>
              </>
            )}
            {streamingState === "error" && (
              <>
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚠️</span>
                </div>
                <span className="text-red-400 font-medium">Generation failed. Please try again.</span>
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {generatedContent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl border border-green-500/30 rounded-3xl overflow-hidden shadow-2xl">
              {/* Success glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />

              <div className="relative z-10 p-6 lg:p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white">Generated {getTitle()}</h3>
                    <p className="text-sm text-white/60">Personalized for {student.name}</p>
                  </div>
                </div>

                {/* Render content based on type */}
                <div className="space-y-8">
                  {prepType === "lesson" && generatedContent.objectives && (
                    <LessonPlanDisplay lessonPlan={generatedContent} />
                  )}

                  {/* Questions Content */}
                  {prepType === "questions" && generatedContent.questions && (
                    <QuestionSheet
                      questions={generatedContent.questions}
                      examBoard={generatedContent.examBoard}
                      totalMarks={generatedContent.totalMarks}
                      calculatorAllowed={generatedContent.calculatorAllowed}
                    />
                  )}

                  {/* Resources Content */}
                  {prepType === "resources" && generatedContent.authoritative && (
                    <ResourceHunter
                      authoritative={generatedContent.authoritative}
                      videos={generatedContent.videos || []}
                      printables={
                        generatedContent.printables || {
                          worksheet: "Practice questions",
                          answers: "Detailed solutions",
                        }
                      }
                    />
                  )}

                  {/* Interview Drill Content */}
                  {prepType === "interview" && generatedContent.mainPrompt && (
                    <InterviewDrillDisplay interviewDrill={generatedContent} />
                  )}

                  {/* Weekly Note Content */}
                  {prepType === "notes" && generatedContent.whatWeDid && (
                    <WeeklyNoteDisplay weeklyNote={generatedContent} studentName={student.name} />
                  )}

                  {/* Fallback for unhandled content types */}
                  {!["lesson", "questions", "resources", "interview", "notes"].includes(prepType) && (
                    <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      <div className="relative z-10 p-8">
                        <h4 className="text-white font-light text-2xl mb-6">Generated Content</h4>
                        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                          <pre className="text-sm text-white/90 whitespace-pre-wrap overflow-x-auto font-mono leading-relaxed">
                            {JSON.stringify(generatedContent, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
