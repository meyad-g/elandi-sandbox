import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '../../types/quiz';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SkillAnalysisResult } from '@sandbox-apps/ai';
import { DollarSign, MapPin, Home, Briefcase, ExternalLink, Target, Sparkles, Search, TrendingUp } from 'lucide-react';

interface JobsTabProps {
  jobs: Job[];
  onStart: (job: Job) => void;
  onAddJob: (data: { url: string; skills: string[]; questions: Job['questions']; analysis?: SkillAnalysisResult; thinking?: string }) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({ jobs, onStart, onAddJob }) => {
  const [expandedThinking, setExpandedThinking] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentThinking, setAgentThinking] = useState('');

  const toggleThinking = (jobId: string) => {
    setExpandedThinking(expandedThinking === jobId ? null : jobId);
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAgentThinking('');

    try {
      // Basic validation - input should not be empty and should be reasonable length
      if (!url.trim()) {
        throw new Error('Please enter a job posting URL or search terms.');
      }
      if (url.trim().length < 3) {
        throw new Error('Please enter a more specific job search term or URL.');
      }

      setLoading(true);

      // Call the server-side API with streaming enabled
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: url, stream: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze job posting');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let analysis = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (data.type === 'thinking') {
                setAgentThinking(prev => prev + data.content);
              } else if (data.type === 'result') {
                analysis = data.content;
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch {
              console.warn('Could not parse streaming chunk:', line);
            }
          }
        }
      }

      if (!analysis) {
        throw new Error('No analysis result received');
      }

      // Save the thinking before clearing it
      const finalThinking = agentThinking;

      onAddJob({
        url,
        skills: analysis.skills,
        questions: [],
        analysis,
        thinking: finalThinking
      });

      // Clear form
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job posting');
    } finally {
      setLoading(false);
      setAgentThinking('');
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 px-6 py-16 md:py-24">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-cyan-300 text-sm font-medium">AI-Powered Job Analysis</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-light text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Discover Your Next
              <br />
              <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Learning Opportunity
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Analyze job postings and generate personalized learning paths with AI-powered skill assessment
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Add Job Section */}
          <motion.div
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-light text-white mb-4">
                Analyze a <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Job Posting</span>
              </h3>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Enter a job posting URL or search terms to generate AI-powered questions and skill assessments
              </p>
            </motion.div>
            <motion.form
              onSubmit={handleAddJob}
              className="max-w-2xl mx-auto space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Input
                  label="Job posting URL or search terms"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://company.com/jobs/software-engineer or 'software engineer at Meta'"
                  error={error}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
              </motion.div>

              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-4 text-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/25"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5" />
                      Analyze Job
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Show agent thinking process */}
            <AnimatePresence>
              {agentThinking && (
                <motion.div
                  className="mt-8 p-6 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="text-cyan-300 font-medium">AI Agent analyzing...</div>
                  </div>
                  <div className="text-slate-300 font-mono text-sm whitespace-pre-wrap max-h-40 overflow-y-auto bg-slate-800/50 rounded-lg p-4">
                    {agentThinking}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
      </motion.div>

          {/* Jobs List Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div>
                <h3 className="text-2xl font-light text-white mb-2">
                  Your <span className="font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Saved Jobs</span>
                </h3>
                <p className="text-slate-400 text-sm">
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 text-sm font-medium">{jobs.length}</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {jobs.length === 0 && (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 mb-6">
                    <Target className="w-10 h-10 text-slate-400" />
                  </div>
                  <h4 className="text-xl font-light text-white mb-3">
                    No Jobs Saved Yet
                  </h4>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    Add your first job posting above to generate personalized learning paths and skill assessments
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <AnimatePresence>
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 hover:bg-slate-800/70 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    {/* Job Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1 line-clamp-1 text-lg">
                          {job.analysis?.jobTitle || 'Job Position'}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {job.analysis?.company || 'Company'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20">
                        <Target className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-300 text-xs font-medium">{job.skills?.length || 0} skills</span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-6">
                      {job.analysis?.salary && (
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-400/20">
                          <DollarSign size={14} className="text-green-400" />
                          <span className="text-green-300 text-xs font-medium">{job.analysis.salary}</span>
                        </span>
                      )}
                      {job.analysis?.location && (
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20">
                          <MapPin size={14} className="text-blue-400" />
                          <span className="text-blue-300 text-xs font-medium">{job.analysis.location}</span>
                        </span>
                      )}
                      {job.analysis?.remote && (
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20">
                          <Home size={14} className="text-purple-400" />
                          <span className="text-purple-300 text-xs font-medium">Remote</span>
                        </span>
                      )}
                      {job.analysis?.employmentType && (
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20">
                          <Briefcase size={14} className="text-indigo-400" />
                          <span className="text-indigo-300 text-xs font-medium">{job.analysis.employmentType}</span>
                        </span>
                      )}
                    </div>
                    </div>

                    {/* Skills Preview */}
                    {(job.skills || []).length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {(job.skills || []).slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs border border-slate-600/50"
                            >
                              {skill}
                            </span>
                          ))}
                          {(job.skills || []).length > 4 && (
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-400/20 font-medium">
                              +{(job.skills || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => onStart(job)}
                        className="flex-1 group flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Target className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Start Learning
                      </motion.button>
                      <motion.a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 flex items-center justify-center border border-slate-600/50 hover:border-slate-500/50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ExternalLink size={16} />
                      </motion.a>
                    </div>

                    {/* Agent Thinking Section */}
                    {job.thinking && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <button
                          onClick={() => toggleThinking(job.id)}
                          className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>AI Analysis</span>
                          <span className="text-xs ml-auto">
                            {expandedThinking === job.id ? '−' : '+'}
                          </span>
                        </button>

                        <AnimatePresence>
                          {expandedThinking === job.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                            >
                              <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {job.thinking}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
