'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Award, BookOpen, Clock, Target, ChevronRight, Star, Trophy, Shield, Building, Database, Lock, Cloud, TrendingUp, BarChart, Settings, Briefcase, Brain } from 'lucide-react';

interface CertificationLevel {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  objectives: number;
  questions: number;
  passingScore?: number;
  cost?: string;
  popularity?: 'High' | 'Very High';
}

interface CertificationTrack {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  levels: CertificationLevel[];
  totalLearners?: string;
}

interface CertificationSelectorProps {
  onSelectLevel: (trackId: string, levelId: string) => void;
}

const CERTIFICATION_CATEGORIES = [
  {
    id: 'guilds',
    name: 'Your Enterprise\'s Guilds',
    description: 'Professional development tracks for enterprise teams and career growth',
    tracks: ['data-architect', 'data-engineer', 'data-scientist', 'ml-engineer', 'ai-engineer', 'software-engineer', 'business-intelligence']
  },
  {
    id: 'finance',
    name: 'Finance & Investment',
    description: 'Professional finance and investment certifications',
    tracks: ['cfa', 'frm', 'cpa']
  },
  {
    id: 'technology', 
    name: 'Technology & Cloud',
    description: 'Cloud computing and technology certifications',
    tracks: ['aws', 'google-cloud', 'microsoft-azure', 'oracle', 'salesforce']
  },
  {
    id: 'professional',
    name: 'Professional Development',
    description: 'Project management and professional skills',
    tracks: ['pmp', 'cissp', 'six-sigma']
  }
];

