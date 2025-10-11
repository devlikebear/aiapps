import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || 'select-' + Date.now();

    return (
      <div className={clsx('space-y-1', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-200"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={clsx(
              // Base styles
              'px-4 py-2 pr-10 rounded-lg appearance-none',
              'bg-gray-800 border',
              'text-white',
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
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-400">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
