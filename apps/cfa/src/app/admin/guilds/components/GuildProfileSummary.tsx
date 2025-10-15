'use client';

import { motion } from 'framer-motion';
import { ExamProfile } from '@/lib/certifications';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface GuildProfileSummaryProps {
  profile: ExamProfile;
  onSave: () => void;
}

const GuildProfileSummary: React.FC<GuildProfileSummaryProps> = ({ 
  profile, 
  onSave 
}) => {
  // Fix weight calculation
  const totalWeight = profile.objectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
  const normalizedObjectives = totalWeight !== 100 ? profile.objectives.map(obj => ({
    ...obj,
    weight: Math.round((obj.weight / totalWeight) * 100)
  })) : profile.objectives;

  return (
    <div className="space-y-6">
      {/* Header Summary - Enhanced Dashboard Layout */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main Header */}
        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                <p className="text-white/70 text-lg">{profile.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-400/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium text-sm">Profile Generated</span>
            </div>
          </div>

          <p className="text-white/80 text-base leading-relaxed">
            {profile.description}
          </p>
        </div>

        {/* Quick Stats Grid - Simplified */}
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-white/60 mr-2" />
                <div className="text-2xl font-bold text-white">{profile.objectives.length}</div>
              </div>
              <div className="text-sm text-white/70 font-medium">Learning Objectives</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-white/60 mr-2" />
                <div className="text-2xl font-bold text-white">{profile.constraints.totalQuestions}</div>
              </div>
              <div className="text-sm text-white/70 font-medium">Total Questions</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-white/60 mr-2" />
                <div className="text-2xl font-bold text-white">{profile.constraints.timeMinutes}m</div>
              </div>
              <div className="text-sm text-white/70 font-medium">Exam Duration</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-white/60 mr-2" />
                <div className="text-2xl font-bold text-white">{profile.constraints.passingScore}%</div>
              </div>
              <div className="text-sm text-white/70 font-medium">Passing Score</div>
            </div>
          </div>
          
        </div>
      </motion.div>

      {/* Learning Objectives Overview */}
      <motion.div
        className="rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Learning Objectives</h3>
            <p className="text-sm text-white/60">Comprehensive curriculum breakdown</p>
          </div>
        </div>

        {/* Objectives Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {normalizedObjectives.map((objective, index) => (
            <div 
              key={objective.id} 
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200 hover:border-white/20"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-white/10 border border-white/20 text-white text-sm font-bold rounded-xl">
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-base mb-2 leading-tight">{objective.title}</h4>
                  
                  {/* Stats Row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-md border border-indigo-400/30">
                      {objective.weight}%
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${
                      objective.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                      objective.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                      'bg-red-500/20 text-red-300 border-red-400/30'
                    }`}>
                      {objective.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-slate-500/20 text-slate-300 text-xs font-medium rounded-md border border-slate-400/30">
                      {objective.questionsPerSession || 8}q
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed mb-4">{objective.description}</p>
              
              {/* Key Topics */}
              {objective.keyTopics && objective.keyTopics.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">Key Topics</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {objective.keyTopics.slice(0, 4).map((topic, topicIndex) => (
                      <span 
                        key={topicIndex}
                        className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md border border-white/20"
                      >
                        {topic}
                      </span>
                    ))}
                    {objective.keyTopics.length > 4 && (
                      <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md border border-white/10">
                        +{objective.keyTopics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      

      {/* Action Button */}
      <motion.div
        className="text-center pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button
          onClick={onSave}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Trophy className="w-6 h-6" />
          Create Guild & Start Learning
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-white/60 text-sm mt-3">
          Save this profile and jump into exam preparation mode
        </p>
      </motion.div>
    </div>
  );
};

export default GuildProfileSummary;

