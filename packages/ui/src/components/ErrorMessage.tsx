import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ title = 'Error', message, onRetry, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex flex-col items-center justify-center gap-4',
          'p-6 rounded-lg',
          'bg-red-900/20 border border-red-800',
          className
        )}
        {...props}
      >
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-red-400">{title}</h3>
          <p className="text-sm text-gray-300">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';
