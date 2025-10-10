/**
 * 작업 큐 관리자
 * localStorage를 사용한 백그라운드 작업 큐 시스템
 */

import type {
  Job,
  JobQueue,
  JobType,
  JobFilter,
  JobStats,
  JobEvent,
  JobEventType,
  AudioJob,
  ImageJob,
} from './types';

const QUEUE_KEY = 'aiapps-job-queue';
const MAX_QUEUE_SIZE = 100;
const MAX_COMPLETED_AGE = 24 * 60 * 60 * 1000; // 24시간

/**
 * 작업 큐 관리자 클래스
 */
export class JobQueueManager {
  private listeners: Map<string, Set<(event: JobEvent) => void>> = new Map();

  /**
   * 큐 로드
   */
  private loadQueue(): JobQueue {
    if (typeof window === 'undefined') {
      return { jobs: [], lastUpdated: Date.now() };
    }

    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (!stored) {
        return { jobs: [], lastUpdated: Date.now() };
      }

      const queue: JobQueue = JSON.parse(stored);

      // 오래된 완료 작업 제거
      const now = Date.now();
      queue.jobs = queue.jobs.filter((job) => {
        if (job.status === 'completed' && job.completedAt) {
          return now - job.completedAt < MAX_COMPLETED_AGE;
        }
        return true;
      });

      return queue;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load job queue:', error);
      return { jobs: [], lastUpdated: Date.now() };
    }
  }

  /**
   * 큐 저장
   */
  private saveQueue(queue: JobQueue): void {
    if (typeof window === 'undefined') return;

    try {
      // 큐 크기 제한
      if (queue.jobs.length > MAX_QUEUE_SIZE) {
        // 오래된 완료/실패 작업 제거
        queue.jobs = queue.jobs
          .sort((a, b) => {
            const aTime = a.completedAt || a.createdAt;
            const bTime = b.completedAt || b.createdAt;
            return bTime - aTime;
          })
          .slice(0, MAX_QUEUE_SIZE);
      }

      queue.lastUpdated = Date.now();
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save job queue:', error);
    }
  }

  /**
   * 이벤트 발생
   */
  private emit(type: JobEventType, job: Job): void {
    const event: JobEvent = {
      type,
      jobId: job.id,
      job,
      timestamp: Date.now(),
    };

    const listeners = this.listeners.get(type) || new Set();
    listeners.forEach((listener) => listener(event));

    // 전체 리스너에게도 알림
    const allListeners = this.listeners.get('*') || new Set();
    allListeners.forEach((listener) => listener(event));
  }

  /**
   * 이벤트 리스너 등록
   */
  on(type: JobEventType | '*', listener: (event: JobEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(type: JobEventType | '*', listener: (event: JobEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 오디오 작업 추가
   */
  addAudioJob(params: AudioJob['params']): AudioJob {
    const job: AudioJob = {
      id: `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'audio',
      status: 'pending',
      createdAt: Date.now(),
      params,
    };

    const queue = this.loadQueue();
    queue.jobs.push(job);
    this.saveQueue(queue);

    this.emit('job:added', job);
    return job;
  }

  /**
   * 이미지 작업 추가
   */
  addImageJob(params: ImageJob['params']): ImageJob {
    const job: ImageJob = {
      id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      status: 'pending',
      createdAt: Date.now(),
      params,
    };

    const queue = this.loadQueue();
    queue.jobs.push(job);
    this.saveQueue(queue);

    this.emit('job:added', job);
    return job;
  }

  /**
   * 작업 상태 업데이트
   */
  updateJob(jobId: string, updates: Partial<Job>): Job | null {
    const queue = this.loadQueue();
    const index = queue.jobs.findIndex((j) => j.id === jobId);

    if (index === -1) return null;

    const job = queue.jobs[index];
    const updatedJob = { ...job, ...updates } as Job;

    queue.jobs[index] = updatedJob;
    this.saveQueue(queue);

    // 상태에 따라 이벤트 발생
    if (updates.status === 'processing' && job.status !== 'processing') {
      this.emit('job:started', updatedJob);
    } else if (updates.status === 'completed') {
      this.emit('job:completed', updatedJob);
    } else if (updates.status === 'failed') {
      this.emit('job:failed', updatedJob);
    } else if (updates.status === 'cancelled') {
      this.emit('job:cancelled', updatedJob);
    } else if (updates.progress !== undefined) {
      this.emit('job:progress', updatedJob);
    }

    return updatedJob;
  }

  /**
   * 작업 조회
   */
  getJob(jobId: string): Job | null {
    const queue = this.loadQueue();
    return queue.jobs.find((j) => j.id === jobId) || null;
  }

  /**
   * 작업 목록 조회
   */
  getJobs(filter?: JobFilter): Job[] {
    const queue = this.loadQueue();
    let jobs = queue.jobs;

    if (filter?.type) {
      jobs = jobs.filter((j) => j.type === filter.type);
    }

    if (filter?.status) {
      jobs = jobs.filter((j) => j.status === filter.status);
    }

    // 최신순 정렬
    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 대기 중인 작업 조회
   */
  getPendingJobs(type?: JobType): Job[] {
    return this.getJobs({ type, status: 'pending' });
  }

  /**
   * 처리 중인 작업 조회
   */
  getProcessingJobs(type?: JobType): Job[] {
    return this.getJobs({ type, status: 'processing' });
  }

  /**
   * 완료된 작업 조회
   */
  getCompletedJobs(type?: JobType): Job[] {
    return this.getJobs({ type, status: 'completed' });
  }

  /**
   * 작업 삭제
   */
  deleteJob(jobId: string): boolean {
    const queue = this.loadQueue();
    const index = queue.jobs.findIndex((j) => j.id === jobId);

    if (index === -1) return false;

    queue.jobs.splice(index, 1);
    this.saveQueue(queue);
    return true;
  }

  /**
   * 작업 취소
   */
  cancelJob(jobId: string): boolean {
    const job = this.getJob(jobId);
    if (!job) return false;

    // 완료된 작업은 취소 불가
    if (job.status === 'completed') return false;

    this.updateJob(jobId, { status: 'cancelled' });
    return true;
  }

  /**
   * 완료된 작업 모두 삭제
   */
  clearCompleted(): number {
    const queue = this.loadQueue();
    const before = queue.jobs.length;

    queue.jobs = queue.jobs.filter((j) => j.status !== 'completed');
    this.saveQueue(queue);

    return before - queue.jobs.length;
  }

  /**
   * 실패한 작업 모두 삭제
   */
  clearFailed(): number {
    const queue = this.loadQueue();
    const before = queue.jobs.length;

    queue.jobs = queue.jobs.filter((j) => j.status !== 'failed');
    this.saveQueue(queue);

    return before - queue.jobs.length;
  }

  /**
   * 작업 통계
   */
  getStats(): JobStats {
    const jobs = this.getJobs();

    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      cancelled: jobs.filter((j) => j.status === 'cancelled').length,
      byType: {
        audio: jobs.filter((j) => j.type === 'audio').length,
        image: jobs.filter((j) => j.type === 'image').length,
      },
    };
  }

  /**
   * 큐 초기화
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUEUE_KEY);
  }
}

/**
 * 싱글톤 인스턴스
 */
export const jobQueue = new JobQueueManager();
