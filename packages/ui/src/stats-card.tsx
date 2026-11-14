import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from './utils';

export interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  change,
  isPositive = true,
  icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-sm transition-all duration-200 hover:border-indigo-500/30',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold">
            {isPositive ? (
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {change}
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            {description && (
              <span className="text-slate-400 font-normal ml-1">vs last period</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

