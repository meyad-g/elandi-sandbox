import React, { useState } from 'react';
import { ExamObjective } from '@sandbox-apps/ai';
import { Target, Book, TrendingUp, CheckCircle, Clock, Brain, Star } from 'lucide-react';

// Enhanced objective type with progress tracking
export interface EnhancedObjective extends ExamObjective {
  progress?: {
    attempted: number;
    total: number;
    score: number;
    mastery: 'novice' | 'developing' | 'proficient' | 'mastery';
  };
}

interface ObjectivesStripProps {
  objectives: EnhancedObjective[];
  activeObjectiveId?: string;
  examName?: string;
  onObjectiveSelect?: (objectiveId: string) => void;
}

export const ObjectivesStrip: React.FC<ObjectivesStripProps> = ({
  objectives,
  activeObjectiveId,
  examName,
  onObjectiveSelect
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!objectives || objectives.length === 0) return null;

  const isActive = (objectiveId: string) => activeObjectiveId === objectiveId;

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'knowledge':
        return <Book className="w-3 h-3" />;
      case 'application':
        return <Target className="w-3 h-3" />;
      case 'synthesis':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Book className="w-3 h-3" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'knowledge':
        return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
      case 'application':
        return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'synthesis':
        return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getMasteryColor = (mastery: string) => {
    switch (mastery) {
      case 'mastery':
        return 'text-green-400 bg-green-500/20 border-green-400/50';
      case 'proficient':
        return 'text-blue-400 bg-blue-500/20 border-blue-400/50';
      case 'developing':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50';
      case 'novice':
        return 'text-red-400 bg-red-500/20 border-red-400/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
    }
  };

  const getMasteryIcon = (mastery: string) => {
    switch (mastery) {
      case 'mastery':
        return <Star className="w-3 h-3" />;
      case 'proficient':
        return <CheckCircle className="w-3 h-3" />;
      case 'developing':
        return <Clock className="w-3 h-3" />;
      case 'novice':
        return <Brain className="w-3 h-3" />;
      default:
        return <Brain className="w-3 h-3" />;
    }
  };

  return (
    <div className="border-t border-white/8 border-b border-white/8 bg-black/5 px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Learning Objectives</span>
          {examName && (
            <span className="text-xs text-gray-500 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              {examName}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs hover:bg-white/20 focus:outline-none"
          aria-label={collapsed ? "Expand objectives" : "Collapse objectives"}
        >
          {collapsed ? "▾" : "▴"}
        </button>
      </div>
      
      {!collapsed && (
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-1 scrollbar-hide">
          {objectives.map((objective) => {
            const active = isActive(objective.id);
            const hasProgress = objective.progress && objective.progress.attempted > 0;
            const progressPercent = hasProgress ? (objective.progress.attempted / objective.progress.total) * 100 : 0;
            
            return (
              <div
                key={objective.id}
                className={`group relative inline-flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer min-w-max ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                }`}
                onClick={() => onObjectiveSelect?.(objective.id)}
              >
                {/* Difficulty indicator */}
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${getDifficultyColor(objective.level)}`}>
                  {getDifficultyIcon(objective.level)}
                </div>
                
                {/* Progress ring (if has progress) */}
                {hasProgress && (
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-white/20"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${progressPercent * 0.628} ${100 * 0.628}`}
                        className="text-cyan-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {objective.progress?.attempted}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Objective info */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium leading-tight">
                    {objective.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/60">
                      {objective.weight}% weight
                    </span>
                    {hasProgress ? (
                      <>
                        <span className="text-xs text-white/60">•</span>
                        <span className="text-xs text-cyan-400 font-medium">
                          {Math.round(objective.progress?.score || 0)}%
                        </span>
                      </>
                    ) : (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getDifficultyColor(objective.level)}`}>
                        {objective.level}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mastery indicator */}
                {hasProgress && objective.progress.mastery && (
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${getMasteryColor(objective.progress.mastery)}`}>
                    {getMasteryIcon(objective.progress.mastery)}
                  </div>
                )}

                {/* Enhanced hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/20 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                  <div className="font-medium mb-1">{objective.title}</div>
                  <div className="text-white/70 text-xs leading-relaxed mb-2">
                    {objective.description}
                  </div>
                  {hasProgress && (
                    <div className="border-t border-white/20 pt-2 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60">Progress:</span>
                        <span className="text-cyan-400 font-medium">
                          {objective.progress?.attempted}/{objective.progress?.total} questions
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60">Score:</span>
                        <span className={`font-medium ${
                          (objective.progress?.score || 0) >= 80 ? 'text-green-400' :
                          (objective.progress?.score || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {Math.round(objective.progress?.score || 0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Mastery:</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${getMasteryColor(objective.progress?.mastery || 'novice')}`}>
                          {objective.progress?.mastery}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
