/**
 * 구조화된 에러 타입 정의
 * 표준화된 에러 처리를 위한 커스텀 에러 클래스
 */

/**
 * 에러 코드 체계
 */
export enum ErrorCode {
  // 일반 에러 (1000-1999)
  UNKNOWN = 'UNKNOWN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',

  // 인증/인가 에러 (2000-2999)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_API_KEY = 'INVALID_API_KEY',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  API_KEY_MISSING = 'API_KEY_MISSING',

  // 입력 검증 에러 (3000-3999)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Rate Limiting 에러 (4000-4999)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // 외부 API 에러 (5000-5999)
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // 데이터베이스/스토리지 에러 (6000-6999)
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',

  // 비즈니스 로직 에러 (7000-7999)
  GENERATION_FAILED = 'GENERATION_FAILED',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  INVALID_AUDIO_FORMAT = 'INVALID_AUDIO_FORMAT',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
}

/**
 * 에러 심각도 레벨
 */
export enum ErrorSeverity {
  LOW = 'low', // 사용자 입력 오류 등 예상 가능한 에러
  MEDIUM = 'medium', // 외부 API 오류 등 일시적 에러
  HIGH = 'high', // 시스템 에러, 데이터 손실 가능성
  CRITICAL = 'critical', // 서비스 중단 수준의 에러
}

/**
 * 에러 메타데이터
 */
export interface ErrorMetadata {
  timestamp: Date;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode: number;
  [key: string]: unknown;
}

/**
 * 기본 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly metadata: ErrorMetadata;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    metadata?: Partial<ErrorMetadata>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.metadata = {
      timestamp: new Date(),
      statusCode,
      ...metadata,
    };

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

/**
 * API 에러 (외부 API 호출 실패)
 */
export class APIError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.EXTERNAL_API_ERROR,
    statusCode: number = 502,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, code, ErrorSeverity.MEDIUM, statusCode, metadata);
  }
}

/**
 * 입력 검증 에러
 */
export class ValidationError extends AppError {
  public readonly details?: string;

  constructor(
    message: string,
    details?: string,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      ErrorSeverity.LOW,
      400,
      metadata
    );
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}

/**
 * 인증 에러
 */
export class AuthenticationError extends AppError {
  constructor(message: string, metadata?: Partial<ErrorMetadata>) {
    super(message, ErrorCode.UNAUTHORIZED, ErrorSeverity.LOW, 401, metadata);
  }
}

/**
 * Rate Limit 에러
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(
    message: string,
    retryAfter: number,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(
      message,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorSeverity.LOW,
      429,
      metadata
    );
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * 스토리지 에러
 */
export class StorageError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.STORAGE_ERROR,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, code, ErrorSeverity.MEDIUM, 500, metadata);
  }
}

/**
 * 비즈니스 로직 에러
 */
export class BusinessError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 400,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, code, ErrorSeverity.LOW, statusCode, metadata);
  }
}

/**
 * 에러 타입 가드
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}
