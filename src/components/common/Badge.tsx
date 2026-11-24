import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'forest' | 'sage' | 'lime' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  dot = false,
  size = 'md',
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    forest: {
      bg: 'bg-forest-100',
      text: 'text-forest-900',
      dotColor: 'bg-forest-700',
      border: 'border-forest-200'
    },
    sage: {
      bg: 'bg-sage-100',
      text: 'text-sage-800',
      dotColor: 'bg-sage-600',
      border: 'border-sage-200'
    },
    lime: {
      bg: 'bg-lime-100',
      text: 'text-lime-900',
      dotColor: 'bg-lime-600',
      border: 'border-lime-200'
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      dotColor: 'bg-emerald-600',
      border: 'border-emerald-200'
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      dotColor: 'bg-amber-500',
      border: 'border-amber-200'
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      dotColor: 'bg-rose-600',
      border: 'border-rose-200'
    },
    sky: {
      bg: 'bg-sky-100',
      text: 'text-sky-900',
      dotColor: 'bg-sky-500',
      border: 'border-sky-200'
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      dotColor: 'bg-slate-500',
      border: 'border-slate-200'
    }
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5',
        current.bg,
        current.text,
        current.border,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full animate-pulse',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            current.dotColor
          )}
        />
      )}
      {children}
    </span>
  );
};
