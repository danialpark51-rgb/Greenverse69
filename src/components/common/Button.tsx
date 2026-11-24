import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'lime' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-forest-rich text-white hover:bg-forest-deep focus:ring-forest-600 shadow-sm border border-forest-moss',
    secondary:
      'bg-sage-100 text-forest-deep hover:bg-sage-200 focus:ring-sage-400 border border-sage-200',
    outline:
      'bg-white text-forest-rich border border-sage-300 hover:bg-sage-50 focus:ring-forest-500 shadow-sm',
    ghost:
      'text-forest-rich hover:bg-sage-100 focus:ring-forest-400',
    lime:
      'bg-lime-accent text-forest-deep font-semibold hover:bg-lime-glow focus:ring-lime-500 shadow-glow-lime border border-lime-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="inline-flex shrink-0">{icon}</span>
      )}
    </button>
  );
};
