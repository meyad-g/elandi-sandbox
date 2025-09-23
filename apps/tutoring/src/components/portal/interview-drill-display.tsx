'use client';

import { motion } from 'framer-motion';
import { 
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  ArrowRight
} from 'lucide-react';

interface InterviewDrill {
  mainPrompt: string;
  followUps: string[];
  strongAnswerCriteria: string[];
  hints: string[];
  explainer: string;
  variants: string[];
}

interface InterviewDrillDisplayProps {
  interviewDrill: InterviewDrill;
}

export function InterviewDrillDisplay({ interviewDrill }: InterviewDrillDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Main Question */}
      <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
        <div className="relative z-10 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-white font-light text-2xl">Main Interview Question</h4>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-white/90 text-lg leading-relaxed">{interviewDrill.mainPrompt}</p>
          </div>
        </div>
      </div>

      {/* Follow-up Questions */}
      {interviewDrill.followUps && interviewDrill.followUps.length > 0 && (
        <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="relative z-10 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-light text-2xl">Follow-up Questions</h4>
            </div>
            
            <div className="space-y-4">
              {interviewDrill.followUps.map((followUp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-start space-x-3"
                >
                  <div className="w-6 h-6 bg-orange-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-400 text-sm font-medium">{index + 1}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">{followUp}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Strong Answer Criteria & Hints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Answer Criteria */}
        {interviewDrill.strongAnswerCriteria && interviewDrill.strongAnswerCriteria.length > 0 && (
          <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
            <div className="relative z-10 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h5 className="text-white font-medium text-lg">Strong Answer Criteria</h5>
              </div>
              
              <div className="space-y-3">
                {interviewDrill.strongAnswerCriteria.map((criteria, index) => (
                  <div key={index} className="flex items-start space-x-3 text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hints */}
        {interviewDrill.hints && interviewDrill.hints.length > 0 && (
          <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
            <div className="relative z-10 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h5 className="text-white font-medium text-lg">Hints & Tips</h5>
              </div>
              
              <div className="space-y-3">
                {interviewDrill.hints.map((hint, index) => (
                  <div key={index} className="flex items-start space-x-3 text-white/80">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explainer */}
      {interviewDrill.explainer && (
        <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          <div className="relative z-10 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h5 className="text-white font-medium text-lg">What This Tests</h5>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-white/80 leading-relaxed">{interviewDrill.explainer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
