import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
  size?: 'small' | 'medium' | 'large' | 'extra-small';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium uppercase font-mono rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-secondary-ethereal-2 to-secondary-ethereal-3 text-primary-stellar hover:brightness-125 focus:ring-secondary-ethereal-2 shadow-md',
    secondary: 'bg-primary-stellar text-primary-cosmos border border-secondary-ethereal-2 hover:bg-secondary-ethereal-2 hover:text-primary-stellar focus:ring-secondary-ethereal-2',
    tertiary: 'bg-transparent text-primary-cosmos hover:text-primary-scarlet-1 focus:ring-primary-scarlet-1',
    outline: 'border border-secondary-ethereal-2 text-secondary-ethereal-2 hover:bg-secondary-ethereal-2 hover:text-primary-stellar focus:ring-secondary-ethereal-2'
  };

  const sizeClasses = {
    'extra-small': 'px-2 py-1 text-xs',
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
