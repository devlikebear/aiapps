/**
 * 에러 핸들러 유틸리티
 * 에러를 사용자 친화적 메시지로 변환하고 로깅
 */

import { NextResponse } from 'next/server';
import {
  AppError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  isValidationError,
  isRateLimitError,
} from './types';
import { logger } from '../ai/utils/logger';

/**
 * 사용자 친화적 에러 메시지 매핑
 */
const ERROR_MESSAGES: Record<ErrorCode, { ko: string; en: string }> = {
  [ErrorCode.UNKNOWN]: {
    ko: '알 수 없는 오류가 발생했습니다.',
    en: 'An unknown error occurred.',
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    ko: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'Internal server error. Please try again later.',
  },
  [ErrorCode.NOT_FOUND]: {
    ko: '요청하신 리소스를 찾을 수 없습니다.',
    en: 'The requested resource was not found.',
  },
  [ErrorCode.METHOD_NOT_ALLOWED]: {
    ko: '허용되지 않은 요청 방식입니다.',
    en: 'Method not allowed.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    ko: '인증이 필요합니다.',
    en: 'Authentication required.',
  },
  [ErrorCode.FORBIDDEN]: {
    ko: '접근 권한이 없습니다.',
    en: 'Access forbidden.',
  },
  [ErrorCode.INVALID_API_KEY]: {
    ko: 'API 키가 유효하지 않습니다. 설정에서 올바른 API 키를 입력해주세요.',
    en: 'Invalid API key. Please enter a valid API key in settings.',
  },
  [ErrorCode.API_KEY_EXPIRED]: {
    ko: 'API 키가 만료되었습니다. 새로운 키를 등록해주세요.',
    en: 'API key has expired. Please register a new key.',
  },
  [ErrorCode.API_KEY_MISSING]: {
    ko: 'API 키가 설정되지 않았습니다. 설정 페이지에서 Gemini API 키를 등록해주세요.',
    en: 'API key is missing. Please register your Gemini API key in settings.',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    ko: '입력값이 올바르지 않습니다.',
    en: 'Invalid input.',
  },
  [ErrorCode.INVALID_INPUT]: {
    ko: '잘못된 입력입니다.',
    en: 'Invalid input.',
  },
  [ErrorCode.MISSING_REQUIRED_FIELD]: {
    ko: '필수 입력 항목이 누락되었습니다.',
    en: 'Required field is missing.',
  },
  [ErrorCode.INVALID_FORMAT]: {
    ko: '입력 형식이 올바르지 않습니다.',
    en: 'Invalid format.',
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    ko: '요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
    en: 'Rate limit exceeded. Please try again later.',
  },
  [ErrorCode.QUOTA_EXCEEDED]: {
    ko: 'API 할당량을 초과했습니다.',
    en: 'API quota exceeded.',
  },
  [ErrorCode.EXTERNAL_API_ERROR]: {
    ko: '외부 API 오류가 발생했습니다.',
    en: 'External API error occurred.',
  },
  [ErrorCode.GEMINI_API_ERROR]: {
    ko: 'Gemini API 오류가 발생했습니다. API 키를 확인해주세요.',
    en: 'Gemini API error. Please check your API key.',
  },
  [ErrorCode.NETWORK_ERROR]: {
    ko: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
    en: 'Network error. Please check your internet connection.',
  },
  [ErrorCode.TIMEOUT]: {
    ko: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    en: 'Request timeout. Please try again.',
  },
  [ErrorCode.DATABASE_ERROR]: {
    ko: '데이터베이스 오류가 발생했습니다.',
    en: 'Database error occurred.',
  },
  [ErrorCode.STORAGE_ERROR]: {
    ko: '저장소 오류가 발생했습니다.',
    en: 'Storage error occurred.',
  },
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: {
    ko: '저장 공간이 부족합니다. 불필요한 파일을 삭제해주세요.',
    en: 'Storage quota exceeded. Please delete unnecessary files.',
  },
  [ErrorCode.GENERATION_FAILED]: {
    ko: '생성에 실패했습니다. 다시 시도해주세요.',
    en: 'Generation failed. Please try again.',
  },
  [ErrorCode.CONVERSION_FAILED]: {
    ko: '변환에 실패했습니다.',
    en: 'Conversion failed.',
  },
  [ErrorCode.INVALID_AUDIO_FORMAT]: {
    ko: '지원하지 않는 오디오 형식입니다.',
    en: 'Unsupported audio format.',
  },
  [ErrorCode.INVALID_IMAGE_FORMAT]: {
    ko: '지원하지 않는 이미지 형식입니다.',
    en: 'Unsupported image format.',
  },
};

