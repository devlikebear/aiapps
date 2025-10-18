'use client';

import { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  children?: ReactNode;
  completed?: boolean;
}

export default function StepCard({
  step,
  title,
  description,
  children,
  completed = false,
}: StepCardProps) {
  return (
    <div className="app-card relative overflow-hidden transition-all hover:shadow-lg">
      {/* 배경 그라데이션 */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-full -mr-10 -mt-10" />

      <div className="relative z-10">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* 스텝 번호 */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${
                completed
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gradient-to-r from-sky-500 to-purple-600 text-white'
              }`}
            >
              {completed ? <CheckCircle2 className="w-6 h-6" /> : step}
            </div>

            {/* 제목 */}
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400 max-w-md">{description}</p>
            </div>
          </div>

          {/* 완료 상태 배지 */}
          {completed && (
            <div className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
              완료
            </div>
          )}
        </div>

        {/* 자식 컨텐츠 */}
        {children && (
          <div className="mt-4 pt-4 border-t border-gray-700">{children}</div>
        )}
      </div>
    </div>
  );
}
