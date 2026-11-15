'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={computedType}
            disabled={disabled}
            className={cn(
              'w-full h-11 px-3.5 rounded-xl text-sm transition-all duration-200 outline-none',
              'bg-white border border-slate-300 text-slate-950 font-medium placeholder:text-slate-400 focus:text-black focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20',
              leftIcon ? 'pl-10' : '',
              rightIcon || isPassword ? 'pr-10' : '',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20',
              disabled && 'opacity-60 cursor-not-allowed bg-slate-100 text-slate-400',
              className
            )}
            style={{ color: '#000000', backgroundColor: '#ffffff', ...props.style }}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-500 hover:text-slate-800 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

