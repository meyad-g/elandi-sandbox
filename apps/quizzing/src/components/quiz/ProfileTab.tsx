import React from 'react';
import { Stats } from '../../types/quiz';
import { BookOpen, Target, TrendingUp, Trophy, Zap, BarChart3 } from 'lucide-react';

interface ProfileTabProps {
  stats: Stats;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ stats }) => {
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-elandi-accent mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl">👤</span>
        </div>
        <h3 className="text-2xl font-bold font-geist-sans text-primary-cosmos mb-2">
          Your Profile
        </h3>
        <p className="text-tertiary-4 text-sm font-dm-mono uppercase">
          Learning Analytics & Progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner text-center">
          <div className="flex justify-center mb-3">
            <BookOpen size={36} className="text-secondary-ethereal-2" />
          </div>
          <div className="text-2xl font-bold text-secondary-ethereal-2 mb-1">
            {stats.sessions}
          </div>
          <div className="text-tertiary-4 text-sm font-dm-mono uppercase">
            Total Sessions
          </div>
        </div>

        <div className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner text-center">
          <div className="flex justify-center mb-3">
            <Target size={36} className="text-secondary-ethereal-2" />
          </div>
          <div className="text-2xl font-bold text-secondary-ethereal-2 mb-1">
            {stats.answered}
          </div>
          <div className="text-tertiary-4 text-sm font-dm-mono uppercase">
            Questions Answered
          </div>
        </div>

        <div className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner text-center md:col-span-2 lg:col-span-1">
          <div className="flex justify-center mb-3">
            <BarChart3 size={36} className="text-secondary-ethereal-2" />
          </div>
          <div className="text-2xl font-bold text-secondary-ethereal-2 mb-1">
            {stats.accuracy}%
          </div>
          <div className="text-tertiary-4 text-sm font-dm-mono uppercase">
            Average Accuracy
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner">
        <h4 className="text-lg font-bold font-geist-sans text-primary-cosmos mb-4">Recent Achievements</h4>

        <div className="grid gap-3 md:grid-cols-2">
          {stats.sessions > 0 && (
            <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
              <div className="flex items-center justify-center">
                <BookOpen size={20} className="text-secondary-ethereal-2" />
              </div>
              <div>
                <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">First Steps</div>
                <div className="text-tertiary-4 text-xs">Completed your first quiz session</div>
              </div>
            </div>
          )}

          {stats.accuracy >= 70 && (
            <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
              <div className="flex items-center justify-center">
                <Trophy size={20} className="text-secondary-ethereal-2" />
              </div>
              <div>
                <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">Knowledge Master</div>
                <div className="text-tertiary-4 text-xs">Achieved 70%+ accuracy</div>
              </div>
            </div>
          )}

          {stats.answered >= 50 && (
            <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
              <div className="flex items-center justify-center">
                <Zap size={20} className="text-secondary-ethereal-2" />
              </div>
              <div>
                <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">Dedicated Learner</div>
                <div className="text-tertiary-4 text-xs">Answered 50+ questions</div>
              </div>
            </div>
          )}
        </div>

        {stats.sessions === 0 && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <TrendingUp size={48} className="text-secondary-ethereal-2" />
            </div>
            <p className="text-tertiary-4 text-sm font-dm-mono uppercase">
              Complete your first quiz to unlock achievements!
            </p>
          </div>
        )}
      </div>

      {/* Coming Soon */}
      <div className="bg-elandi-secondary p-6 rounded-xl border border-primary-fornax-2/10 card-corner">
        <h4 className="text-lg font-bold font-geist-sans text-primary-cosmos mb-4">Coming Soon</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
            <div className="flex items-center justify-center">
              <TrendingUp size={20} className="text-secondary-ethereal-2" />
            </div>
            <div>
              <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">Skill Progress</div>
              <div className="text-tertiary-4 text-xs">Track improvement by skill area</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
            <div className="flex items-center justify-center">
              <Zap size={20} className="text-secondary-ethereal-2" />
            </div>
            <div>
              <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">Study Streaks</div>
              <div className="text-tertiary-4 text-xs">Daily learning consistency rewards</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
            <div className="flex items-center justify-center">
              <Target size={20} className="text-secondary-ethereal-2" />
            </div>
            <div>
              <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">Personalized Paths</div>
              <div className="text-tertiary-4 text-xs">Custom learning recommendations</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-tertiary-8 rounded-lg border border-tertiary-6">
            <div className="flex items-center justify-center">
              <BarChart3 size={20} className="text-secondary-ethereal-2" />
            </div>
            <div>
              <div className="font-bold text-primary-cosmos font-dm-mono uppercase text-sm">Detailed Analytics</div>
              <div className="text-tertiary-4 text-xs">In-depth performance insights</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
