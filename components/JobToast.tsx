'use client';

import { useEffect, useState } from 'react';
import { XCircle, Music, ImageIcon } from 'lucide-react';
import { jobQueue } from '@/lib/queue/job-queue';
import type { JobEvent, AudioJob, ImageJob } from '@/lib/queue/types';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  icon: React.ReactElement;
  title: string;
  message: string;
  timestamp: number;
}

export default function JobToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // 작업 완료 이벤트 리스너
    const handleJobCompleted = (event: JobEvent) => {
      const job = event.job;
      const isAudio = job.type === 'audio';

      setToasts((prev) => [
        ...prev,
        {
          id: event.jobId,
          type: 'success',
          icon: isAudio ? (
            <Music className="w-5 h-5" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          ),
          title: `${isAudio ? '오디오' : '이미지'} 생성 완료`,
          message: `"${
            (job as AudioJob | ImageJob).params.prompt.slice(0, 30) + '...'
          }" 생성이 완료되었습니다.`,
          timestamp: Date.now(),
        },
      ]);
    };

    // 작업 실패 이벤트 리스너
    const handleJobFailed = (event: JobEvent) => {
      const job = event.job;
      const isAudio = job.type === 'audio';

      setToasts((prev) => [
        ...prev,
        {
          id: event.jobId,
          type: 'error',
          icon: isAudio ? (
            <Music className="w-5 h-5" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          ),
          title: `${isAudio ? '오디오' : '이미지'} 생성 실패`,
          message: job.error || '알 수 없는 오류가 발생했습니다.',
          timestamp: Date.now(),
        },
      ]);
    };

    // 작업 시작 이벤트 리스너
    const handleJobStarted = (event: JobEvent) => {
      const job = event.job;
      const isAudio = job.type === 'audio';

      setToasts((prev) => [
        ...prev,
        {
          id: event.jobId,
          type: 'info',
          icon: isAudio ? (
            <Music className="w-5 h-5" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          ),
          title: `${isAudio ? '오디오' : '이미지'} 생성 시작`,
          message: `백그라운드에서 생성 중입니다...`,
          timestamp: Date.now(),
        },
      ]);
    };

    // 이벤트 리스너 등록
    jobQueue.on('job:completed', handleJobCompleted);
    jobQueue.on('job:failed', handleJobFailed);
    jobQueue.on('job:started', handleJobStarted);

    // 클린업
    return () => {
      jobQueue.off('job:completed', handleJobCompleted);
      jobQueue.off('job:failed', handleJobFailed);
      jobQueue.off('job:started', handleJobStarted);
    };
  }, []);

  // 자동 제거 (5초 후)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((toast) => now - toast.timestamp < 5000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border animate-slide-up ${
            toast.type === 'success'
              ? 'bg-green-900/90 border-green-600'
              : toast.type === 'error'
                ? 'bg-red-900/90 border-red-600'
                : 'bg-blue-900/90 border-blue-600'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          <div
            className={`flex-shrink-0 ${
              toast.type === 'success'
                ? 'text-green-400'
                : toast.type === 'error'
                  ? 'text-red-400'
                  : 'text-blue-400'
            }`}
          >
            {toast.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {toast.title}
            </h4>
            <p className="text-xs text-gray-300">{toast.message}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
