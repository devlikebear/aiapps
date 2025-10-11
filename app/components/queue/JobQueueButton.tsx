'use client';

import { useState } from 'react';
import { ListTodo, Loader2 } from 'lucide-react';
import { useJobQueueStore } from '@/stores/job-queue-store';
import JobQueueManager from './JobQueueManager';

export default function JobQueueButton() {
  const [showManager, setShowManager] = useState(false);
  const { getStats, hasActiveJob } = useJobQueueStore();

  const stats = getStats();
  const isProcessing = hasActiveJob();

  // Don't show button if no jobs
  if (stats.total === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowManager(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="작업 큐"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        ) : (
          <ListTodo className="w-6 h-6" />
        )}

        {/* Badge for pending/processing jobs */}
        {(stats.pending > 0 || stats.processing > 0) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {stats.pending + stats.processing}
          </span>
        )}

        {/* Badge for failed jobs */}
        {stats.failed > 0 && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full" />
        )}
      </button>

      {showManager && <JobQueueManager onClose={() => setShowManager(false)} />}
    </>
  );
}
