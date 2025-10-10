/**
 * Web Vitals Monitoring
 * Core Web Vitals (LCP, FID, CLS, TTFB, INP) 측정 및 리포팅
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

/**
 * Web Vital 메트릭 타입
 */
export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Web Vitals 임계값 (Google 권장 기준)
 */
const THRESHOLDS = {
  // Largest Contentful Paint
  LCP: {
    good: 2500, // 2.5s
    poor: 4000, // 4s
  },
  // Cumulative Layout Shift
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  // Time to First Byte
  TTFB: {
    good: 800, // 800ms
    poor: 1800, // 1.8s
  },
  // Interaction to Next Paint (FID 대체)
  INP: {
    good: 200, // 200ms
    poor: 500, // 500ms
  },
  // First Contentful Paint
  FCP: {
    good: 1800, // 1.8s
    poor: 3000, // 3s
  },
} as const;

/**
 * 메트릭 값에 대한 평가 계산
 */
function getRating(
  name: WebVitalMetric['name'],
  value: number
): WebVitalMetric['rating'] {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals를 외부 서비스로 전송
 */
function sendToAnalytics(metric: WebVitalMetric) {
  // Vercel Analytics로 자동 전송 (SpeedInsights 컴포넌트 사용 시)
  // 추가로 커스텀 로깅이 필요한 경우 여기에 구현

  if (process.env.NODE_ENV === 'development') {
    // 개발 모드에서는 콘솔에 출력
    // eslint-disable-next-line no-console
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // 프로덕션 환경에서 추가 분석 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // 예: Google Analytics, Sentry 등
    // 현재는 Vercel Analytics가 자동으로 수집
  }
}

/**
 * 모든 Core Web Vitals 리스너 등록
 */
export function reportWebVitals() {
  try {
    // Largest Contentful Paint
    onLCP((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      sendToAnalytics(webVitalMetric);
    });

    // Cumulative Layout Shift
    onCLS((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      sendToAnalytics(webVitalMetric);
    });

    // Time to First Byte
    onTTFB((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      sendToAnalytics(webVitalMetric);
    });

    // Interaction to Next Paint
    onINP((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'INP',
        value: metric.value,
        rating: getRating('INP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      sendToAnalytics(webVitalMetric);
    });

    // First Contentful Paint
    onFCP((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      sendToAnalytics(webVitalMetric);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Web Vitals] Error reporting metrics:', error);
  }
}

/**
 * 페이지별 성능 메트릭 수집
 */
export function reportPagePerformance(pageName: string) {
  if (typeof window === 'undefined') return;

  try {
    // Navigation Timing API
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = {
        page: pageName,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      };

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Page Performance]', metrics);
      }

      // 프로덕션 환경에서 분석 서비스로 전송
      // 예: Vercel Analytics, Google Analytics 등
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Page Performance] Error collecting metrics:', error);
  }
}
