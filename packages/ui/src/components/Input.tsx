import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('space-y-1', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-200"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={clsx(
            // Base styles
            'px-4 py-2 rounded-lg',
            'bg-gray-800 border',
            'text-white placeholder-gray-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',

            // State styles
            {
              'border-gray-700 focus:border-purple-500 focus:ring-purple-500':
                !error && !disabled,
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
              'opacity-50 cursor-not-allowed bg-gray-900': disabled,
            },

            // Full width
            { 'w-full': fullWidth },

            className
          )}
          {...props}
        />

        {helperText && !error && (
          <p className="text-xs text-gray-400">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
