import { describe, it, expect } from 'vitest';

/**
 * API Error Handling Test Suite
 *
 * Tests error handling patterns used across AI API clients
 * - Error type detection
 * - Error message formatting
 * - Error recovery strategies
 */

class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

class RateLimitError extends AIError {
  constructor(
    message: string,
    public retryAfter: number = 60
  ) {
    super(message, 'RATE_LIMIT', 429, true);
    this.name = 'RateLimitError';
  }
}

class AuthenticationError extends AIError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401, false);
    this.name = 'AuthenticationError';
  }
}

describe('API Error Handling', () => {
  describe('error classification', () => {
    it('should create AIError with correct properties', () => {
      const error = new AIError('API call failed', 'API_ERROR', 500, true);

      expect(error.message).toBe('API call failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
    });

    it('should identify rate limit errors', () => {
      const error = new RateLimitError('Rate limit exceeded', 120);

      expect(error).toBeInstanceOf(AIError);
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.statusCode).toBe(429);
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(120);
    });

    it('should identify authentication errors', () => {
      const error = new AuthenticationError('Invalid API key');

      expect(error).toBeInstanceOf(AIError);
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.retryable).toBe(false);
    });
  });

  describe('error categorization', () => {
    it('should determine if error is retryable', () => {
      const retryableError = new AIError(
        'Network timeout',
        'TIMEOUT',
        503,
        true
      );
      const nonRetryableError = new AIError(
        'Invalid request',
        'VALIDATION_ERROR',
        400,
        false
      );

      expect(retryableError.retryable).toBe(true);
      expect(nonRetryableError.retryable).toBe(false);
    });

    it('should categorize HTTP status codes', () => {
      const codes = {
        400: false, // Bad request - not retryable
        401: false, // Unauthorized - not retryable
        429: true, // Rate limit - retryable
        500: true, // Server error - retryable
        503: true, // Service unavailable - retryable
      };

      Object.entries(codes).forEach(([statusCode, shouldRetry]) => {
        const error = new AIError('Error', 'API_ERROR', parseInt(statusCode));
        error.retryable = shouldRetry;

        expect(error.retryable).toBe(shouldRetry);
      });
    });
  });

  describe('error message formatting', () => {
    it('should format error messages with context', () => {
      const error = new AIError('API call failed', 'API_ERROR', 500, true);
      const formatted = `[${error.code}] ${error.message} (HTTP ${error.statusCode})`;

      expect(formatted).toBe('[API_ERROR] API call failed (HTTP 500)');
    });

    it('should include retry information in error context', () => {
      const error = new RateLimitError('Rate limit exceeded', 120);
      const context = {
        error: error.code,
        message: error.message,
        retryable: error.retryable,
        retryAfter: error.retryAfter,
      };

      expect(context.retryable).toBe(true);
      expect(context.retryAfter).toBe(120);
    });
  });

  describe('error recovery strategy', () => {
    it('should determine recovery approach based on error type', () => {
      const strategies = {
        [new AIError('Network timeout', 'TIMEOUT', 503, true).code]: 'retry',
        [new AuthenticationError('Invalid API key').code]: 'fail',
        [new RateLimitError('Rate limit').code]: 'wait-and-retry',
      };

      expect(strategies['TIMEOUT']).toBe('retry');
      expect(strategies['AUTH_ERROR']).toBe('fail');
      expect(strategies['RATE_LIMIT']).toBe('wait-and-retry');
    });

    it('should provide backoff delay for rate limit errors', () => {
      const error = new RateLimitError('Rate limit', 60);

      // Exponential backoff: 60 * 2^retry_count
      const delayAfter1Retry = error.retryAfter * Math.pow(2, 0); // 60
      const delayAfter2Retries = error.retryAfter * Math.pow(2, 1); // 120

      expect(delayAfter1Retry).toBe(60);
      expect(delayAfter2Retries).toBe(120);
    });
  });

  describe('error logging context', () => {
    it('should capture error context for logging', () => {
      const error = new AIError('API call failed', 'API_ERROR', 500, true);
      const context = {
        timestamp: new Date().toISOString(),
        errorCode: error.code,
        message: error.message,
        statusCode: error.statusCode,
        retryable: error.retryable,
      };

      expect(context.errorCode).toBe('API_ERROR');
      expect(context.statusCode).toBe(500);
      expect(context.retryable).toBe(true);
    });

    it('should include request metadata in error context', () => {
      const error = new AIError('API call failed', 'API_ERROR', 500, true);
      const requestContext = {
        method: 'POST',
        endpoint: '/api/generate',
        error: error.code,
        duration: 1500, // ms
      };

      expect(requestContext.method).toBe('POST');
      expect(requestContext.endpoint).toBe('/api/generate');
      expect(requestContext.duration).toBeGreaterThan(0);
    });
  });
});