const CERTIFICATION_TRACKS: CertificationTrack[] = [
  // Enterprise Guilds
  {
    id: 'data-architect',
    name: 'Data Architect',
    provider: 'Enterprise Guild',
    description: 'Design and manage enterprise data architecture and infrastructure',
    icon: <Database className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-600',
    bgGradient: 'from-purple-500/20 to-indigo-600/20',
    totalLearners: '45K+',
    levels: []
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    provider: 'Enterprise Guild',
    description: 'Build and maintain robust data pipelines and processing systems',
    icon: <Settings className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/20 to-teal-600/20',
    totalLearners: '78K+',
    levels: [
      {
        id: 'data-engineer-cert',
        name: 'Data Engineer Certificate',
        description: 'Professional certification covering data architecture, pipelines, and analytics',
        duration: '2.5 hours',
        difficulty: 'Intermediate',
        objectives: 10,
        questions: 100,
        passingScore: 70
      }
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    provider: 'Enterprise Guild',
    description: 'Extract insights and build predictive models from complex data',
    icon: <BarChart className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/20 to-cyan-600/20',
    totalLearners: '92K+',
    levels: []
  },
  {
    id: 'ml-engineer',
    name: 'ML Engineer',
    provider: 'Enterprise Guild',
    description: 'Deploy and operationalize machine learning models at scale',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-500/20 to-red-600/20',
    totalLearners: '67K+',
    levels: [
      {
        id: 'ml-engineer-cert',
        name: 'Machine Learning Engineer Certificate',
        description: 'Professional certification covering ML lifecycle, MLOps, and AI systems',
        duration: '2.5 hours',
        difficulty: 'Intermediate',
        objectives: 10,
        questions: 100,
        passingScore: 70
      }
    ]
  },
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    provider: 'Enterprise Guild',
    description: 'Develop and integrate artificial intelligence solutions',
    icon: <Brain className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-500/20 to-rose-600/20',
    totalLearners: '56K+',
    levels: []
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    provider: 'Enterprise Guild',
    description: 'Design, develop, and maintain scalable software applications',
    icon: <Settings className="w-8 h-8" />,
    color: 'from-slate-500 to-gray-600',
    bgGradient: 'from-slate-500/20 to-gray-600/20',
    totalLearners: '180K+',
    levels: [
      {
        id: 'software-engineer-cert',
        name: 'Software Engineer Certificate',
        description: 'Professional certification covering SDLC, architecture, and engineering practices',
        duration: '2 hours',
        difficulty: 'Intermediate',
        objectives: 10,
        questions: 80,
        passingScore: 70
      }
    ]
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    provider: 'Enterprise Guild',
    description: 'Transform data into actionable business insights and reporting',
    icon: <BarChart className="w-8 h-8" />,
    color: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/20 to-purple-600/20',
    totalLearners: '34K+',
    levels: []
  },
  
  // Finance & Investment
  {
    id: 'cfa',
    name: 'CFA Program',
    provider: 'CFA Institute',
    description: 'The gold standard in investment management and financial analysis',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-500/20 to-orange-600/20',
    totalLearners: '250K+',
    levels: [
      {
        id: 'cfa-l1',
        name: 'CFA Level I',
        description: 'Foundation of investment tools, valuation, and asset management',
        duration: '4.5 hours',
        difficulty: 'Intermediate',
        objectives: 10,
        questions: 180,
        passingScore: 70,
        cost: '$1,450'
      },
      {
        id: 'cfa-l2',
        name: 'CFA Level II',
        description: 'Advanced analysis and application of investment tools',
        duration: '4.5 hours',
        difficulty: 'Advanced',
        objectives: 8,
        questions: 88,
        passingScore: 70,
        cost: '$1,450'
      },
      {
        id: 'cfa-l3',
        name: 'CFA Level III',
        description: 'Portfolio management and wealth planning mastery',
        duration: '4.5 hours',
        difficulty: 'Expert',
        objectives: 6,
        questions: 44,
        passingScore: 70,
        cost: '$1,450'
      }
    ]
  },
  {
    id: 'aws',
    name: 'AWS Certifications',
    provider: 'Amazon Web Services',
    description: 'Cloud computing expertise for the modern enterprise',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-orange-400 to-red-500',
    bgGradient: 'from-orange-500/20 to-red-600/20',
    totalLearners: '500K+',
    levels: [
      {
        id: 'aws-cloud-practitioner',
        name: 'Cloud Practitioner',
        description: 'Foundational cloud knowledge for non-technical roles',
        duration: '90 minutes',
        difficulty: 'Beginner',
        objectives: 4,
        questions: 65,
        passingScore: 700,
        cost: '$100',
        popularity: 'Very High'
      },
      {
        id: 'aws-saa',
        name: 'Solutions Architect Associate',
        description: 'Design distributed systems on AWS cloud platform',
        duration: '130 minutes',
        difficulty: 'Intermediate',
        objectives: 4,
        questions: 65,
        passingScore: 720,
        cost: '$150',
        popularity: 'Very High'
      },
      {
        id: 'aws-developer',
        name: 'Developer Associate',
        description: 'Develop and maintain AWS applications',
        duration: '130 minutes',
        difficulty: 'Intermediate',
        objectives: 4,
        questions: 65,
        passingScore: 720,
        cost: '$150'
      },
      {
        id: 'aws-sysops',
        name: 'SysOps Administrator',
        description: 'Deploy, manage, and operate AWS systems',
        duration: '130 minutes',
        difficulty: 'Intermediate',
        objectives: 4,
        questions: 65,
        passingScore: 720,
        cost: '$150'
      }
    ]
  },
  // Technology Certifications
  {
    id: 'pmp',
    name: 'PMP Certification',
    provider: 'PMI',
    description: 'Project Management Professional certification',
    icon: <Briefcase className="w-8 h-8" />,
    color: 'from-blue-400 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-600/20',
    totalLearners: '1M+',
    levels: []
  },
  {
    id: 'cissp',
    name: 'CISSP',
    provider: '(ISC)²',
    description: 'Certified Information Systems Security Professional',
    icon: <Lock className="w-8 h-8" />,
    color: 'from-red-400 to-pink-500',
    bgGradient: 'from-red-500/20 to-pink-600/20',
    totalLearners: '150K+',
    levels: []
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    provider: 'Google',
    description: 'Professional cloud architecture and engineering',
    icon: <Cloud className="w-8 h-8" />,
    color: 'from-green-400 to-teal-500',
    bgGradient: 'from-green-500/20 to-teal-600/20',
    totalLearners: '300K+',
    levels: []
  },
  {
    id: 'microsoft-azure',
    name: 'Microsoft Azure',
    provider: 'Microsoft',
    description: 'Cloud solutions and architecture expertise',
    icon: <Cloud className="w-8 h-8" />,
    color: 'from-blue-400 to-cyan-500',
    bgGradient: 'from-blue-500/20 to-cyan-600/20',
    totalLearners: '400K+',
    levels: []
  },
  // Finance & Business
  {
    id: 'frm',
    name: 'FRM',
    provider: 'GARP',
    description: 'Financial Risk Manager certification',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'from-emerald-400 to-green-500',
    bgGradient: 'from-emerald-500/20 to-green-600/20',
    totalLearners: '80K+',
    levels: []
  },
  {
    id: 'cpa',
    name: 'CPA',
    provider: 'AICPA',
    description: 'Certified Public Accountant',
    icon: <BarChart className="w-8 h-8" />,
    color: 'from-purple-400 to-violet-500',
    bgGradient: 'from-purple-500/20 to-violet-600/20',
    totalLearners: '650K+',
    levels: []
  },
  {
    id: 'six-sigma',
    name: 'Six Sigma',
    provider: 'ASQ',
    description: 'Quality management and process improvement',
    icon: <Settings className="w-8 h-8" />,
    color: 'from-gray-400 to-slate-500',
    bgGradient: 'from-gray-500/20 to-slate-600/20',
    totalLearners: '200K+',
    levels: []
  },
  // Technology - Programming
  {
    id: 'oracle',
    name: 'Oracle Database',
    provider: 'Oracle',
    description: 'Database administration and development',
    icon: <Database className="w-8 h-8" />,
    color: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-500/20 to-orange-600/20',
    totalLearners: '120K+',
    levels: []
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    provider: 'Salesforce',
    description: 'CRM platform administration and development',
    icon: <Building className="w-8 h-8" />,
    color: 'from-sky-400 to-blue-500',
    bgGradient: 'from-sky-500/20 to-blue-600/20',
    totalLearners: '250K+',
    levels: []
  }
];

