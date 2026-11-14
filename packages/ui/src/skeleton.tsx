import React from 'react';
import { cn } from './utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'rectangular', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800/80',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded-md',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] space-y-4">
      <Skeleton className="w-1/3 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-4/5 h-4" />
      <div className="pt-4 flex items-center justify-between">
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  );
}
