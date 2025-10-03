import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {label && (
        <motion.label 
          className="block text-sm text-tertiary-4 mb-2 uppercase font-mono font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        >
          {label}
        </motion.label>
      )}
      <motion.input
        className={`w-full px-4 py-3 bg-tertiary-9 border border-tertiary-6 rounded-lg text-primary-cosmos placeholder-tertiary-4 focus:outline-none focus:ring-2 focus:ring-secondary-ethereal-2 focus:border-secondary-ethereal-2 transition-all duration-200 ${error ? 'border-semantic-error-2' : ''} font-mono ${className}`}
        whileFocus={{ 
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        {...props}
      />
      {error && (
        <motion.p 
          className="mt-2 text-sm text-semantic-error-2 uppercase font-mono"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};
