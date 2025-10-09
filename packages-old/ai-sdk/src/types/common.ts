/**
 * 공통 SDK 설정 타입
 */
export interface SDKConfig {
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * 공통 에러 타입
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * 레이트 리밋 에러
 */
export class RateLimitError extends AIError {
  constructor(
    message: string,
    public retryAfter?: number,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.name = 'NetworkError';
  }
}

/**
 * 검증 에러
 */
export class ValidationError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}
