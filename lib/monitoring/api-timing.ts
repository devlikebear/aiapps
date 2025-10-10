/**
 * API Response Time Tracking
 * Server-Timing 헤더 및 성능 로깅
 */

/**
 * API 타이밍 메트릭
 */
export interface APITimingMetric {
  name: string;
  duration: number;
  description?: string;
}

/**
 * Server-Timing 헤더 생성
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing
 */
export function createServerTimingHeader(metrics: APITimingMetric[]): string {
  return metrics
    .map((metric) => {
      const parts = [`${metric.name};dur=${metric.duration.toFixed(2)}`];
      if (metric.description) {
        parts.push(`desc="${metric.description}"`);
      }
      return parts.join(';');
    })
    .join(', ');
}

/**
 * API 타이밍 로거
 */
export class APITimingLogger {
  private startTime: number;
  private metrics: Map<string, APITimingMetric>;

  constructor() {
    this.startTime = performance.now();
    this.metrics = new Map();
  }

  /**
   * 메트릭 시작
   */
  start(name: string, description?: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.metrics.set(name, {
        name,
        duration,
        description,
      });
    };
  }

  /**
   * 수동 메트릭 추가
   */
  add(name: string, duration: number, description?: string): void {
    this.metrics.set(name, {
      name,
      duration,
      description,
    });
  }

  /**
   * 전체 응답 시간 계산
   */
  getTotalDuration(): number {
    return performance.now() - this.startTime;
  }

  /**
   * 모든 메트릭 반환
   */
  getMetrics(): APITimingMetric[] {
    const total = this.getTotalDuration();

    // 전체 시간 메트릭 추가
    this.metrics.set('total', {
      name: 'total',
      duration: total,
      description: 'Total response time',
    });

    return Array.from(this.metrics.values());
  }

  /**
   * Server-Timing 헤더 문자열 반환
   */
  getServerTimingHeader(): string {
    return createServerTimingHeader(this.getMetrics());
  }

  /**
   * 성능 로그 출력
   */
  log(endpoint: string, statusCode: number): void {
    const total = this.getTotalDuration();
    const metrics = this.getMetrics();

    // 느린 API 경고 (2초 이상)
    const isSlowAPI = total > 2000;

    if (process.env.NODE_ENV === 'development' || isSlowAPI) {
      const logLevel = isSlowAPI ? 'warn' : 'log';
      // eslint-disable-next-line no-console
      console[logLevel]('[API Timing]', {
        endpoint,
        statusCode,
        total: `${total.toFixed(2)}ms`,
        metrics: metrics.map((m) => ({
          [m.name]: `${m.duration.toFixed(2)}ms`,
        })),
      });
    }

    // 프로덕션 환경에서 느린 API 로깅
    if (process.env.NODE_ENV === 'production' && isSlowAPI) {
      // 여기에 외부 모니터링 서비스로 전송하는 로직 추가
      // 예: Vercel Analytics, Sentry, Datadog 등
    }
  }
}

/**
 * API Route에서 사용할 타이밍 래퍼
 */
export function withAPITiming<T>(
  handler: (logger: APITimingLogger) => Promise<T>
): Promise<T> {
  const logger = new APITimingLogger();
  return handler(logger);
}
