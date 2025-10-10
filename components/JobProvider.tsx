'use client';

import { useEffect } from 'react';
import { jobProcessor } from '@/lib/queue/job-processor';
import JobToast from './JobToast';

/**
 * 작업 프로세서 프로바이더
 * 앱 전체에서 백그라운드 작업을 처리
 */
export default function JobProvider() {
  useEffect(() => {
    // 프로세서 시작
    jobProcessor.start();

    // 클린업
    return () => {
      jobProcessor.stop();
    };
  }, []);

  return <JobToast />;
}
