import React from 'react';
import { motion } from 'framer-motion';

interface SkillChipProps {
  skill: string;
  onRemove?: () => void;
  variant?: 'default' | 'active' | 'muted';
}

export const SkillChip: React.FC<SkillChipProps> = ({
  skill,
  onRemove,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-tertiary-8 border-tertiary-6 text-primary-cosmos',
    active: 'bg-gradient-to-r from-secondary-ethereal-1 to-primary-fornax-2 border-primary-fornax-2 text-primary-stellar',
    muted: 'bg-tertiary-7 border-tertiary-5 text-tertiary-3'
  };

  return (
    <motion.span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono font-medium uppercase ${variantClasses[variant]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{
        backgroundColor: variant === 'active' ? '#5a4fcf' : undefined,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
        delay: Math.random() * 0.05
      }}
      layout
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {skill}
      </motion.span>
      {onRemove && (
        <motion.button
          onClick={onRemove}
          className="ml-1 text-tertiary-4 hover:text-semantic-error-2 focus:outline-none transition-colors"
          aria-label={`Remove ${skill}`}
          whileHover={{
            scale: 1.1,
            transition: { duration: 0.15 }
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          ×
        </motion.button>
      )}
    </motion.span>
  );
};
