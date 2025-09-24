'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, ExternalLink, Building2, TrendingUp, Users, Lightbulb } from 'lucide-react';

interface CompanyResearchContentProps {
  company: string;
  role: string;
}

interface CompanyResearchData {
  overview: string;
  mission: string;
  values: string[];
  recentNews: string[];
  culture: string;
  competitivePosition: string;
  interviewFocus: string[];
  preparationTips: string[];
}

export const CompanyResearchContent: React.FC<CompanyResearchContentProps> = ({ company, role }) => {
  const [research, setResearch] = useState<CompanyResearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyResearch();
  }, [company, role]);

  const fetchCompanyResearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add timestamp to force fresh data generation
      const response = await fetch('/api/company-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company, 
          role,
          timestamp: Date.now() // Forces fresh generation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company research');
      }

      const data = await response.json();
      setResearch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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
        <p className="text-white/70">Researching {company}...</p>
        <p className="text-white/50 text-sm mt-2">This may take a moment as we gather current information</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="w-8 h-8 text-red-400" />
        </div>
        <h4 className="text-xl font-light text-white mb-2">Research Error</h4>
        <p className="text-white/70 mb-4">{error}</p>
        <button
          onClick={fetchCompanyResearch}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!research) return null;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Company Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-white">Company Overview</h3>
        </div>
        <p className="text-white/80 leading-relaxed">{research.overview}</p>
      </div>

      {/* Mission & Values */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-white">Mission</h3>
          </div>
          <p className="text-white/80 leading-relaxed">{research.mission}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-medium text-white">Core Values</h3>
          </div>
          <div className="space-y-2">
            {research.values.map((value, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-white/80">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent News */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-medium text-white">Recent Developments</h3>
        </div>
        <div className="space-y-3">
          {research.recentNews.map((news, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-white/80">{news}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Culture & Competitive Position */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">Company Culture</h3>
          <p className="text-white/80 leading-relaxed">{research.culture}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-white mb-4">Market Position</h3>
          <p className="text-white/80 leading-relaxed">{research.competitivePosition}</p>
        </div>
      </div>

      {/* Interview Focus */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">What {company} Looks for in {role} Candidates</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {research.interviewFocus.map((focus, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
              <span className="text-white/90">{focus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preparation Tips */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Preparation Recommendations</h3>
        <div className="space-y-3">
          {research.preparationTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-200 text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-white/90 leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center pt-4">
        <button
          onClick={fetchCompanyResearch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors text-sm border border-white/20"
        >
          <Loader className="w-4 h-4" />
          Refresh Research
        </button>
      </div>
    </motion.div>
  );
};
