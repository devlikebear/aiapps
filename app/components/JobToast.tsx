'use client';

import { useEffect, useState } from 'react';
import { XCircle, Music, ImageIcon, Layers } from 'lucide-react';
import { jobQueue } from '@/lib/queue/job-queue';
import type { JobEvent, Job } from '@/lib/queue/types';

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

  const getJobCategory = (job: Job) => {
    switch (job.type) {
      case 'audio-generate':
        return { label: '오디오', icon: <Music className="w-5 h-5" /> };
      case 'image-generate':
      case 'image-edit':
      case 'image-style-transfer':
        return { label: '이미지', icon: <ImageIcon className="w-5 h-5" /> };
      case 'image-compose':
        return { label: '합성', icon: <Layers className="w-5 h-5" /> };
      default:
        return { label: '작업', icon: <ImageIcon className="w-5 h-5" /> };
    }
  };

  const getJobMessageSnippet = (job: Job) => {
    switch (job.type) {
      case 'audio-generate':
      case 'image-generate':
      case 'image-edit':
        return job.params.prompt.slice(0, 30);
      case 'image-style-transfer':
        return job.params.stylePrompt.slice(0, 30);
      case 'image-compose':
        return `${job.params.images.length}개 이미지 합성`;
      default:
        return '';
    }
  };

  useEffect(() => {
    // 작업 완료 이벤트 리스너
    const handleJobCompleted = (event: JobEvent) => {
      const job = event.job;
      const { label, icon } = getJobCategory(job);
      const snippet = getJobMessageSnippet(job);

      setToasts((prev) => [
        ...prev,
        {
          id: `${event.jobId}-completed-${Date.now()}`,
          type: 'success',
          icon,
          title: `${label} 작업 완료`,
          message:
            snippet.length > 0
              ? `"${snippet}..." 작업이 완료되었습니다.`
              : '작업이 완료되었습니다.',
          timestamp: Date.now(),
        },
      ]);
    };

    // 작업 실패 이벤트 리스너
    const handleJobFailed = (event: JobEvent) => {
      const job = event.job;
      const { label, icon } = getJobCategory(job);

      setToasts((prev) => [
        ...prev,
        {
          id: `${event.jobId}-failed-${Date.now()}`,
          type: 'error',
          icon,
          title: `${label} 작업 실패`,
          message: job.error || '알 수 없는 오류가 발생했습니다.',
          timestamp: Date.now(),
        },
      ]);
    };

    // 작업 시작 이벤트 리스너
    const handleJobStarted = (event: JobEvent) => {
      const job = event.job;
      const { label, icon } = getJobCategory(job);

      setToasts((prev) => [
        ...prev,
        {
          id: `${event.jobId}-started-${Date.now()}`,
          type: 'info',
          icon,
          title: `${label} 작업 시작`,
          message: `백그라운드에서 작업을 처리 중입니다...`,
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
