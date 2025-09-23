"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SmartBriefModal } from "./smart-brief-modal"
import {
  User,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  Brain,
  FileQuestion,
  Search,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react"

// Use the database Student type and extend it with UI-specific fields
interface DashboardStudent {
  id: string
  name: string
  email?: string
  grade_level?: string
  subjects?: string[]
  learning_goals?: string[]
  current_gaps?: string[]
  recent_progress?: string[]
  next_focus?: string[]
  notes?: string
  // UI-specific fields
  avatar?: string
  year?: string
  board?: string
  exams?: string[]
  nextDeadlines?: string[]
  lastLessonSummary?: string
  upcomingObjective?: string
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

interface StudentDashboardProps {
  student: DashboardStudent
  session: Session
  onStartPrep: (prepType: string) => void
  isLoaded: boolean
}

const prepActions = [
  {
    id: "lesson",
    title: "Smart Lesson Plan",
    subtitle: "60-min structured plan",
    icon: Brain,
    color: "from-blue-400 to-purple-500",
    description: "AI-generated lesson targeting their specific gaps",
  },
  {
    id: "questions",
    title: "Exam Questions",
    subtitle: "10 targeted items",
    icon: FileQuestion,
    color: "from-green-400 to-emerald-500",
    description: "Board-specific questions with mark schemes",
  },
  {
    id: "resources",
    title: "Resource Hunter",
    subtitle: "Curated materials",
    icon: Search,
    color: "from-purple-400 to-pink-500",
    description: "Best sources, videos, and practice materials",
  },
  {
    id: "interview",
    title: "Interview Prep",
    subtitle: "Oxbridge-style",
    icon: MessageSquare,
    color: "from-orange-400 to-red-500",
    description: "Challenge questions with follow-ups",
  },
  {
    id: "notes",
    title: "Weekly Note",
    subtitle: "Parent update",
    icon: FileText,
    color: "from-teal-400 to-cyan-500",
    description: "Progress summary and next steps",
  },
]

export function StudentDashboard({ student, session, onStartPrep, isLoaded }: StudentDashboardProps) {
  // Provide default values for missing fields
  const displayStudent = {
    ...student,
    grade_level: student.grade_level || "Not specified",
    subjects: student.subjects || ["General"],
    learning_goals: student.learning_goals || ["Improve understanding"],
    current_gaps: student.current_gaps || ["Assessment needed"],
    recent_progress: student.recent_progress || ["Getting started"],
    next_focus: student.next_focus || ["Foundation building"],
    year: student.year || student.grade_level || "Not specified",
    board: student.board || "General",
    exams: student.exams || [],
    nextDeadlines: student.nextDeadlines || [],
    lastLessonSummary: student.lastLessonSummary || "Welcome! Ready to start learning.",
    upcomingObjective: student.upcomingObjective || "Build strong foundations"
  }
  const [showSmartBrief, setShowSmartBrief] = useState(false)
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <motion.div
        key={student.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          {/* Enhanced glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Animated top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Animated top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative z-10 p-6 lg:p-10 space-y-8">
            {/* Student Info with improved layout */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 flex-grow">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl lg:text-4xl font-light shadow-2xl ring-4 ring-white/10">
                    {displayStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div
                    className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ${
                      session.status === "active" ? "bg-green-400" : "bg-amber-400"
                    } border-4 border-slate-900 shadow-xl flex items-center justify-center`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                <div className="text-center sm:text-left flex-grow space-y-4">
                  <div>
                    <h1 className="text-3xl lg:text-5xl font-light text-white mb-3 tracking-tight">{displayStudent.name}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/30">
                        <User className="h-4 w-4 text-white/70" />
                        <span className="text-sm font-medium text-white/90">{displayStudent.year}</span>
                      </div>
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/30">
                        <BookOpen className="h-4 w-4 text-white/70" />
                        <span className="text-sm font-medium text-white/90">{displayStudent.board}</span>
                      </div>
                      <button
                        onClick={() => setShowSmartBrief(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 backdrop-blur-sm rounded-full border border-amber-400/40 hover:from-amber-500/40 hover:to-orange-500/40 transition-all duration-300 group"
                      >
                        <Sparkles className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-amber-300">Smart Brief</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-lg text-white/80 max-w-2xl leading-relaxed font-light">{displayStudent.lastLessonSummary}</p>
                </div>
              </div>

              {/* Enhanced next session card */}
              <div className="w-full sm:w-auto bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-white/60 text-sm mb-3">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Next Session</span>
                </div>
                <div className="text-2xl font-light text-white mb-2 text-center sm:text-left">{session.time}</div>
                <div className="text-sm text-white/70 font-light text-center sm:text-left mb-3">
                  {session.subject} • {session.duration}
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-white/50">
                  <div
                    className={`w-2 h-2 rounded-full ${session.status === "active" ? "bg-green-400" : "bg-amber-400"}`}
                  />
                  <span className="capitalize">{session.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-3xl p-8 border border-green-400/40 group hover:border-green-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-emerald-500/5 rounded-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-green-400/20 rounded-full border border-green-400/30">
                      <span className="text-xs font-medium text-green-300">✓ On Track</span>
                    </div>
                  </div>

                  <h4 className="text-white text-xl font-medium mb-4 tracking-tight">Recent Progress</h4>
                  <p className="text-white/80 leading-relaxed font-light text-base">{displayStudent.recent_progress.join(', ')}</p>

                  {/* Progress indicator */}
                  <div className="mt-6 pt-4 border-t border-green-400/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-300 font-medium">Confidence Level</span>
                      <span className="text-white/70">85%</span>
                    </div>
                    <div className="mt-2 w-full bg-black/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-[85%] shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-red-400/40 group hover:border-red-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 via-transparent to-pink-500/5 rounded-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                      <AlertCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-red-400/20 rounded-full border border-red-400/30">
                      <span className="text-xs font-medium text-red-300">{displayStudent.current_gaps?.length || 0} Areas</span>
                    </div>
                  </div>

                  <h4 className="text-white text-xl font-medium mb-4 tracking-tight">Current Gaps</h4>
                  <div className="space-y-3">
                    {displayStudent.current_gaps.map((gap, index) => (
                      <div
                        key={index}
                        className="group/item flex items-center space-x-3 text-white/80 bg-black/40 px-4 py-3 rounded-xl border border-red-400/20 font-light hover:bg-black/50 hover:border-red-400/30 transition-all duration-300"
                      >
                        <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                        <span className="text-sm">{gap}</span>
                      </div>
                    ))}
                  </div>

                  {/* Priority indicator */}
                  <div className="mt-6 pt-4 border-t border-red-400/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-300 font-medium">Priority Level</span>
                      <span className="text-white/70">High</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-400/40 group hover:border-blue-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-500/5 rounded-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-blue-400/20 rounded-full border border-blue-400/30">
                      <span className="text-xs font-medium text-blue-300">Next Session</span>
                    </div>
                  </div>

                  <h4 className="text-white text-xl font-medium mb-4 tracking-tight">Next Focus</h4>
                  <p className="text-white/80 leading-relaxed font-light text-base mb-6">{displayStudent.upcomingObjective}</p>

                  {/* Action button */}
                  <button className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-xl px-4 py-3 text-sm font-medium text-blue-300 hover:text-blue-200 transition-all duration-300 flex items-center justify-center space-x-2 group/btn">
                    <span>Prepare Materials</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5" />

          <div className="relative z-10 p-6 lg:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-light text-white tracking-tight">AI-Powered Prep</h2>
                    <p className="text-lg text-white/60 font-light">Personalized for {displayStudent.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
              {prepActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.id}
                    className="group relative p-6 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-white/40 transition-all duration-300 text-left overflow-hidden hover:shadow-2xl"
                    onClick={() => onStartPrep(action.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Enhanced glow on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    {/* Top highlight */}
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />


                    {/* Enhanced icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-white text-lg group-hover:text-white transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">{action.subtitle}</p>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{action.description}</p>

                      {/* Arrow indicator */}
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="h-4 w-4 text-white/60" />
                      </div>
                    </div>

                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />

          <div className="relative z-10 p-6 lg:p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-white">Upcoming Deadlines</h2>
                <p className="text-sm text-white/60">Stay ahead of important dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayStudent.nextDeadlines.map((deadline, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg" />
                  <div className="text-sm text-white/90 font-medium">{deadline}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Brief Modal */}
      {showSmartBrief && (
        <SmartBriefModal 
          student={student} 
          session={session} 
          onClose={() => setShowSmartBrief(false)} 
        />
      )}
    </div>
  )
}
