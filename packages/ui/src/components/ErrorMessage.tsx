import { ReactNode } from 'react';

export interface ErrorMessageProps {
  title?: string;
  message: string | ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
}

export const ErrorMessage = ({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Try Again',
  fullScreen = false,
}: ErrorMessageProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Error Icon */}
      <div className="mb-4 p-3 bg-red-100 rounded-full">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      {/* Message */}
      <div className="mb-4 text-sm text-gray-600 max-w-md">{message}</div>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
};
