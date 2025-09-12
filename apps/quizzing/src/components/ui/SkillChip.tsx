import React from 'react';

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
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono font-medium uppercase ${variantClasses[variant]}`}>
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-tertiary-4 hover:text-semantic-error-2 focus:outline-none transition-colors"
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
