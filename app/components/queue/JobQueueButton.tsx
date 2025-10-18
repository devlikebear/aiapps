'use client';
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ListTodo, Loader2 } from 'lucide-react';
import { useJobQueueStore } from '@/lib/stores/job-queue-store';
import type { Job } from '@/lib/queue';
import JobQueueManager from './JobQueueManager';

interface JobStatsSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
}

const calculateStats = (jobs: Job[]): JobStatsSummary => {
  const base: JobStatsSummary = {
    total: jobs.length,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  jobs.forEach((job) => {
    base[job.status] += 1;
  });

  return base;
};

export default function JobQueueButton() {
  const [isClient, setIsClient] = useState(false);
  const jobs = useJobQueueStore((state) => state.jobs);
  const openManager = useJobQueueStore((state) => state.openManager);
  const isManagerOpen = useJobQueueStore((state) => state.isManagerOpen);

  const stats = useMemo(() => calculateStats(jobs), [jobs]);
  const isProcessing = stats.processing > 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (stats.total === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={openManager}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="작업 큐"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        ) : (
          <ListTodo className="w-6 h-6" />
        )}

        {(stats.pending > 0 || stats.processing > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {stats.pending + stats.processing}
          </span>
        )}

        {stats.failed > 0 && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full" />
        )}
      </button>

      {isManagerOpen && <JobQueueManager />}
    </>
  );
}
