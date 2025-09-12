import React from 'react';
import { TabType } from '../../types/quiz';
import { Building2, User } from 'lucide-react';

interface BottomNavProps {
  tab: TabType;
  setTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ tab, setTab }) => {
  return (
    <div className="flex items-center justify-center gap-4 p-6">
      <button
        onClick={() => setTab('jobs')}
        className={`flex flex-col items-center gap-2 py-4 px-8 rounded-xl text-sm transition-elandi font-dm-mono uppercase ${
          tab === 'jobs'
            ? 'bg-secondary-ethereal-2 text-primary-stellar shadow-lg scale-105'
            : 'bg-tertiary-8 text-tertiary-4 hover:text-primary-cosmos hover:bg-tertiary-7'
        }`}
        aria-label="Jobs"
      >
        <Building2 size={24} />
        <span className="font-medium">Jobs</span>
      </button>

      <button
        onClick={() => setTab('profile')}
        className={`flex flex-col items-center gap-2 py-4 px-8 rounded-xl text-sm transition-elandi font-dm-mono uppercase ${
          tab === 'profile'
            ? 'bg-secondary-ethereal-2 text-primary-stellar shadow-lg scale-105'
            : 'bg-tertiary-8 text-tertiary-4 hover:text-primary-cosmos hover:bg-tertiary-7'
        }`}
        aria-label="Profile"
      >
        <User size={24} />
        <span className="font-medium">Profile</span>
      </button>
    </div>
  );
};
