/**
 * Rate Limiter 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../rate-limiter';
import { RateLimitError } from '../../types/common';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 1000,
      maxTokens: 10,
    });
  });

  it('should allow requests within rate limit', async () => {
    await expect(rateLimiter.acquire(5)).resolves.toBeUndefined();
    expect(rateLimiter.getAvailableTokens()).toBe(5);
  });

  it('should throw RateLimitError when exceeding limit', async () => {
    await rateLimiter.acquire(10);
    await expect(rateLimiter.acquire(1)).rejects.toThrow(RateLimitError);
  });

  it('should refill tokens over time', async () => {
    await rateLimiter.acquire(10);

    // 100ms 대기 (10% 리필)
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(rateLimiter.getAvailableTokens()).toBeGreaterThan(0);
  });

  it('should reset tokens', async () => {
    await rateLimiter.acquire(10);
    expect(rateLimiter.getAvailableTokens()).toBe(0);

    rateLimiter.reset();
    expect(rateLimiter.getAvailableTokens()).toBe(10);
  });

  it('should wait and acquire tokens', async () => {
    await rateLimiter.acquire(10);

    const startTime = Date.now();
    await rateLimiter.acquireWithWait(5);
    const elapsed = Date.now() - startTime;

    // 5 tokens을 얻기 위해 500ms 이상 대기해야 함
    expect(elapsed).toBeGreaterThanOrEqual(400);
  });
});
