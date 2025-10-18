'use client';

import { Lock, AlertCircle } from 'lucide-react';

interface SecurityBadgeProps {
  variant?: 'secure' | 'warning';
  message: string;
}

export default function SecurityBadge({
  variant = 'secure',
  message,
}: SecurityBadgeProps) {
  const isSecure = variant === 'secure';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg ${
        isSecure
          ? 'bg-green-500/10 border border-green-500/20'
          : 'bg-amber-500/10 border border-amber-500/20'
      }`}
    >
      {isSecure ? (
        <Lock
          className={`w-5 h-5 flex-shrink-0 ${isSecure ? 'text-green-400' : 'text-amber-400'} mt-0.5`}
        />
      ) : (
        <AlertCircle
          className={`w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5`}
        />
      )}

      <p
        className={`text-sm ${isSecure ? 'text-green-300' : 'text-amber-300'}`}
      >
        {message}
      </p>
    </div>
  );
}
