import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', text, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex flex-col items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        <Loader2
          className={clsx('animate-spin text-purple-500', {
            'w-4 h-4': size === 'sm',
            'w-8 h-8': size === 'md',
            'w-12 h-12': size === 'lg',
          })}
        />
        {text && <p className="text-sm text-gray-400">{text}</p>}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';
