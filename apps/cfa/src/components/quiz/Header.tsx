import React from 'react';
import { Button } from '../ui/Button';

interface HeaderProps {
  index: number;
  total: number;
  onShuffle: () => void;
  score: number;
  answered: number;
}

export const Header: React.FC<HeaderProps> = ({
  index,
  total,
  onShuffle,
  score,
  answered
}) => {
  const pct = total ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 px-4 py-3 border-b border-white/10 backdrop-blur-md bg-black/60">
      <div className="flex items-center gap-3 w-full">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500" />
        <div className="font-bold text-lg">DS Quiz</div>
        <div className="ml-auto flex gap-3 items-center text-sm text-gray-300">
          <div>
            Q <strong className="text-white">{index + 1}</strong>/{total}
          </div>
          <div>
            Score <strong className="text-white">{score}</strong>/{answered}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={onShuffle}
            className="text-xs"
          >
            Shuffle
          </Button>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/10 border border-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
