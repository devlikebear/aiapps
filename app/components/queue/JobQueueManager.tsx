'use client';

import { useMemo, useState } from 'react';
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
import type { Job, JobStatus } from '@/lib/queue';

const JOB_STATUS_ORDER: Array<JobStatus | 'all'> = [
  'all',
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
];

const STATUS_LABEL: Record<JobStatus | 'all', string> = {
  all: '전체',
  pending: '대기 중',
  processing: '처리 중',
  completed: '완료',
  failed: '실패',
  cancelled: '취소됨',
};

const STATUS_ICON: Record<JobStatus, JSX.Element> = {
  pending: <Clock className="w-5 h-5 text-gray-400" />,
  processing: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
  completed: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  failed: <XCircle className="w-5 h-5 text-red-600" />,
  cancelled: <XCircle className="w-5 h-5 text-gray-400" />,
};

const JOB_TYPE_LABEL: Record<Job['type'], string> = {
  'audio-generate': '오디오 생성',
  'image-generate': '이미지 생성',
  'image-edit': '이미지 편집',
  'image-compose': '이미지 합성',
  'image-style-transfer': '스타일 전이',
};

type JobStatsMap = Record<JobStatus | 'total', number>;

const calculateStats = (jobs: Job[]): JobStatsMap => {
  const stats: JobStatsMap = {
    total: jobs.length,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  jobs.forEach((job) => {
    stats[job.status] += 1;
  });

  return stats;
};

const formatDuration = (job: Job): string => {
  if (!job.startedAt) return '-';

  const end = job.completedAt ?? Date.now();
  const duration = end - job.startedAt;
  const seconds = Math.floor(duration / 1000);
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}분 ${seconds % 60}초`;
};

const getJobDescription = (job: Job): string => {
  switch (job.type) {
    case 'audio-generate':
      return `${job.params.prompt.slice(0, 50)}...`;
    case 'image-generate':
    case 'image-edit':
      return `${job.params.prompt.slice(0, 50)}...`;
    case 'image-compose':
      return `${job.params.images.length}개 이미지 합성`;
    case 'image-style-transfer':
      return `${job.params.stylePrompt.slice(0, 50)}...`;
    default:
      return '';
  }
};

export default function JobQueueManager() {
  const jobs = useJobQueueStore((state) => state.jobs);
  const activeJobId = useJobQueueStore((state) => state.activeJobId);
  const retryJob = useJobQueueStore((state) => state.retryJob);
  const cancelJob = useJobQueueStore((state) => state.cancelJob);
  const removeJob = useJobQueueStore((state) => state.removeJob);
  const clearCompleted = useJobQueueStore((state) => state.clearCompleted);
  const clearFailed = useJobQueueStore((state) => state.clearFailed);
  const closeManager = useJobQueueStore((state) => state.closeManager);

  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const stats = useMemo(() => calculateStats(jobs), [jobs]);

  const filteredJobs = useMemo(() => {
    if (filter === 'all') {
      return jobs;
    }
    return jobs.filter((job) => job.status === filter);
  }, [filter, jobs]);

  const handleClearCompleted = () => {
    if (confirm('완료된 작업을 모두 정리하시겠습니까?')) {
      clearCompleted();
    }
  };

  const handleClearFailed = () => {
    if (confirm('실패/취소된 작업을 모두 정리하시겠습니까?')) {
      clearFailed();
    }
  };

  const renderStatusIcon = (job: Job) => {
    if (job.status === 'processing' && job.id === activeJobId) {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    return STATUS_ICON[job.status];
  };

  return (
    <div
      className="fixed inset-x-0 top-16 bottom-0 bg-black/50 z-50 flex items-start justify-center p-4 sm:p-6"
      onClick={closeManager}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full sm:max-w-2xl shadow-2xl max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold">작업 큐</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.total}개 작업 ({stats.pending}개 대기, {stats.processing}개
              진행, {stats.completed}개 완료, {stats.failed}개 실패,{' '}
              {stats.cancelled}개 취소)
            </p>
          </div>
          <button
            onClick={closeManager}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b dark:border-gray-700 overflow-x-auto">
          {JOB_STATUS_ORDER.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {STATUS_LABEL[status]} (
              {status === 'all' ? stats.total : stats[status]})
            </button>
          ))}
        </div>

        {/* Actions */}
        {(stats.completed > 0 || stats.failed + stats.cancelled > 0) && (
          <div className="flex gap-2 p-4 border-b dark:border-gray-700">
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                완료된 작업 정리
              </button>
            )}
            {stats.failed + stats.cancelled > 0 && (
              <button
                onClick={handleClearFailed}
                className="px-4 py-2 text-sm rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                실패/취소 작업 정리
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
                  : `${STATUS_LABEL[filter]} 작업이 없습니다`}
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
                  <div className="flex items-start gap-3">
                    {renderStatusIcon(job)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {JOB_TYPE_LABEL[job.type]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {STATUS_LABEL[job.status]}
                        </span>
                        {isActive && job.status === 'processing' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            진행 중
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getJobDescription(job)}
                      </p>

                      {/* Progress Bar */}
                      {(job.status === 'processing' ||
                        job.status === 'pending') && (
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

                      {job.status === 'failed' && job.error && (
                        <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                          {job.error}
                        </div>
                      )}
                      {job.status === 'cancelled' && (
                        <div className="mt-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-500">
                          사용자가 취소했습니다
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {job.status === 'failed' &&
                        job.retryCount < job.maxRetries && (
                          <button
                            onClick={() => retryJob(job.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="재시도"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      {job.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (confirm('이 작업을 취소하시겠습니까?')) {
                              cancelJob(job.id);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          title="취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {(job.status === 'completed' ||
                        job.status === 'failed' ||
                        job.status === 'cancelled') && (
                        <button
                          onClick={() => {
                            if (confirm('이 작업을 삭제하시겠습니까?')) {
                              removeJob(job.id);
                            }
                          }}
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
                          {new Date(job.createdAt).toLocaleString('ko-KR')}
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
