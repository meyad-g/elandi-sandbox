'use client';

import React, { useState } from 'react';
import { TabType, Job, Stats } from '../types/quiz';
import { MinimalQuiz } from './quiz/MinimalQuiz';
import { JobsTab } from './quiz/JobsTab';
import { ProfileTab } from './quiz/ProfileTab';
import { BottomNav } from './quiz/BottomNav';
import { Building2, DraftingCompass, User } from 'lucide-react';

export const QuizApp: React.FC = () => {
  const [tab, setTab] = useState<TabType>('jobs');

  // Quiz state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [quizMode, setQuizMode] = useState(false);

  // Saved jobs (very simple local state)
  const [jobs, setJobs] = useState<Job[]>([]);

  // Basic stats placeholder
  const [stats, setStats] = useState<Stats>({ sessions: 0, answered: 0, accuracy: 0 });

  const addJob = ({ url, skills, questions, analysis, thinking }: { url: string; skills: string[]; questions: any[]; analysis?: any; thinking?: string }) => {
    const id = Date.now().toString();
    setJobs((prev) => [{ id, url, skills, questions, analysis, thinking }, ...prev]);
  };

  const startQuizFromJob = (job: Job) => {
    console.log('🚀 QuizApp: Starting quiz from job:', job);
    console.log('🚀 QuizApp: Job skills:', job.skills);
    console.log('🚀 QuizApp: Job skills length:', job.skills.length);
    setActiveJob(job);
    setSelectedSkills(job.skills);
    setQuizMode(true);
  };

  const exitQuiz = () => {
    setQuizMode(false);
    setActiveJob(null);
    setSelectedSkills([]);
  };

  const renderContent = () => {
    if (quizMode && activeJob) {
      return (
        <MinimalQuiz
          job={activeJob}
          onExit={exitQuiz}
        />
      );
    }

    if (tab === 'jobs') {
      return <JobsTab jobs={jobs} onStart={startQuizFromJob} onAddJob={addJob} />;
    }

    if (tab === 'profile') {
      return <ProfileTab stats={stats} />;
    }

    return <JobsTab jobs={jobs} onStart={startQuizFromJob} onAddJob={addJob} />;
  };

  return (
    <div className={`min-h-screen ${quizMode ? 'bg-tertiary-9' : 'bg-elandi-primary'} ${quizMode ? 'text-primary-cosmos' : 'text-primary-stellar'} font-geist-sans`}>
      <div className="container mx-auto max-w-6xl min-h-screen flex flex-col">
        {/* Header */}
        {!quizMode && (
          <header className="p-6 border-b border-primary-fornax-2/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-elandi-accent flex items-center justify-center">
                  <DraftingCompass size={20} className="text-primary-stellar" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-geist-sans">Elandi</h1>
                  <p className="text-tertiary-4 text-sm font-dm-mono uppercase">AI-Powered Learning Platform</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-tertiary-4 font-dm-mono uppercase">Jobs Saved</p>
                <p className="text-xl font-bold text-secondary-ethereal-2">{jobs.length}</p>
              </div>
            </div>
          </header>
        )}

        {/* Main content area */}
        <div className={`flex-1 ${quizMode ? 'p-0' : 'p-6'} transition-elandi`}>
          {renderContent()}
        </div>

        {/* Bottom navigation - only show when not in quiz mode */}
        {!quizMode && (
          <div className="border-t border-secondary-ethereal-2/20 bg-secondary-ethereal-2/10 backdrop-blur-sm">
            <BottomNav
              tab={tab}
              setTab={setTab}
            />
          </div>
        )}
      </div>
    </div>
  );
};
