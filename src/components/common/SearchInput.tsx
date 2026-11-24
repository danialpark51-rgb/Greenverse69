import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcut?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  shortcut = '/',
  placeholder = 'Search trees, sites, species, squads...',
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-12 py-2 text-sm bg-white border border-sage-200 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-soft-sm transition-all"
        {...props}
      />
      <div className="absolute right-3 flex items-center gap-1.5">
        {value ? (
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          shortcut && (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
              {shortcut}
            </kbd>
          )
        )}
      </div>
    </div>
  );
};
