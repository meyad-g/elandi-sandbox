'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({ children, className = '', delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`bg-slate-900/90 border border-slate-700 rounded-lg ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
    >      
      {children}
    </motion.div>
  );
}