/**
 * 사용자 친화적 에러 메시지 가져오기
 */
export function getFriendlyErrorMessage(
  code: ErrorCode,
  lang: 'ko' | 'en' = 'ko'
): string {
  return (
    ERROR_MESSAGES[code]?.[lang] || ERROR_MESSAGES[ErrorCode.UNKNOWN][lang]
  );
}

/**
 * 에러 로깅
 */
export function logError(
  error: Error | AppError,
  context?: Record<string, unknown>
) {
  if (isAppError(error)) {
    const logLevel = getLogLevel(error.severity);
    const logMessage = {
      message: error.message,
      code: error.code,
      severity: error.severity,
      statusCode: error.statusCode,
      metadata: error.metadata,
      context,
      stack: error.stack,
    };

    switch (logLevel) {
      case 'error':
        logger.error(JSON.stringify(logMessage));
        break;
      case 'warn':
        logger.warn(JSON.stringify(logMessage));
        break;
      default:
        logger.info(JSON.stringify(logMessage));
    }
  } else {
    // 일반 Error 객체
    logger.error(
      JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack,
        context,
      })
    );
  }
}

/**
 * 에러 심각도에 따른 로그 레벨 결정
 */
function getLogLevel(severity: ErrorSeverity): 'info' | 'warn' | 'error' {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'info';
    case ErrorSeverity.MEDIUM:
      return 'warn';
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      return 'error';
    default:
      return 'error';
  }
}

/**
 * API 라우트용 에러 핸들러
 * NextResponse로 변환하여 반환
 */
export function handleAPIError(
  error: unknown,
  lang: 'ko' | 'en' = 'ko'
): NextResponse {
  // AppError 처리
  if (isAppError(error)) {
    logError(error);

    const response: {
      error: string;
      code: string;
      message: string;
      details?: string;
      retryAfter?: number;
    } = {
      error: getFriendlyErrorMessage(error.code, lang),
      code: error.code,
      message: error.message,
    };

    // ValidationError 추가 정보
    if (isValidationError(error) && error.details) {
      response.details = error.details;
    }

    // RateLimitError 추가 정보
    if (isRateLimitError(error)) {
      response.retryAfter = error.retryAfter;
    }

    return NextResponse.json(response, {
      status: error.statusCode,
      headers: isRateLimitError(error)
        ? {
            'Retry-After': error.retryAfter.toString(),
          }
        : {},
    });
  }

  // 일반 Error 처리
  if (error instanceof Error) {
    logError(error);

    return NextResponse.json(
      {
        error: getFriendlyErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, lang),
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }

  // 알 수 없는 에러
  logger.error(JSON.stringify({ error: 'Unknown error type', value: error }));

  return NextResponse.json(
    {
      error: getFriendlyErrorMessage(ErrorCode.UNKNOWN, lang),
      code: ErrorCode.UNKNOWN,
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * 클라이언트용 에러 메시지 포매터
 */
export function formatClientError(
  error: unknown,
  lang: 'ko' | 'en' = 'ko'
): {
  title: string;
  message: string;
  action?: string;
} {
  if (isAppError(error)) {
    return {
      title: '오류',
      message: getFriendlyErrorMessage(error.code, lang),
      action: getErrorAction(error.code, lang),
    };
  }

  if (error instanceof Error) {
    return {
      title: '오류',
      message: getFriendlyErrorMessage(ErrorCode.UNKNOWN, lang),
    };
  }

  return {
    title: '오류',
    message: getFriendlyErrorMessage(ErrorCode.UNKNOWN, lang),
  };
}

/**
 * 에러 코드별 권장 액션
 */
function getErrorAction(
  code: ErrorCode,
  lang: 'ko' | 'en'
): string | undefined {
  const actions: Partial<Record<ErrorCode, { ko: string; en: string }>> = {
    [ErrorCode.INVALID_API_KEY]: {
      ko: '설정 페이지에서 API 키를 확인해주세요.',
      en: 'Please check your API key in settings.',
    },
    [ErrorCode.API_KEY_MISSING]: {
      ko: '설정 페이지로 이동하여 API 키를 등록해주세요.',
      en: 'Go to settings and register your API key.',
    },
    [ErrorCode.RATE_LIMIT_EXCEEDED]: {
      ko: '잠시 후 다시 시도해주세요.',
      en: 'Please try again later.',
    },
    [ErrorCode.STORAGE_QUOTA_EXCEEDED]: {
      ko: '라이브러리에서 불필요한 파일을 삭제해주세요.',
      en: 'Please delete unnecessary files from your library.',
    },
  };

  return actions[code]?.[lang];
}
