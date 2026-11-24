import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';
import {
  Trees,
  ShieldCheck,
  Sprout,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  Activity
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
  timeframe: string;
  iconName: string;
  accent?: 'forest' | 'sage' | 'lime' | 'emerald';
  badgeText?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  timeframe,
  iconName,
  accent = 'forest',
  badgeText,
  onClick,
}) => {
  const getIcon = () => {
    switch (iconName) {
      case 'Trees':
        return <Trees className="w-5 h-5 text-forest-700" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-forest-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-lime-700" />;
      default:
        return <Activity className="w-5 h-5 text-forest-700" />;
    }
  };

  const accentBackgrounds = {
    forest: 'bg-forest-50 border-forest-100',
    sage: 'bg-sage-100 border-sage-200',
    lime: 'bg-lime-50 border-lime-200',
    emerald: 'bg-emerald-50 border-emerald-100',
  };

  return (
    <Card
      hoverEffect
      onClick={onClick}
      className={cn('cursor-pointer relative overflow-hidden group border-[#e2e8e0]')}
    >
      {/* Decorative top accent line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-all duration-300',
          accent === 'forest' && 'bg-forest-700 group-hover:h-1.5',
          accent === 'emerald' && 'bg-emerald-600 group-hover:h-1.5',
          accent === 'sage' && 'bg-sage-500 group-hover:h-1.5',
          accent === 'lime' && 'bg-lime-500 group-hover:h-1.5'
        )}
      />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105',
              accentBackgrounds[accent]
            )}
          >
            {getIcon()}
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </div>
          {badgeText && (
            <span className="text-[11px] font-medium bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full border border-forest-200">
              {badgeText}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center font-medium gap-0.5 px-1.5 py-0.5 rounded',
              isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {change}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 font-normal truncate">{timeframe}</span>
        </div>
      </div>
    </Card>
  );
};
