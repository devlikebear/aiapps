/**
 * Job Queue Store
 * jobQueue 싱글톤과 동기화되며 UI에서 필요한 편의 액션을 제공
 */

import { create } from 'zustand';
import { jobQueue, type Job, type JobEvent } from '@/lib/queue';

interface JobQueueStoreState {
  jobs: Job[];
  activeJobId: string | null;
  isManagerOpen: boolean;
}

interface JobQueueStoreActions {
  openManager: () => void;
  closeManager: () => void;
  toggleManager: () => void;
  retryJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  reorderJobs: (fromIndex: number, toIndex: number) => void;
  setJobPriority: (jobId: string, priority: number) => void;
}

type JobQueueStore = JobQueueStoreState & JobQueueStoreActions;

const selectActiveJobId = (jobs: Job[]): string | null => {
  const processingJob = jobs.find((job) => job.status === 'processing');
  return processingJob ? processingJob.id : null;
};

export const useJobQueueStore = create<JobQueueStore>((set) => {
  const syncFromQueue = () => {
    const jobs = jobQueue.getJobs();
    set({
      jobs,
      activeJobId: selectActiveJobId(jobs),
    });
  };

  const initialJobs = jobQueue.getJobs();

  // jobQueue 이벤트와 동기화
  const listener = (_event: JobEvent) => {
    syncFromQueue();
  };
  jobQueue.on('*', listener);

  return {
    jobs: initialJobs,
    activeJobId: selectActiveJobId(initialJobs),
    isManagerOpen: false,

    openManager: () => set({ isManagerOpen: true }),
    closeManager: () => set({ isManagerOpen: false }),
    toggleManager: () =>
      set((state) => ({ isManagerOpen: !state.isManagerOpen })),

    retryJob: (jobId: string) => {
      jobQueue.retryJob(jobId);
    },

    cancelJob: (jobId: string) => {
      jobQueue.cancelJob(jobId);
    },

    removeJob: (jobId: string) => {
      jobQueue.deleteJob(jobId);
    },

    clearCompleted: () => {
      jobQueue.clearCompleted();
    },

    clearFailed: () => {
      jobQueue.clearFailed();
    },

    reorderJobs: (fromIndex: number, toIndex: number) => {
      jobQueue.reorderJobs(fromIndex, toIndex);
    },

    setJobPriority: (jobId: string, priority: number) => {
      jobQueue.setJobPriority(jobId, priority);
    },
  };
});
