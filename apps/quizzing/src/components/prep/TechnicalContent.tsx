'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Lightbulb, Target, ChevronDown, ChevronRight, Loader } from 'lucide-react';

interface TechnicalContentProps {
  company: string;
  role: string;
  level: string;
  contentType: 'coding' | 'algorithms' | 'system-design';
}

interface TechnicalProblem {
  title: string;
  difficulty: string;
  description: string;
  hints: string[];
  solution: string;
  companyRelevance: string;
}

interface TechnicalConcept {
  name: string;
  explanation: string;
  examples: string[];
}

interface TechnicalData {
  problems: TechnicalProblem[];
  concepts: TechnicalConcept[];
}

export const TechnicalContent: React.FC<TechnicalContentProps> = ({ company, role, level, contentType }) => {
  const [data, setData] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  useEffect(() => {
    fetchTechnicalContent();
  }, [company, role, level, contentType]);

  const fetchTechnicalContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/technical-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, level, contentType }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch technical content');
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'hard':
        return 'text-red-400 bg-red-500/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'coding':
        return <Code className="w-5 h-5 text-blue-400" />;
      case 'algorithms':
        return <Target className="w-5 h-5 text-purple-400" />;
      case 'system-design':
        return <Lightbulb className="w-5 h-5 text-orange-400" />;
    }
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
        <p className="text-white/70">Generating {contentType} content for {company}...</p>
        <p className="text-white/50 text-sm mt-2">Creating {level}-level problems and concepts</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Code className="w-8 h-8 text-red-400" />
        </div>
        <h4 className="text-xl font-light text-white mb-2">Generation Error</h4>
        <p className="text-white/70 mb-4">{error}</p>
        <button
          onClick={fetchTechnicalContent}
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {getContentTypeIcon()}
        <div>
          <h3 className="text-xl font-light text-white">
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Practice
          </h3>
          <p className="text-white/60 text-sm">
            {company} • {role} • {level} level
          </p>
        </div>
      </div>

      {/* Problems Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-white">Practice Problems</h4>
        {data.problems.map((problem, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Problem Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <h5 className="text-lg font-medium text-white">{problem.title}</h5>
                <span className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
              
              <p className="text-white/80 leading-relaxed mb-4">{problem.description}</p>
              
              <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-lg p-3 mb-4">
                <p className="text-cyan-200 text-sm font-medium">{company} Relevance:</p>
                <p className="text-cyan-100 text-sm mt-1">{problem.companyRelevance}</p>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-white/20">
              {/* Hints */}
              <button
                onClick={() => setExpandedProblem(expandedProblem === `${index}-hints` ? null : `${index}-hints`)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <span className="text-white/90 font-medium">Hints ({problem.hints.length})</span>
                {expandedProblem === `${index}-hints` ? 
                  <ChevronDown className="w-4 h-4 text-white/60" /> : 
                  <ChevronRight className="w-4 h-4 text-white/60" />
                }
              </button>
              
              {expandedProblem === `${index}-hints` && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4"
                >
                  <div className="space-y-2">
                    {problem.hints.map((hint, hintIndex) => (
                      <div key={hintIndex} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg">
                        <div className="w-5 h-5 rounded-full bg-yellow-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-200 text-xs">{hintIndex + 1}</span>
                        </div>
                        <span className="text-white/80 text-sm">{hint}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Solution */}
              <button
                onClick={() => setExpandedProblem(expandedProblem === `${index}-solution` ? null : `${index}-solution`)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-t border-white/10"
              >
                <span className="text-white/90 font-medium">Solution</span>
                {expandedProblem === `${index}-solution` ? 
                  <ChevronDown className="w-4 h-4 text-white/60" /> : 
                  <ChevronRight className="w-4 h-4 text-white/60" />
                }
              </button>
              
              {expandedProblem === `${index}-solution` && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4"
                >
                  <div className="p-4 bg-white/5 rounded-lg">
                    <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {problem.solution}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Concepts Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-white">Key Concepts to Review</h4>
        {data.concepts.map((concept, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (data.problems.length + index) * 0.1 }}
          >
            <button
              onClick={() => setExpandedConcept(expandedConcept === concept.name ? null : concept.name)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{concept.name}</span>
              </div>
              {expandedConcept === concept.name ? 
                <ChevronDown className="w-4 h-4 text-white/60" /> : 
                <ChevronRight className="w-4 h-4 text-white/60" />
              }
            </button>
            
            {expandedConcept === concept.name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6 border-t border-white/20"
              >
                <div className="pt-4 space-y-4">
                  <p className="text-white/80 leading-relaxed">{concept.explanation}</p>
                  
                  {concept.examples.length > 0 && (
                    <div>
                      <h6 className="text-white/90 font-medium mb-2">Examples:</h6>
                      <div className="space-y-2">
                        {concept.examples.map((example, exampleIndex) => (
                          <div key={exampleIndex} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white/70 text-sm">{example}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center pt-4">
        <button
          onClick={fetchTechnicalContent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors text-sm border border-white/20"
        >
          <Loader className="w-4 h-4" />
          Generate New Content
        </button>
      </div>
    </motion.div>
  );
};
