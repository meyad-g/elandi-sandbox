'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, X } from 'lucide-react';

interface AIThinkingBoxProps {
  thinking: string;
  isVisible: boolean;
  onClose?: () => void;
}

export const AIThinkingBox: React.FC<AIThinkingBoxProps> = ({
  thinking,
  isVisible,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || !thinking) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 max-w-sm"
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">AI Thinking</div>
              <div className="text-white/60 text-xs">Analyzing question...</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-white/70" />
            </motion.div>
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="text-white/80 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                  {thinking}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed preview */}
        {!isExpanded && thinking && (
          <div className="p-3 border-t border-white/10">
            <div className="text-white/70 text-xs font-mono line-clamp-2">
              {thinking.substring(0, 80)}...
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
