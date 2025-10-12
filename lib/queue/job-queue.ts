/**
 * 작업 큐 관리자
 * localStorage를 사용해 백그라운드 작업을 관리하는 싱글톤 큐
 */

import type {
  AudioGenerateJob,
  ImageComposeJob,
  ImageEditJob,
  ImageGenerateJob,
  ImageStyleTransferJob,
  Job,
  JobEvent,
  JobEventType,
  JobFilter,
  JobQueue,
  JobStats,
  JobType,
} from './types';

const QUEUE_STORAGE_KEY = 'aiapps-job-queue';
const MAX_QUEUE_SIZE = 100;
const MAX_COMPLETED_AGE = 24 * 60 * 60 * 1000; // 24시간
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_PRIORITY = 5;

type ListenerTarget = JobEventType | '*';

const clampProgress = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)));

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

/**
 * JSON → Job 구조 정규화
 */
function normalizeJob(rawJob: Job): Job {
  const progress =
    typeof rawJob.progress === 'number'
      ? clampProgress(rawJob.progress)
      : rawJob.status === 'completed'
        ? 100
        : 0;

  return {
    ...rawJob,
    progress,
    retryCount: typeof rawJob.retryCount === 'number' ? rawJob.retryCount : 0,
    maxRetries:
      typeof rawJob.maxRetries === 'number'
        ? rawJob.maxRetries
        : DEFAULT_MAX_RETRIES,
    priority:
      typeof rawJob.priority === 'number' ? rawJob.priority : DEFAULT_PRIORITY,
  };
}

export class JobQueueManager {
  private listeners: Map<ListenerTarget, Set<(event: JobEvent) => void>> =
    new Map();

  /**
   * 현재 큐 상태 로드
   */
  private loadQueue(): JobQueue {
    if (typeof window === 'undefined') {
      return { jobs: [], lastUpdated: Date.now() };
    }

    try {
      const stored = window.localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!stored) {
        return { jobs: [], lastUpdated: Date.now() };
      }

      const parsed = JSON.parse(stored) as Partial<JobQueue>;
      const now = Date.now();

      const rawJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
      const jobs = rawJobs
        .map((job) => normalizeJob(job as Job))
        .filter((job) => {
          if (job.status === 'completed' && job.completedAt) {
            return now - job.completedAt < MAX_COMPLETED_AGE;
          }
          return true;
        });

      return {
        jobs,
        lastUpdated: parsed.lastUpdated ?? now,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[JobQueue] failed to load queue:', error);
      return { jobs: [], lastUpdated: Date.now() };
    }
  }

  /**
   * 큐 상태 저장
   */
  private saveQueue(queue: JobQueue): void {
    if (typeof window === 'undefined') return;

    try {
      if (queue.jobs.length > MAX_QUEUE_SIZE) {
        queue.jobs = queue.jobs
          .sort((a, b) => {
            const aTime = a.completedAt ?? a.createdAt;
            const bTime = b.completedAt ?? b.createdAt;
            return bTime - aTime;
          })
          .slice(0, MAX_QUEUE_SIZE);
      }

      queue.lastUpdated = Date.now();
      window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[JobQueue] failed to save queue:', error);
    }
  }

  private emit(type: JobEventType, job: Job): void {
    const event: JobEvent = {
      type,
      job,
      jobId: job.id,
      timestamp: Date.now(),
    };

    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }

