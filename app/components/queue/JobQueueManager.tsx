'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useJobQueueStore } from '@/stores/job-queue-store';
import type { Job, JobStatus } from '@/lib/types/queue';

interface JobQueueManagerProps {
  onClose: () => void;
}

export default function JobQueueManager({ onClose }: JobQueueManagerProps) {
  const {
    jobs,
    activeJobId,
    retryJob,
    cancelJob,
    removeJob,
    clearCompleted,
    clearFailed,
    getStats,
  } = useJobQueueStore();

  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const stats = getStats();

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const getStatusIcon = (status: JobStatus, isActive: boolean) => {
    if (isActive && status === 'processing') {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }

    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '처리 중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
    }
  };

  const getJobTypeText = (type: Job['type']) => {
    switch (type) {
      case 'image-generation':
        return '이미지 생성';
      case 'image-edit':
        return '이미지 편집';
      case 'image-compose':
        return '이미지 합성';
      case 'style-transfer':
        return '스타일 전이';
    }
  };

  const getJobDescription = (job: Job) => {
    switch (job.type) {
      case 'image-generation':
        return job.params.prompt.slice(0, 50) + '...';
      case 'image-edit':
        return job.params.prompt.slice(0, 50) + '...';
      case 'image-compose':
        return `${job.params.images.length}개 이미지 합성`;
      case 'style-transfer':
        return '스타일 전이 작업';
    }
  };

  const formatDuration = (job: Job) => {
    if (!job.startedAt) return '-';
    const end = job.completedAt || new Date();
    const duration = end.getTime() - job.startedAt.getTime();
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분 ${seconds % 60}초`;
  };

  const handleRetry = (jobId: string) => {
    retryJob(jobId);
  };

  const handleCancel = (jobId: string) => {
    if (confirm('이 작업을 취소하시겠습니까?')) {
      cancelJob(jobId);
    }
  };

  const handleRemove = (jobId: string) => {
    if (confirm('이 작업을 삭제하시겠습니까?')) {
      removeJob(jobId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold">작업 큐</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.total}개 작업 ({stats.pending}개 대기, {stats.processing}개
              진행, {stats.completed}개 완료, {stats.failed}개 실패)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            전체 ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            대기 중 ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'processing'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            처리 중 ({stats.processing})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            완료 ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'failed'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            실패 ({stats.failed})
          </button>
        </div>

        {/* Actions */}
        {(stats.completed > 0 || stats.failed > 0) && (
          <div className="flex gap-2 p-4 border-b dark:border-gray-700">
            {stats.completed > 0 && (
              <button
                onClick={clearCompleted}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                완료된 작업 정리
              </button>
            )}
            {stats.failed > 0 && (
              <button
                onClick={clearFailed}
                className="px-4 py-2 text-sm rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                실패한 작업 정리
              </button>
            )}
          </div>
        )}

        {/* Job List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all'
                  ? '작업이 없습니다'
                  : `${getStatusText(filter as JobStatus)} 작업이 없습니다`}
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              const isActive = activeJobId === job.id;

              return (
                <div
                  key={job.id}
                  className={`app-card p-4 ${
                    isActive ? 'ring-2 ring-indigo-600' : ''
                  }`}
                >
                  {/* Job Header */}
                  <div className="flex items-start gap-3">
                    {getStatusIcon(job.status, isActive)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {getJobTypeText(job.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getStatusText(job.status)}
                        </span>
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            진행 중
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getJobDescription(job)}
                      </p>

                      {/* Progress Bar */}
                      {job.status === 'processing' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>진행률</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {job.status === 'failed' && job.error && (
                        <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                          {job.error.message}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {job.status === 'failed' &&
                        job.retryCount < job.maxRetries && (
                          <button
                            onClick={() => handleRetry(job.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="재시도"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      {job.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(job.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          title="취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {(job.status === 'completed' ||
                        job.status === 'failed') && (
                        <button
                          onClick={() => handleRemove(job.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setExpandedJobId(isExpanded ? null : job.id)
                        }
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="상세 정보"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          작업 ID
                        </span>
                        <span className="font-mono text-xs">{job.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          우선순위
                        </span>
                        <span>{job.priority}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          재시도 횟수
                        </span>
                        <span>
                          {job.retryCount}/{job.maxRetries}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          소요 시간
                        </span>
                        <span>{formatDuration(job)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          생성 시간
                        </span>
                        <span>
                          {new Date(job.createdAt).toLocaleTimeString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
