import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface RangeSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  valueDisplay?: boolean;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      valueDisplay = true,
      className,
      disabled,
      id,
      value = 0,
      min = 0,
      max = 100,
      ...props
    },
    ref
  ) => {
    const sliderId =
      id || `range-slider-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('space-y-2', { 'w-full': fullWidth })}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={sliderId}
              className="block text-sm font-medium text-gray-200"
            >
              {label}
            </label>
          )}
          {valueDisplay && (
            <span className="text-sm font-semibold text-purple-400">
              {value}
            </span>
          )}
        </div>

        <input
          ref={ref}
          type="range"
          id={sliderId}
          disabled={disabled}
          value={value}
          min={min}
          max={max}
          className={clsx(
            // Base styles
            'w-full h-2 rounded-lg',
            'bg-gray-700 appearance-none cursor-pointer',
            'transition-colors duration-200',

            // Thumb and track styling with webkit
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-6',
            '[&::-webkit-slider-thumb]:w-6',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-purple-500',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-all',
            '[&::-webkit-slider-thumb]:duration-200',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:hover:bg-purple-600',
            '[&::-webkit-slider-thumb]:hover:shadow-lg',

            // Firefox thumb styling
            '[&::-moz-range-thumb]:h-6',
            '[&::-moz-range-thumb]:w-6',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-purple-500',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:transition-all',
            '[&::-moz-range-thumb]:duration-200',
            '[&::-moz-range-thumb]:shadow-md',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:hover:bg-purple-600',
            '[&::-moz-range-thumb]:hover:shadow-lg',

            // Firefox track styling
            '[&::-moz-range-track]:bg-transparent',
            '[&::-moz-range-track]:border-0',

            // State styles
            {
              'opacity-50 cursor-not-allowed': disabled,
              'hover:bg-gray-600': !disabled && !error,
              'bg-red-900': error,
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

RangeSlider.displayName = 'RangeSlider';
