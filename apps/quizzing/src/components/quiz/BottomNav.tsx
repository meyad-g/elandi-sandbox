import React from 'react';
import { motion } from 'framer-motion';
import { TabType } from '../../types/quiz';
import { Building2, User } from 'lucide-react';

interface BottomNavProps {
  tab: TabType;
  setTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ tab, setTab }) => {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        onClick={() => setTab('jobs')}
        className={`flex flex-col items-center gap-2 py-4 px-8 rounded-xl text-sm transition-elandi font-dm-mono uppercase ${
          tab === 'jobs'
            ? 'bg-secondary-ethereal-2 text-primary-stellar shadow-md'
            : 'bg-tertiary-8 text-tertiary-4 hover:text-primary-cosmos hover:bg-tertiary-7'
        }`}
        aria-label="Jobs"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <Building2 size={24} />
        <span className="font-medium">Jobs</span>
      </motion.button>

      <motion.button
        onClick={() => setTab('profile')}
        className={`flex flex-col items-center gap-2 py-4 px-8 rounded-xl text-sm transition-elandi font-dm-mono uppercase ${
          tab === 'profile'
            ? 'bg-secondary-ethereal-2 text-primary-stellar shadow-md'
            : 'bg-tertiary-8 text-tertiary-4 hover:text-primary-cosmos hover:bg-tertiary-7'
        }`}
        aria-label="Profile"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <User size={24} />
        <span className="font-medium">Profile</span>
      </motion.button>
    </motion.div>
  );
};
