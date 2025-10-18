'use client';

/**
 * Web Vitals Reporter Component
 * 클라이언트 측에서 Web Vitals 리포팅 초기화
 */

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/monitoring/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    // Web Vitals 리스너 등록
    reportWebVitals();
  }, []);

  // 렌더링 없음 (모니터링 전용)
  return null;
}
