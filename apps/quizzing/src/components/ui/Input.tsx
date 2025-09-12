import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
    <div className="w-full">
      {label && (
        <label className="block text-sm text-tertiary-4 mb-2 uppercase font-mono font-medium">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-tertiary-9 border border-tertiary-6 rounded-lg text-primary-cosmos placeholder-tertiary-4 focus:outline-none focus:ring-2 focus:ring-secondary-ethereal-2 focus:border-secondary-ethereal-2 transition-all duration-200 ${error ? 'border-semantic-error-2' : ''} font-mono ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-semantic-error-2 uppercase font-mono">{error}</p>
      )}
    </div>
  );
};
