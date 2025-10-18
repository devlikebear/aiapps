'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  highlight?: boolean;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
  highlight = false,
}: FeatureCardProps) {
  return (
    <div
      className={`app-card transition-all hover:shadow-lg ${
        highlight ? 'ring-2 ring-gradient-to-r ring-sky-500' : ''
      }`}
    >
      {/* 아이콘 배경 */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
            highlight
              ? 'bg-gradient-to-r from-sky-500 to-purple-600 text-white'
              : 'bg-gray-800 text-sky-400'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      {/* 자식 컨텐츠 */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}
