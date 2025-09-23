'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Home,
  Play,
  PauseCircle,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LessonPlan {
  objectives: string[];
  structure: {
    doNow: string;
    teach: string;
    check: string;
    practice: string;
    stretch: string;
  };
  workedExample?: string;
  commonPitfalls?: string[];
  checkForUnderstanding?: string[];
  homework?: string[];
  citations?: string[];
}

interface LessonPlanDisplayProps {
  lessonPlan: LessonPlan;
}

const structureConfig = [
  { key: 'doNow', title: 'Do Now', icon: Play, time: '5 min', color: 'from-green-500 to-emerald-600' },
  { key: 'teach', title: 'Main Teaching', icon: BookOpen, time: '15 min', color: 'from-blue-500 to-cyan-600' },
  { key: 'check', title: 'Check Understanding', icon: CheckCircle2, time: '10 min', color: 'from-purple-500 to-pink-600' },
  { key: 'practice', title: 'Guided Practice', icon: PauseCircle, time: '20 min', color: 'from-orange-500 to-red-600' },
  { key: 'stretch', title: 'Stretch & Extension', icon: Zap, time: '10 min', color: 'from-violet-500 to-purple-600' },
];

export function LessonPlanDisplay({ lessonPlan }: LessonPlanDisplayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const nextStep = () => {
    setCurrentStepIndex((prev) => (prev + 1) % structureConfig.length);
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => (prev - 1 + structureConfig.length) % structureConfig.length);
  };
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Objectives */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative z-10 p-6 lg:p-8">
            <h4 className="text-white font-light text-2xl lg:text-3xl tracking-tight flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span>Learning Objectives</span>
            </h4>
            
            <div className="space-y-4">
              {lessonPlan.objectives.map((objective, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                    {index + 1}
                  </div>
                  <p className="text-base lg:text-lg text-white/90 leading-relaxed font-light pt-2">{objective}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Info */}
        <div className="space-y-6">
          {/* Timing Overview */}
          <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="relative z-10 p-6">
              <h5 className="text-white font-medium text-lg mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-400" />
                <span>Timing</span>
              </h5>
              <div className="space-y-3">
                {structureConfig.map((item, index) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{item.title}</span>
                    <span className="text-sm text-green-300 font-medium">{item.time}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-lg text-white font-bold">60 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Pitfalls */}
          {lessonPlan.commonPitfalls && lessonPlan.commonPitfalls.length > 0 && (
            <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5" />
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative z-10 p-6">
                <h5 className="text-white font-medium text-lg mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span>Watch Out For</span>
                </h5>
                <div className="space-y-3">
                  {lessonPlan.commonPitfalls.map((pitfall, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm text-white/80">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{pitfall}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Structure - Main Timeline */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-blue-500/3" />
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 p-6 lg:p-8">
          <h4 className="text-white font-light text-2xl lg:text-3xl tracking-tight flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span>60-Minute Lesson Structure</span>
          </h4>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevStep}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            
            <div className="flex items-center space-x-2">
              {structureConfig.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentStepIndex ? 'bg-white w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Current Step Display */}
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-12 text-center max-w-2xl mx-auto"
          >
            {(() => {
              const item = structureConfig[currentStepIndex];
              const Icon = item.icon;
              const content = lessonPlan.structure[item.key as keyof typeof lessonPlan.structure];
              
              return (
                <>
                  {/* Step Header */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="text-sm text-white/50 font-medium mb-4">STEP {currentStepIndex + 1} OF {structureConfig.length}</div>
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center shadow-2xl mb-4`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-lg text-white/70 font-medium mb-2">{item.time}</div>
                    <h3 className="font-medium text-white text-2xl lg:text-3xl">{item.title}</h3>
                  </div>
                  
                  {/* Content */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10">
                    <p className="text-white/80 text-lg leading-relaxed font-light">{content}</p>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      </div>

      {/* Additional Sections */}
      {(lessonPlan.checkForUnderstanding || lessonPlan.homework) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check for Understanding */}
          {lessonPlan.checkForUnderstanding && lessonPlan.checkForUnderstanding.length > 0 && (
            <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative z-10 p-6">
                <h5 className="text-white font-medium text-xl mb-4 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span>Check Understanding</span>
                </h5>
                <div className="space-y-3">
                  {lessonPlan.checkForUnderstanding.map((check, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        ?
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed">{check}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Homework */}
          {lessonPlan.homework && lessonPlan.homework.length > 0 && (
            <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative z-10 p-6">
                <h5 className="text-white font-medium text-xl mb-4 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  <span>Homework</span>
                </h5>
                <div className="space-y-3">
                  {lessonPlan.homework.map((task, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Worked Example */}
      {lessonPlan.workedExample && (
        <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative z-10 p-6 lg:p-8">
            <h5 className="text-white font-light text-2xl lg:text-3xl tracking-tight flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📐</span>
              </div>
              <span>Worked Example</span>
            </h5>
            
            <div className="bg-black/40 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-white/10">
              <pre className="text-white/90 font-mono text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                {lessonPlan.workedExample}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
