'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, MessageSquare, Lightbulb, Loader, ChevronDown, ChevronRight } from 'lucide-react';

interface BehavioralContentProps {
  company: string;
  role: string;
}

interface StarScenario {
  competency: string;
  situation: string;
  questions: string[];
  framework: string;
  companyContext: string;
}

interface CompanyValue {
  value: string;
  description: string;
  exampleBehaviors: string[];
}

interface BehavioralData {
  starScenarios: StarScenario[];
  companyValues: CompanyValue[];
}

export const BehavioralContent: React.FC<BehavioralContentProps> = ({ company, role }) => {
  const [data, setData] = useState<BehavioralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);

  useEffect(() => {
    fetchBehavioralContent();
  }, [company, role]);

  const fetchBehavioralContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/behavioral-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch behavioral content');
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getCompetencyIcon = (competency: string) => {
    const comp = competency.toLowerCase();
    if (comp.includes('leadership')) return <Users className="w-5 h-5 text-blue-400" />;
    if (comp.includes('problem')) return <Lightbulb className="w-5 h-5 text-yellow-400" />;
    if (comp.includes('failure')) return <MessageSquare className="w-5 h-5 text-red-400" />;
    return <Star className="w-5 h-5 text-purple-400" />;
  };

  const getCompetencyColor = (competency: string) => {
    const comp = competency.toLowerCase();
    if (comp.includes('leadership')) return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
    if (comp.includes('problem')) return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
    if (comp.includes('failure')) return 'from-red-500/20 to-pink-500/20 border-red-400/30';
    return 'from-purple-500/20 to-indigo-500/20 border-purple-400/30';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-white/70">Analyzing {company} culture and values...</p>
        <p className="text-white/50 text-sm mt-2">Creating STAR scenarios and behavioral frameworks</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-400" />
        </div>
        <h4 className="text-xl font-light text-white mb-2">Generation Error</h4>
        <p className="text-white/70 mb-4">{error}</p>
        <button
          onClick={fetchBehavioralContent}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Company Values */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-light text-white">{company} Values</h3>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
          {data.companyValues.map((value, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => setExpandedValue(expandedValue === value.value ? null : value.value)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">{value.value}</span>
                </div>
                {expandedValue === value.value ? 
                  <ChevronDown className="w-4 h-4 text-white/60" /> : 
                  <ChevronRight className="w-4 h-4 text-white/60" />
                }
              </button>
              
              {expandedValue === value.value && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6 border-t border-white/20"
                >
                  <div className="pt-4 space-y-4">
                    <p className="text-white/80 leading-relaxed">{value.description}</p>
                    
                    <div>
                      <h6 className="text-white/90 font-medium mb-2">Example Behaviors:</h6>
                      <div className="space-y-2">
                        {value.exampleBehaviors.map((behavior, behaviorIndex) => (
                          <div key={behaviorIndex} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white/70 text-sm">{behavior}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* STAR Scenarios */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-light text-white">STAR Method Scenarios</h3>
        </div>

        {data.starScenarios.map((scenario, index) => (
          <motion.div
            key={index}
            className={`bg-gradient-to-r ${getCompetencyColor(scenario.competency)} rounded-xl border overflow-hidden`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (data.companyValues.length + index) * 0.1 }}
          >
            <button
              onClick={() => setExpandedScenario(expandedScenario === scenario.competency ? null : scenario.competency)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getCompetencyIcon(scenario.competency)}
                <div className="text-left">
                  <h4 className="text-white font-medium">{scenario.competency}</h4>
                  <p className="text-white/70 text-sm">{scenario.questions.length} practice questions</p>
                </div>
              </div>
              {expandedScenario === scenario.competency ? 
                <ChevronDown className="w-4 h-4 text-white/60" /> : 
                <ChevronRight className="w-4 h-4 text-white/60" />
              }
            </button>
            
            {expandedScenario === scenario.competency && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 border-t border-white/20"
              >
                <div className="pt-6 space-y-6">
                  {/* Company Context */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h5 className="text-white/90 font-medium mb-2">Why {company} Values This:</h5>
                    <p className="text-white/80 text-sm leading-relaxed">{scenario.companyContext}</p>
                  </div>

                  {/* Example Situation */}
                  <div>
                    <h5 className="text-white/90 font-medium mb-2">Example Situation:</h5>
                    <p className="text-white/80 text-sm leading-relaxed bg-white/5 p-3 rounded-lg">
                      {scenario.situation}
                    </p>
                  </div>

                  {/* Practice Questions */}
                  <div>
                    <h5 className="text-white/90 font-medium mb-3">Practice Questions:</h5>
                    <div className="space-y-2">
                      {scenario.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-purple-200 text-xs">{questionIndex + 1}</span>
                          </div>
                          <span className="text-white/80 text-sm">{question}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STAR Framework */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg p-4">
                    <h5 className="text-white/90 font-medium mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-400" />
                      STAR Framework for {scenario.competency}:
                    </h5>
                    <p className="text-white/80 text-sm leading-relaxed">{scenario.framework}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* STAR Method Guide */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-indigo-400" />
          STAR Method Quick Reference
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-200 text-xs font-bold">S</span>
              </div>
              <div>
                <h5 className="text-white/90 font-medium">Situation</h5>
                <p className="text-white/70 text-sm">Set the context and background</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-200 text-xs font-bold">T</span>
              </div>
              <div>
                <h5 className="text-white/90 font-medium">Task</h5>
                <p className="text-white/70 text-sm">Explain your responsibility or goal</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-200 text-xs font-bold">A</span>
              </div>
              <div>
                <h5 className="text-white/90 font-medium">Action</h5>
                <p className="text-white/70 text-sm">Describe the steps you took</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-200 text-xs font-bold">R</span>
              </div>
              <div>
                <h5 className="text-white/90 font-medium">Result</h5>
                <p className="text-white/70 text-sm">Share the outcome and impact</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center pt-4">
        <button
          onClick={fetchBehavioralContent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors text-sm border border-white/20"
        >
          <Loader className="w-4 h-4" />
          Refresh Content
        </button>
      </div>
    </motion.div>
  );
};
