'use client';

import { useRef } from 'react';

interface GuildDataInputProps {
  inputData: string;
  onInputChange: (data: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  error: string | null;
}

export default function GuildDataInput({
  inputData,
  onInputChange,
  onGenerate,
  onReset,
  isGenerating,
  error
}: GuildDataInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canGenerate = inputData.trim().length > 0;

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Input Guild Data</h2>
        <p className="text-sm text-white/60 mt-1">
          Enter training materials, job descriptions, or curriculum content as text
        </p>
      </div>

      {/* Text Input Section */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Text Input</h3>
              <p className="text-xs text-white/60">Paste or type content directly</p>
            </div>
            {inputData.length > 0 && (
              <span className="ml-auto bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded border border-blue-400/30">
                {inputData.length} chars
              </span>
            )}
          </div>
          
          <div>
            <label htmlFor="guild-input" className="block text-sm font-medium text-white/80 mb-2">
              Training Content or Job Description
            </label>
            <textarea
              ref={textareaRef}
              id="guild-input"
              rows={12}
              value={inputData}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 resize-none backdrop-blur-sm"
              placeholder="Paste job descriptions, training materials, course syllabi, skill requirements, or any content that describes the competencies for your guild certificate...

Examples:
• Job posting with required skills and responsibilities
• Course curriculum or training outline  
• List of technical competencies and frameworks
• Certification requirements from other programs
• Skills matrix or competency framework"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{inputData.length} characters</span>
            {inputData.length > 10000 && (
              <span className="text-amber-300">Large input - may take longer to process</span>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            disabled={!canGenerate || isGenerating}
            className="text-sm text-white/60 hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear All
          </button>
          
          <div className="flex items-center space-x-3">
            {canGenerate && (
              <span className="text-xs text-white/60">
                Ready to generate
              </span>
            )}
            <button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
