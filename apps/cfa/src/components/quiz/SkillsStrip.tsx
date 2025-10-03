import React, { useState } from 'react';
import { SkillChip } from '../ui/SkillChip';

interface SkillsStripProps {
  allSkills: string[];
  active?: string[];
}

export const SkillsStrip: React.FC<SkillsStripProps> = ({
  allSkills,
  active
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!allSkills || allSkills.length === 0) return null;

  const isActive = (skill: string) => active && active.includes(skill);

  return (
    <div className="border-t border-white/8 border-b border-white/8 bg-black/5 px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">Skills</span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs hover:bg-white/20 focus:outline-none"
          aria-label={collapsed ? "Expand skills" : "Collapse skills"}
        >
          {collapsed ? "▾" : "▴"}
        </button>
      </div>
      {!collapsed && (
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-1 scrollbar-hide">
          {allSkills.map((skill) => (
            <SkillChip
              key={skill}
              skill={skill}
              variant={isActive(skill) ? 'active' : 'muted'}
            />
          ))}
        </div>
      )}
    </div>
  );
};
