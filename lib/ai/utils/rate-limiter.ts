/**
 * Token Bucket 알고리즘 기반 레이트 리미터
 */

import { RateLimitError } from '../types/common';

export interface RateLimiterOptions {
  tokensPerInterval: number;
  interval: number; // milliseconds
  maxTokens?: number;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly tokensPerInterval: number;
  private readonly interval: number;
  private readonly maxTokens: number;

  constructor(options: RateLimiterOptions) {
    this.tokensPerInterval = options.tokensPerInterval;
    this.interval = options.interval;
    this.maxTokens = options.maxTokens || options.tokensPerInterval;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * 토큰 리필
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / this.interval) * this.tokensPerInterval;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * 토큰 획득 시도
   */
  async acquire(tokens: number = 1): Promise<void> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return;
    }

    // 토큰이 부족하면 대기 시간 계산
    const tokensNeeded = tokens - this.tokens;
    const waitTime = (tokensNeeded / this.tokensPerInterval) * this.interval;

    throw new RateLimitError(
      `Rate limit exceeded. Retry after ${Math.ceil(waitTime / 1000)}s`,
      Math.ceil(waitTime / 1000)
    );
  }

  /**
   * 토큰 획득 시도 (대기)
   */
  async acquireWithWait(tokens: number = 1): Promise<void> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return;
    }

    // 토큰이 부족하면 대기
    const tokensNeeded = tokens - this.tokens;
    const waitTime = (tokensNeeded / this.tokensPerInterval) * this.interval;

    await new Promise((resolve) => setTimeout(resolve, waitTime));

    this.tokens = this.maxTokens - tokens;
  }

  /**
   * 사용 가능한 토큰 수 반환
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * 리셋
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}
