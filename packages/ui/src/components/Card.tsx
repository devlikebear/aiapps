import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-gray-900 border border-gray-800 rounded-lg',
          {
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
