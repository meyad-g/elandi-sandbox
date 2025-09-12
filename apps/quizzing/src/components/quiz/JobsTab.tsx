import React, { useState } from 'react';
import { Job, Stats } from '../../types/quiz';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SkillChip } from '../ui/SkillChip';
import { SkillAnalysisResult } from '@sandbox-apps/ai';
import { DollarSign, MapPin, Home, Briefcase, ExternalLink, Target } from 'lucide-react';

interface JobsTabProps {
  jobs: Job[];
  onStart: (job: Job) => void;
  onAddJob: (data: { url: string; skills: string[]; questions: any[]; analysis?: SkillAnalysisResult; thinking?: string }) => void;
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
            } catch (parseError) {
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
    <div className="h-full overflow-y-auto space-y-8">
      {/* Add Job Section */}
      <div className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner">
        <h3 className="text-xl font-bold font-geist-sans mb-4 text-primary-cosmos">Add New Job</h3>
        <p className="text-tertiary-4 text-sm font-dm-mono uppercase mb-4">
          Enter a job posting URL or search terms like "software engineer at Meta" to generate AI-powered questions
        </p>
        <form onSubmit={handleAddJob} className="space-y-4">
          <Input
            label="Job posting URL or search terms"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://company.com/jobs/software-engineer or 'software engineer at Meta'"
            error={error}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze job'}
          </Button>

          {/* Show agent thinking process */}
          {agentThinking && (
            <div className="mt-4 p-4 bg-tertiary-8 rounded-lg border border-tertiary-6 card-corner">
              <div className="text-sm text-tertiary-4 mb-2 font-dm-mono uppercase">AI Agent searching and analyzing...</div>
              <div className="text-xs text-primary-cosmos font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                {agentThinking}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-geist-sans text-primary-cosmos">Saved Jobs</h3>
          <div className="text-sm text-tertiary-4 font-dm-mono uppercase">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
          </div>
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-elandi-accent flex items-center justify-center mb-6 mx-auto">
              <Target size={32} className="text-primary-stellar" />
            </div>
            <h4 className="text-lg font-bold font-geist-sans text-primary-cosmos mb-2">No Jobs Yet</h4>
            <p className="text-tertiary-4 text-sm font-dm-mono uppercase">
              Add your first job posting to start generating personalized questions
            </p>
          </div>
        )}
      </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner hover:border-primary-fornax-2/30 transition-elandi group"
          >
            {/* Job Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold font-geist-sans text-primary-cosmos mb-1 line-clamp-1">
                    {job.analysis?.jobTitle || 'Job Position'}
                  </h4>
                  <p className="text-tertiary-4 text-sm font-dm-mono uppercase">
                    {job.analysis?.company || 'Company'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-tertiary-4 font-dm-mono uppercase">Skills</div>
                  <div className="text-lg font-bold text-secondary-ethereal-2">
                    {job.skills?.length || 0}
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-tertiary-4 mb-3">
                {job.analysis?.salary && (
                  <span className="flex items-center gap-1 bg-semantic-success-1 text-semantic-success-2 px-2 py-1 rounded font-dm-mono">
                    <DollarSign size={12} />
                    {job.analysis.salary}
                  </span>
                )}
                {job.analysis?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {job.analysis.location}
                  </span>
                )}
                {job.analysis?.remote && (
                  <span className="flex items-center gap-1 text-secondary-ethereal-2">
                    <Home size={12} />
                    Remote
                  </span>
                )}
                {job.analysis?.employmentType && (
                  <span className="bg-secondary-ethereal-1/20 text-secondary-ethereal-2 px-2 py-1 rounded font-dm-mono">
                    <Briefcase size={12} />
                    {job.analysis.employmentType}
                  </span>
                )}
              </div>
            </div>

            {/* Skills Section */}
            {(job.skills || []).length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {(job.skills || []).slice(0, 6).map((skill) => (
                    <SkillChip key={skill} skill={skill} variant="default" />
                  ))}
                  {(job.skills || []).length > 6 && (
                    <span className="text-tertiary-4 text-xs font-dm-mono uppercase px-2 py-1 bg-tertiary-7 rounded">
                      +{(job.skills || []).length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Agent Thinking Section */}
            {job.thinking && (
              <div className="mb-4">
                <button
                  onClick={() => toggleThinking(job.id)}
                  className="text-sm text-tertiary-4 hover:text-primary-cosmos flex items-center gap-1 transition-colors font-dm-mono uppercase"
                >
                  AI Agent thinking
                  <span className="text-xs">
                    {expandedThinking === job.id ? '▼' : '▶'}
                  </span>
                </button>

                {expandedThinking === job.id && (
                  <div className="mt-2 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6 card-corner">
                    <div className="text-xs text-primary-cosmos font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {job.thinking}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="small"
                onClick={() => onStart(job)}
                className="flex-1 group-hover:scale-105 transition-elandi"
              >
                Start Quiz
              </Button>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-tertiary-7 hover:bg-tertiary-6 text-tertiary-4 hover:text-primary-cosmos rounded-lg transition-colors flex items-center font-dm-mono uppercase text-sm"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
