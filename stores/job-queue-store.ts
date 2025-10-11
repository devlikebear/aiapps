/**
 * Job Queue Store
 * Global state management for background job processing
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, JobStatus, JobQueueStats } from '@/lib/types/queue';

interface JobQueueStore {
  // State
  jobs: Job[];
  activeJobId: string | null;

  // Actions
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;

  // Job control
  setActiveJob: (jobId: string | null) => void;
  updateJobStatus: (
    jobId: string,
    status: JobStatus,
    error?: Job['error']
  ) => void;
  updateJobProgress: (jobId: string, progress: number) => void;
  retryJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;

  // Priority management
  setJobPriority: (jobId: string, priority: number) => void;
  reorderJobs: (fromIndex: number, toIndex: number) => void;

  // Getters
  getJob: (jobId: string) => Job | undefined;
  getJobsByStatus: (status: JobStatus) => Job[];
  getNextPendingJob: () => Job | undefined;
  getStats: () => JobQueueStats;
  hasActiveJob: () => boolean;
  hasPendingJobs: () => boolean;
}

export const useJobQueueStore = create<JobQueueStore>()(
  persist(
    (set, get) => ({
      // Initial state
      jobs: [],
      activeJobId: null,

      // Add new job to queue
      addJob: (job) => {
        set((state) => ({
          jobs: [...state.jobs, job],
        }));
      },

      // Update existing job
      updateJob: (jobId, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, ...updates } : job
          ) as Job[],
        }));
      },

      // Remove job from queue
      removeJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== jobId),
          activeJobId: state.activeJobId === jobId ? null : state.activeJobId,
        }));
      },

      // Clear completed jobs
      clearCompleted: () => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.status !== 'completed'),
        }));
      },

      // Clear failed jobs
      clearFailed: () => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.status !== 'failed'),
        }));
      },

      // Clear all jobs
      clearAll: () => {
        set({ jobs: [], activeJobId: null });
      },

      // Set active job
      setActiveJob: (jobId) => {
        set({ activeJobId: jobId });
      },

      // Update job status
      updateJobStatus: (jobId, status, error) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id !== jobId) return job;

            const updates: Partial<Job> = { status, error };

            if (status === 'processing' && !job.startedAt) {
              updates.startedAt = new Date();
            } else if (status === 'completed' || status === 'failed') {
              updates.completedAt = new Date();
            }

            return { ...job, ...updates };
          }) as Job[],
        }));
      },

      // Update job progress
      updateJobProgress: (jobId, progress) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, progress } : job
          ),
        }));
      },

      // Retry failed job
      retryJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id !== jobId) return job;
            if (job.retryCount >= job.maxRetries) return job;

            return {
              ...job,
              status: 'pending' as JobStatus,
              progress: 0,
              error: undefined,
              retryCount: job.retryCount + 1,
              startedAt: undefined,
              completedAt: undefined,
            };
          }),
        }));
      },

      // Cancel job
      cancelJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'failed' as JobStatus,
                  error: { message: 'Job cancelled by user' },
                  completedAt: new Date(),
                }
              : job
          ),
          activeJobId: state.activeJobId === jobId ? null : state.activeJobId,
        }));
      },

      // Set job priority
      setJobPriority: (jobId, priority) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, priority } : job
          ),
        }));
      },

      // Reorder jobs (drag and drop)
      reorderJobs: (fromIndex, toIndex) => {
        set((state) => {
          const newJobs = [...state.jobs];
          const [removed] = newJobs.splice(fromIndex, 1);
          newJobs.splice(toIndex, 0, removed);
          return { jobs: newJobs };
        });
      },

      // Get specific job
      getJob: (jobId) => {
        return get().jobs.find((job) => job.id === jobId);
      },

      // Get jobs by status
      getJobsByStatus: (status) => {
        return get().jobs.filter((job) => job.status === status);
      },

      // Get next pending job (highest priority)
      getNextPendingJob: () => {
        const pendingJobs = get()
          .jobs.filter((job) => job.status === 'pending')
          .sort((a, b) => b.priority - a.priority);

        return pendingJobs[0];
      },

      // Get queue statistics
      getStats: () => {
        const jobs = get().jobs;
        return {
          total: jobs.length,
          pending: jobs.filter((j) => j.status === 'pending').length,
          processing: jobs.filter((j) => j.status === 'processing').length,
          completed: jobs.filter((j) => j.status === 'completed').length,
          failed: jobs.filter((j) => j.status === 'failed').length,
        };
      },

      // Check if there's an active job
      hasActiveJob: () => {
        return get().activeJobId !== null;
      },

      // Check if there are pending jobs
      hasPendingJobs: () => {
        return get().jobs.some((job) => job.status === 'pending');
      },
    }),
    {
      name: 'job-queue-storage',
      partialize: (state) => ({
        jobs: state.jobs,
        activeJobId: state.activeJobId,
      }),
    }
  )
);
