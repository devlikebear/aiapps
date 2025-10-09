/**
 * Exponential Backoff 재시도 로직
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'RATE_LIMIT_EXCEEDED', 'TIMEOUT'],
};

/**
 * 재시도 가능한 에러인지 확인
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  if ('code' in error) {
    return retryableErrors.includes((error as { code: string }).code);
  }
  return false;
}

/**
 * 지연 시간 계산 (Exponential Backoff with Jitter)
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const exponentialDelay =
    initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * 재시도 래퍼 함수
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 마지막 시도면 에러 throw
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // 재시도 불가능한 에러면 즉시 throw
      if (!isRetryableError(lastError, opts.retryableErrors)) {
        throw lastError;
      }

      // 지연 후 재시도
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
