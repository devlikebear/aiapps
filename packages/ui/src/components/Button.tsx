import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded-lg',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Variant styles
          {
            // Primary
            'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500':
              variant === 'primary' && !disabled,

            // Secondary
            'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500':
              variant === 'secondary' && !disabled,

            // Danger
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
              variant === 'danger' && !disabled,

            // Ghost
            'bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-500':
              variant === 'ghost' && !disabled,
          },

          // Size styles
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },

          // Full width
          {
            'w-full': fullWidth,
          },

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
