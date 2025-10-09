/**
 * Retry 유틸리티 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../retry';
import { NetworkError } from '../../types/common';

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('Connection failed'))
      .mockResolvedValueOnce('success');

    const result = await withRetry(fn, { maxRetries: 2, initialDelay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries', async () => {
    const error = new NetworkError('Connection failed');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(
      withRetry(fn, { maxRetries: 3, initialDelay: 10 })
    ).rejects.toThrow('Connection failed');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const error = new Error('Non-retryable error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(
      withRetry(fn, { maxRetries: 3, initialDelay: 10 })
    ).rejects.toThrow('Non-retryable error');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
