'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  User, 
  BookOpen, 
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';

import type { Student as DatabaseStudent } from "@/lib/database/types"

interface UIStudent extends DatabaseStudent {
  avatar?: string;
  year?: string;
  board?: string;
  exams?: string[];
  nextDeadlines?: string[];
  lastLessonSummary?: string;
  upcomingObjective?: string;
  recentProgress?: string;
  nextFocus?: string;
}

interface Session {
  id: string;
  time: string;
  studentId: string;
  student: string;
  subject: string;
  board: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
  duration: string;
  sessionType: string;
}

interface SmartBriefModalProps {
  student: UIStudent;
  session: Session;
  onClose: () => void;
}

export function SmartBriefModal({ student, session, onClose }: SmartBriefModalProps) {
  // Transform database fields to UI fields with defaults
  const displayStudent = {
    ...student,
    currentGaps: student.current_gaps || ["Assessment needed"],
    subjects: student.subjects || ["General"],
    learningGoals: student.learning_goals || ["Improve understanding"],
    recentProgress: student.recent_progress?.join(", ") || "Getting started",
    nextFocus: student.next_focus?.join(", ") || "Foundation building",
    year: student.grade_level || "Not specified",
    board: student.board || "General",
    exams: student.exams || [],
    nextDeadlines: student.nextDeadlines || [],
    lastLessonSummary: student.lastLessonSummary || "Welcome! Ready to start learning.",
    upcomingObjective: student.upcomingObjective || "Build strong foundations"
  }
  const [streamingText, setStreamingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateSmartBrief();
  }, []);

  const generateSmartBrief = async () => {
    setIsGenerating(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/tutor/smart-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: {
            name: student.name,
            year: displayStudent.year,
            board: displayStudent.board,
            currentGaps: displayStudent.currentGaps,
            recentProgress: displayStudent.recentProgress,
            nextFocus: displayStudent.nextFocus,
            lastLessonSummary: displayStudent.lastLessonSummary,
            upcomingObjective: displayStudent.upcomingObjective,
            nextDeadlines: displayStudent.nextDeadlines
          },
          session: {
            subject: session.subject,
            time: session.time,
            duration: session.duration,
            sessionType: session.sessionType
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate smart brief');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

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
              if (data.type === 'content') {
                setStreamingText(prev => prev + data.content);
              } else if (data.type === 'complete') {
                setIsGenerating(false);
              }
            } catch (parseError) {
              // If not JSON, treat as direct text
              setStreamingText(prev => prev + line + '\n');
            }
          }
        }
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating smart brief:', error);
      setStreamingText(`Here's a comprehensive analysis of ${student.name}'s current learning journey:

**Recent Progress**: ${displayStudent.recentProgress}

**Current Focus Areas**: ${displayStudent.currentGaps.join(', ')}

**Upcoming Session Strategy**: 
For the ${session.time} ${session.subject} session (${session.duration}), I recommend focusing on ${displayStudent.nextFocus}. Given ${student.name}'s current understanding level, we should build on their recent progress while addressing the identified gaps.

**Key Learning Objectives**:
1. Strengthen foundational understanding in ${displayStudent.currentGaps[0]}
2. Build confidence through structured practice
3. Prepare for upcoming assessments: ${displayStudent.nextDeadlines.join(', ')}

**Recommended Approach**: 
Start with a brief review of previous concepts, then introduce new material with plenty of worked examples. ${student.name} responds well to ${displayStudent.lastLessonSummary.toLowerCase().includes('well') ? 'visual explanations and step-by-step guidance' : 'additional practice and reinforcement'}.

**Next Steps**: 
Continue building toward the goal of ${displayStudent.upcomingObjective}, with particular attention to ${displayStudent.nextFocus}.`);
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[85vh]"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-pink-500/5" />
          
          {/* Top highlight */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-light text-white tracking-tight">Smart Brief for {student.name}</h2>
                    <p className="text-white/60 font-light">AI-generated learning analysis and session strategy</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-6 w-6 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8 max-h-[60vh] overflow-y-auto">
              {isGenerating && (
                <div className="flex items-center space-x-3 mb-6">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                  <span className="text-white/80">Generating personalized brief for {student.name}...</span>
                </div>
              )}
              
              <div className="bg-black/40 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-white/10">
                <div className="text-white/90 leading-relaxed font-light whitespace-pre-wrap">
                  {streamingText || 'Analyzing student profile and generating insights...'}
                  {isGenerating && (
                    <span className="inline-block w-2 h-5 bg-amber-400 ml-1 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 lg:p-8 border-t border-white/10 bg-black/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/60">
                  Generated {new Date().toLocaleTimeString()} • Ready to use in session
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Copy Brief
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
