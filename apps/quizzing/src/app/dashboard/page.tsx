'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Building2, MapPin, DollarSign, Clock, Target } from 'lucide-react';

interface Job {
  id: string;
  url: string;
  skills: string[];
  analysis?: {
    jobTitle: string;
    company?: string;
    location?: string;
    salary?: string;
    experienceLevel?: string;
  };
  interviewStructure?: {
    stages: Array<{
      id: string;
      name: string;
    }>;
  };
  thinking?: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Load jobs from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('elandi-jobs');
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs);
        setJobs(parsedJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
            Interview <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-lg font-light text-white/70">
            Prepare for your upcoming interviews with AI-powered, company-specific practice
          </p>
        </motion.div>

        {/* No Jobs State */}
        {jobs.length === 0 && (
          <motion.div
            className="text-center py-20 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto border border-white/20">
              <Target className="w-8 h-8 text-white/70" />
            </div>
            <h3 className="text-2xl font-light text-white mb-4">No Jobs Analyzed Yet</h3>
            <p className="text-lg font-light text-white/70 mb-8 leading-relaxed">
              Add your first job posting to start building your personalized interview preparation plan
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors font-medium"
            >
              <span>+ Analyze Your First Job</span>
            </Link>
          </motion.div>
        )}

        {/* Jobs Grid */}
        {jobs.length > 0 && (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/40 p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Job Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">
                      {job.analysis?.jobTitle || 'Job Position'}
                    </h3>
                    <p className="text-lg font-light text-cyan-300 mb-3">
                      {job.analysis?.company || 'Company'}
                    </p>
                    
                    {/* Job Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-white/70">
                      {job.analysis?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {job.analysis.location}
                        </div>
                      )}
                      {job.analysis?.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          {job.analysis.salary}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {job.skills?.length || 0} skills
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Preview */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white/90 text-sm font-medium mb-3">Skills to Practice</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 6).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full border border-white/20"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full border border-white/30">
                          +{job.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Interview Stages */}
                {job.interviewStructure?.stages && (
                  <div className="space-y-3 mb-6">
                    <h4 className="text-white/90 text-sm font-medium mb-3">Interview Stages</h4>
                    {job.interviewStructure.stages.slice(0, 3).map((stage) => {
                      console.log('🎯 Dashboard rendering stage:', stage.id, stage.name);
                      return (
                        <Link 
                          key={stage.id} 
                          href={`/prep/${job.id}/${stage.id}`}
                          className="block"
                          onClick={() => {
                            console.log('🚀 Dashboard: Clicking stage:', stage.id, 'URL:', `/prep/${job.id}/${stage.id}`);
                          }}
                        >
                        <motion.div
                          className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 transition-all duration-200 cursor-pointer group"
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            <span className="text-white group-hover:text-cyan-300 transition-colors text-sm">
                              {stage.name}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-cyan-300 transition-colors" />
                        </motion.div>
                      </Link>
                      );
                    })}
                    {job.interviewStructure.stages.length > 3 && (
                      <div className="text-center pt-2">
                        <Link 
                          href={`/prep/${job.id}/overview`}
                          className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                        >
                          +{job.interviewStructure.stages.length - 3} more stages
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/prep/${job.id}/overview`}
                    className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-center rounded-xl transition-colors text-sm font-medium"
                  >
                    Interview Prep
                  </Link>
                  <Link 
                    href={`/learn/${job.id}`}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-xl transition-colors text-sm font-medium"
                  >
                    Free Learning
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add New Job */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/30 hover:border-white/50"
          >
            <span>+ Add New Job</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