    const anyListeners = this.listeners.get('*');
    if (anyListeners) {
      anyListeners.forEach((listener) => listener(event));
    }
  }

  private syncAndEmit(queue: JobQueue, job: Job, type: JobEventType) {
    this.saveQueue(queue);
    this.emit(type, job);
  }

  on(type: ListenerTarget, listener: (event: JobEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  off(type: ListenerTarget, listener: (event: JobEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 공통 Job 생성 헬퍼
   */
  private createBaseJob<T extends Job>(
    job: Omit<T, 'progress' | 'retryCount' | 'maxRetries' | 'priority'> &
      Partial<Pick<T, 'progress' | 'retryCount' | 'maxRetries' | 'priority'>>
  ): T {
    return {
      ...job,
      progress: job.progress !== undefined ? clampProgress(job.progress) : 0,
      retryCount: job.retryCount !== undefined ? job.retryCount : 0,
      maxRetries:
        job.maxRetries !== undefined ? job.maxRetries : DEFAULT_MAX_RETRIES,
      priority: job.priority !== undefined ? job.priority : DEFAULT_PRIORITY,
    } as T;
  }

  private appendJob<T extends Job>(job: T): T {
    const queue = this.loadQueue();
    const normalized = normalizeJob(job);
    queue.jobs.push(normalized);
    this.syncAndEmit(queue, normalized, 'job:added');
    return normalized as T;
  }

  addAudioGenerateJob(
    params: AudioGenerateJob['params'],
    priority: number = DEFAULT_PRIORITY
  ): AudioGenerateJob {
    return this.appendJob(
      this.createBaseJob<AudioGenerateJob>({
        id: generateId('audio'),
        type: 'audio-generate',
        status: 'pending',
        createdAt: Date.now(),
        priority,
        params,
      })
    );
  }

  addImageGenerateJob(
    params: ImageGenerateJob['params'],
    priority: number = DEFAULT_PRIORITY
  ): ImageGenerateJob {
    return this.appendJob(
      this.createBaseJob<ImageGenerateJob>({
        id: generateId('image-gen'),
        type: 'image-generate',
        status: 'pending',
        createdAt: Date.now(),
        priority,
        params,
      })
    );
  }

  addImageEditJob(
    params: ImageEditJob['params'],
    priority: number = DEFAULT_PRIORITY
  ): ImageEditJob {
    return this.appendJob(
      this.createBaseJob<ImageEditJob>({
        id: generateId('image-edit'),
        type: 'image-edit',
        status: 'pending',
        createdAt: Date.now(),
        priority,
        params,
      })
    );
  }

  addImageComposeJob(
    params: ImageComposeJob['params'],
    priority: number = DEFAULT_PRIORITY
  ): ImageComposeJob {
    return this.appendJob(
      this.createBaseJob<ImageComposeJob>({
        id: generateId('image-compose'),
        type: 'image-compose',
        status: 'pending',
        createdAt: Date.now(),
        priority,
        params,
      })
    );
  }

  addImageStyleTransferJob(
    params: ImageStyleTransferJob['params'],
    priority: number = DEFAULT_PRIORITY
  ): ImageStyleTransferJob {
    return this.appendJob(
      this.createBaseJob<ImageStyleTransferJob>({
        id: generateId('image-style'),
        type: 'image-style-transfer',
        status: 'pending',
        createdAt: Date.now(),
        priority,
        params,
      })
    );
  }

  getJob(jobId: string): Job | null {
    const queue = this.loadQueue();
    const job = queue.jobs.find((item) => item.id === jobId);
    return job ? normalizeJob(job) : null;
  }

  getJobs(filter?: JobFilter): Job[] {
    const queue = this.loadQueue();
    let jobs = [...queue.jobs];

    if (filter?.type) {
      jobs = jobs.filter((job) => job.type === filter.type);
    }

    if (filter?.status) {
      jobs = jobs.filter((job) => job.status === filter.status);
    }

    return jobs
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((job) => normalizeJob(job));
  }

  getPendingJobs(type?: JobType): Job[] {
    return this.getJobs({ type, status: 'pending' });
  }

  getProcessingJobs(type?: JobType): Job[] {
    return this.getJobs({ type, status: 'processing' });
  }

  getCompletedJobs(type?: JobType): Job[] {
    return this.getJobs({ type, status: 'completed' });
  }

  updateJob(jobId: string, updates: Partial<Job>): Job | null {
    const queue = this.loadQueue();
    const index = queue.jobs.findIndex((job) => job.id === jobId);
    if (index === -1) return null;

    const current = queue.jobs[index];
    const next: Job = normalizeJob({
      ...current,
      ...updates,
      progress:
        updates.progress !== undefined
          ? clampProgress(updates.progress)
          : current.progress,
      retryCount:
        updates.retryCount !== undefined
          ? updates.retryCount
          : current.retryCount,
      maxRetries:
        updates.maxRetries !== undefined
          ? updates.maxRetries
          : current.maxRetries,
      priority:
        updates.priority !== undefined ? updates.priority : current.priority,
    } as Job);

    if (
      updates.result === undefined &&
      Object.prototype.hasOwnProperty.call(updates, 'result')
    ) {
      delete (next as { result?: Job['result'] }).result;
    }

    if (
      updates.params === undefined &&
      Object.prototype.hasOwnProperty.call(updates, 'params')
    ) {
      next.params = current.params;
    }

    if (updates.status === 'processing' && !next.startedAt) {
      next.startedAt = Date.now();
    }

    if (
      updates.status &&
      (updates.status === 'completed' ||
        updates.status === 'failed' ||
        updates.status === 'cancelled')
    ) {
      next.completedAt = Date.now();
      if (updates.status === 'completed') {
        next.progress = 100;
      }
    }

    queue.jobs[index] = next;
    this.saveQueue(queue);

    if (updates.status === 'processing' && current.status !== 'processing') {
      this.emit('job:started', next);
    } else if (updates.status === 'completed') {
      this.emit('job:completed', next);
    } else if (updates.status === 'failed') {
      this.emit('job:failed', next);
    } else if (updates.status === 'cancelled') {
      this.emit('job:cancelled', next);
    }

    if (
      updates.progress !== undefined &&
      updates.progress !== current.progress
    ) {
      this.emit('job:progress', next);
    }

    this.emit('job:updated', next);
    return next;
  }

  retryJob(jobId: string): Job | null {
    const existing = this.getJob(jobId);
    if (!existing) return null;
    if (existing.retryCount >= existing.maxRetries) {
      return existing;
    }

    return this.updateJob(jobId, {
      status: 'pending',
      progress: 0,
      retryCount: existing.retryCount + 1,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
      result: undefined,
    });
  }

  cancelJob(jobId: string): Job | null {
    const job = this.getJob(jobId);
    if (!job || job.status === 'completed') {
      return job;
    }

    return this.updateJob(jobId, {
      status: 'cancelled',
      progress: 0,
    });
  }

  deleteJob(jobId: string): boolean {
    const queue = this.loadQueue();
    const index = queue.jobs.findIndex((job) => job.id === jobId);
    if (index === -1) return false;

    const [removed] = queue.jobs.splice(index, 1);
    this.syncAndEmit(queue, removed, 'job:removed');
    return true;
  }

  clearCompleted(): number {
    const queue = this.loadQueue();
    const completedJobs = queue.jobs.filter(
      (job) => job.status === 'completed'
    );
    if (completedJobs.length === 0) return 0;

    queue.jobs = queue.jobs.filter((job) => job.status !== 'completed');
    this.saveQueue(queue);
    completedJobs.forEach((job) => this.emit('job:removed', job));
    return completedJobs.length;
  }

  clearFailed(): number {
    const queue = this.loadQueue();
    const failedJobs = queue.jobs.filter((job) => job.status === 'failed');
    if (failedJobs.length === 0) return 0;

    queue.jobs = queue.jobs.filter((job) => job.status !== 'failed');
    this.saveQueue(queue);
    failedJobs.forEach((job) => this.emit('job:removed', job));
    return failedJobs.length;
  }

  setJobPriority(jobId: string, priority: number): Job | null {
    return this.updateJob(jobId, {
      priority: Math.max(1, Math.min(10, Math.round(priority))),
    });
  }

  reorderJobs(fromIndex: number, toIndex: number): void {
    const queue = this.loadQueue();
    const jobs = queue.jobs;

    if (
      fromIndex < 0 ||
      fromIndex >= jobs.length ||
      toIndex < 0 ||
      toIndex >= jobs.length
    ) {
      return;
    }

    const [moved] = jobs.splice(fromIndex, 1);
    jobs.splice(toIndex, 0, moved);
    this.saveQueue(queue);
    this.emit('job:updated', normalizeJob(moved));
  }

  getStats(): JobStats {
    const jobs = this.getJobs();
    const stats: JobStats = {
      total: jobs.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      byType: {
        'audio-generate': 0,
        'image-generate': 0,
        'image-edit': 0,
        'image-compose': 0,
        'image-style-transfer': 0,
      },
    };

    jobs.forEach((job) => {
      stats.byType[job.type] = (stats.byType[job.type] ?? 0) + 1;
      switch (job.status) {
        case 'pending':
          stats.pending += 1;
          break;
        case 'processing':
          stats.processing += 1;
          break;
        case 'completed':
          stats.completed += 1;
          break;
        case 'failed':
          stats.failed += 1;
          break;
        case 'cancelled':
          stats.cancelled += 1;
          break;
        default:
          break;
      }
    });

    return stats;
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(QUEUE_STORAGE_KEY);
  }
}

export const jobQueue = new JobQueueManager();
