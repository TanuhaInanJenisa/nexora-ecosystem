import { Search, Filter } from 'lucide-react';
import { cn } from './utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  className?: string;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = 'All Categories',
  className,
}: SearchFilterProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-center gap-3 w-full', className)}>
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {filterOptions && onFilterChange && (
        <div className="relative shrink-0 w-full sm:w-auto">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={filterValue || ''}
            onChange={(e) => onFilterChange(e.target.value)}
            className="h-10 pl-10 pr-8 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer w-full"
          >
            <option value="">{filterPlaceholder}</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
