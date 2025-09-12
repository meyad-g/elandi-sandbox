import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SkillAnalysisResult } from '@sandbox-apps/ai';

interface IntroProps {
  onReady: (data: { url: string; skills: string[]; questions: any[]; analysis?: SkillAnalysisResult; thinking?: string }) => void;
}

export const Intro: React.FC<IntroProps> = ({ onReady }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentThinking, setAgentThinking] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAgentThinking('');

    try {
      if (!/^https?:\/\//i.test(url)) {
        throw new Error('Please enter a valid http(s) URL.');
      }

      setLoading(true);

      // Call the server-side API with streaming enabled
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, stream: true }),
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

      // For now, generate empty questions array - will be filled by streaming later
      const questions: any[] = [];

      // Save the thinking before clearing it
      const finalThinking = agentThinking;

      onReady({
        url,
        skills: analysis.skills,
        questions,
        analysis,
        thinking: finalThinking
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job posting');
    } finally {
      setLoading(false);
      setAgentThinking('');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500" />
        <div className="font-bold text-lg">DS Quiz Generator</div>
      </div>

      <form onSubmit={handleGenerate} className="w-full space-y-4">
        <Input
          label="Paste job description URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://company.com/jobs/data-scientist"
          error={error}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Analyzing JD…' : 'Generate tailored quiz'}
        </Button>

        {/* Show agent thinking process */}
        {agentThinking && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-300 mb-2">🤖 Agent thinking...</div>
            <div className="text-xs text-gray-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {agentThinking}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-400">
          We'll extract required skills, curate a True/False quiz, then launch the quiz view.
        </div>
      </form>
    </div>
  );
};