export const CertificationSelector: React.FC<CertificationSelectorProps> = ({
  onSelectLevel
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(selectedTrack === trackId ? null : trackId);
  };

  const handleLevelSelect = (trackId: string, levelId: string) => {
    onSelectLevel(trackId, levelId);
  };

  const selectedTrackData = CERTIFICATION_TRACKS.find(track => track.id === selectedTrack);

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-white">
              Professional <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Certifications</span>
            </h1>
          </div>
            <p className="text-base text-white/70 max-w-2xl mx-auto">
              Master the skills that matter. Get certified in the world&apos;s most valuable professional credentials.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedTrack ? (
            <motion.div
              key="track-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Featured Certifications - CFA and AWS */}
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Featured Certifications</h2>
                  <p className="text-white/60">Start with our most popular tracks</p>
                </div>
                <div className="flex justify-center gap-8 max-w-2xl mx-auto">
                  {/* CFA Card */}
                  {(() => {
                    const cfaTrack = CERTIFICATION_TRACKS.find(t => t.id === 'cfa');
                    if (!cfaTrack) return null;
                    return (
                      <motion.div
                        className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-500/30 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:bg-slate-700/50 hover:border-slate-400/50 hover:shadow-2xl flex-1 max-w-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => handleTrackSelect(cfaTrack.id)}
                      >
                        <div className="p-8">
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${cfaTrack.color} flex items-center justify-center shadow-lg mb-4`}>
                              {cfaTrack.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{cfaTrack.name}</h3>
                            <p className="text-white/60 text-sm mb-3">{cfaTrack.provider}</p>
                            <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">{cfaTrack.description}</p>
                            {cfaTrack.totalLearners && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600/50">
                                <Star className="w-4 h-4 text-amber-400" />
                                <span className="text-white/90 text-sm font-medium">{cfaTrack.totalLearners} learners</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                  
                  {/* AWS Card */}
                  {(() => {
                    const awsTrack = CERTIFICATION_TRACKS.find(t => t.id === 'aws');
                    if (!awsTrack) return null;
                    return (
                      <motion.div
                        className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-500/30 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:bg-slate-700/50 hover:border-slate-400/50 hover:shadow-2xl flex-1 max-w-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => handleTrackSelect(awsTrack.id)}
                      >
                        <div className="p-8">
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${awsTrack.color} flex items-center justify-center shadow-lg mb-4`}>
                              {awsTrack.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{awsTrack.name}</h3>
                            <p className="text-white/60 text-sm mb-3">{awsTrack.provider}</p>
                            <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">{awsTrack.description}</p>
                            {awsTrack.totalLearners && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600/50">
                                <Star className="w-4 h-4 text-amber-400" />
                                <span className="text-white/90 text-sm font-medium">{awsTrack.totalLearners} learners</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>
              </div>

              {/* Other Certifications */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">More Certifications</h2>
                <p className="text-white/50 text-sm">Coming soon - expand your expertise across multiple domains</p>
              </div>

              {CERTIFICATION_CATEGORIES.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">{category.name}</h2>
                    <p className="text-sm text-white/60">{category.description}</p>
                  </div>
                  
                  {/* Category Cards Grid - Smaller cards */}
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {category.tracks.map((trackId) => {
                      const track = CERTIFICATION_TRACKS.find(t => t.id === trackId);
                      if (!track) return null;
                      
                      return (
                        <motion.div
                          key={track.id}
                          className={`group relative bg-slate-800/40 border border-slate-600/30 rounded-xl transition-all duration-300 overflow-hidden ${
                            track.levels && track.levels.length > 0 ? 'cursor-pointer hover:bg-slate-700/50 hover:border-slate-500/50' : 'cursor-not-allowed opacity-60'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (category.tracks.indexOf(trackId) * 0.05) }}
                          whileHover={track.levels && track.levels.length > 0 ? { y: -2, scale: 1.01 } : {}}
                          onClick={() => (track.levels && track.levels.length > 0) && handleTrackSelect(track.id)}
                        >
                          <div className="p-3">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${track.color} flex items-center justify-center shadow-sm`}>
                                <div className="scale-50">{track.icon}</div>
                              </div>
                              {track.totalLearners && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-700/50 border border-slate-600/50">
                                  <Star className="w-2.5 h-2.5 text-amber-400" />
                                  <span className="text-white/90 text-xs font-medium">{track.totalLearners}</span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="mb-3">
                              <h3 className="text-sm font-semibold text-white mb-1">{track.name}</h3>
                              <p className="text-white/50 text-xs mb-1">{track.provider}</p>
                              <p className="text-white/70 text-xs leading-relaxed overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{track.description}</p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              {track.levels && track.levels.length > 0 ? (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30">
                                  <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                                  <span className="text-emerald-300 text-xs font-medium">Available</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-600/50 border border-slate-500/50">
                                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                                  <span className="text-slate-400 text-xs font-medium">Soon</span>
                                </div>
                              )}
                              
                              {track.levels && track.levels.length > 0 && (
                                <ChevronRight className="w-3 h-3 text-white/50 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="level-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back button */}
              <motion.button
                className="flex items-center gap-2 text-white/70 hover:text-white mb-8 group"
                onClick={() => setSelectedTrack(null)}
                whileHover={{ x: -5 }}
              >
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to certifications
              </motion.button>

              {selectedTrackData && (
                <>
                  {/* Track header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${selectedTrackData.color} flex items-center justify-center`}>
                      {selectedTrackData.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedTrackData.name}</h2>
                      <p className="text-white/70">{selectedTrackData.provider}</p>
                    </div>
                  </div>

                  {/* Levels grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedTrackData.levels.map((level, index) => (
                      <motion.div
                        key={level.id}
                        className="group relative bg-black/60 backdrop-blur-xl rounded-2xl border border-white/30 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onHoverStart={() => setHoveredLevel(level.id)}
                        onHoverEnd={() => setHoveredLevel(null)}
                        onClick={() => handleLevelSelect(selectedTrackData.id, level.id)}
                      >
                        {/* Hover gradient */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${selectedTrackData.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                        />

                        <div className="relative z-10 p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedTrackData.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {index + 1}
                              </div>
                              {level.popularity && (
                                <div className="px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/30">
                                  <span className="text-yellow-300 text-xs font-medium">Popular</span>
                                </div>
                              )}
                            </div>
                            <Award className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
                          </div>

                          {/* Content */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
                            <p className="text-white/70 text-sm mb-4 leading-relaxed">{level.description}</p>
                            
                            {/* Difficulty badge */}
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              level.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                              level.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                              level.difficulty === 'Advanced' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                              'bg-red-500/20 text-red-300 border border-red-400/30'
                            }`}>
                              <Target className="w-3 h-3" />
                              {level.difficulty}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-white/60" />
                                <span className="text-white/60 text-xs">Duration</span>
                              </div>
                              <div className="text-white font-semibold text-sm">{level.duration}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="w-4 h-4 text-white/60" />
                                <span className="text-white/60 text-xs">Questions</span>
                              </div>
                              <div className="text-white font-semibold text-sm">{level.questions}</div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Learning Objectives</span>
                              <span className="text-white font-medium">{level.objectives}</span>
                            </div>
                            {level.passingScore && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Passing Score</span>
                                <span className="text-white font-medium">{level.passingScore}%</span>
                              </div>
                            )}
                            {level.cost && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Exam Cost</span>
                                <span className="text-white font-medium">{level.cost}</span>
                              </div>
                            )}
                          </div>

                          {/* Action */}
                          <motion.div
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors"
                            animate={{ 
                              scale: hoveredLevel === level.id ? 1.02 : 1,
                              backgroundColor: hoveredLevel === level.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
                            }}
                          >
                            <span className="text-white font-medium text-sm">Start Learning</span>
                            <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
