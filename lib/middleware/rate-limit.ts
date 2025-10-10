/**
 * Rate Limiting 미들웨어
 * Token Bucket 알고리즘을 사용한 요청 제한
 */

interface RateLimitConfig {
  /**
   * 시간 윈도우 (밀리초)
   * @default 60000 (1분)
   */
  windowMs: number;

  /**
   * 윈도우 당 최대 요청 수
   * @default 10
   */
  maxRequests: number;

  /**
   * 식별자 추출 함수 (IP 주소 또는 사용자 ID)
   */
  keyGenerator?: (request: Request) => string;

  /**
   * Rate limit 초과 시 응답 메시지
   */
  message?: string;

  /**
   * Skip 조건 (특정 요청은 rate limit 검사 제외)
   */
  skip?: (request: Request) => boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs || 60000,
      maxRequests: config.maxRequests || 10,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      message: config.message || 'Too many requests, please try again later.',
      skip: config.skip || (() => false),
    };

    // 주기적으로 만료된 항목 정리 (메모리 누수 방지)
    setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  private defaultKeyGenerator(request: Request): string {
    // Vercel은 x-forwarded-for 헤더에 실제 IP 주소 제공
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    return ip;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  async check(request: Request): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    // Skip 조건 확인
    if (this.config.skip(request)) {
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: Date.now() + this.config.windowMs,
      };
    }

    const key = this.config.keyGenerator(request);
    const now = Date.now();
    let entry = this.store.get(key);

    // 첫 요청이거나 윈도우가 만료된 경우
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.store.set(key, entry);

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: entry.resetTime,
      };
    }

    // 요청 횟수 증가
    entry.count++;

    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      reset: entry.resetTime,
    };
  }

  getMessage(): string {
    return this.config.message;
  }
}

/**
 * Rate Limiting 미들웨어 생성
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * API 라우트에서 사용할 Rate Limit 체커
 */
export async function checkRateLimit(
  request: Request,
  limiter: RateLimiter
): Promise<Response | null> {
  const result = await limiter.check(request);

  // Rate limit 초과
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: limiter.getMessage(),
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil(
            (result.reset - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  // 허용 - Response 헤더에 rate limit 정보 추가할 수 있도록 null 반환
  return null;
}

/**
 * 사전 정의된 Rate Limiters
 */
export const rateLimiters = {
  // 일반 API 엔드포인트 (분당 10회)
  api: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'API rate limit exceeded. Please try again in a minute.',
  }),

  // AI 생성 엔드포인트 (분당 3회)
  generation: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 3,
    message:
      'Generation rate limit exceeded. Please wait before creating more content.',
  }),

  // 설정 변경 (분당 5회)
  settings: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Settings update rate limit exceeded. Please try again later.',
  }),
};
