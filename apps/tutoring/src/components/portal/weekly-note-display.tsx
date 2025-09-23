'use client';

import { motion } from 'framer-motion';
import { 
  FileText,
  TrendingUp,
  Target,
  Home,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface WeeklyNoteDraft {
  whatWeDid: string;
  whatsNext: string;
  actionFromHome: string;
}

interface WeeklyNoteDisplayProps {
  weeklyNote: WeeklyNoteDraft;
  studentName?: string;
}

export function WeeklyNoteDisplay({ weeklyNote, studentName }: WeeklyNoteDisplayProps) {
  const sections = [
    {
      key: 'whatWeDid',
      title: 'What We Did This Week',
      content: weeklyNote.whatWeDid,
      icon: Calendar,
      color: 'from-teal-400 to-cyan-500',
      accentColor: 'teal-400'
    },
    {
      key: 'whatsNext',
      title: "What's Next",
      content: weeklyNote.whatsNext,
      icon: Target,
      color: 'from-blue-400 to-purple-500',
      accentColor: 'blue-400'
    },
    {
      key: 'actionFromHome',
      title: 'Action for Home',
      content: weeklyNote.actionFromHome,
      icon: Home,
      color: 'from-green-400 to-emerald-500',
      accentColor: 'green-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
        <div className="relative z-10 p-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-white font-light text-2xl">Weekly Progress Note</h4>
          </div>
          
          {studentName && (
            <p className="text-white/60 text-lg">for {studentName}</p>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-${section.accentColor}/50 to-transparent`} />
              <div className="relative z-10 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h5 className="text-white font-medium text-lg">{section.title}</h5>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <p className="text-white/90 leading-relaxed text-base">{section.content}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-white/70 text-sm">Ready to share with parents</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <span className="text-sm">Copy & Send</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
