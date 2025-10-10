/**
 * API 키 유효성 검증 유틸리티
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: string;
}

/**
 * Gemini API 키 형식 검증
 * 형식: AIza로 시작하는 39자 영숫자 문자열
 */
export function validateGeminiApiKeyFormat(apiKey: string): ValidationResult {
  if (!apiKey || typeof apiKey !== 'string') {
    return {
      valid: false,
      error: 'API key is required',
      details: 'API key must be a non-empty string',
    };
  }

  // 공백 제거
  const trimmedKey = apiKey.trim();

  // 최소 길이 검증 (Gemini API 키는 일반적으로 39자)
  if (trimmedKey.length < 20) {
    return {
      valid: false,
      error: 'Invalid API key format',
      details: 'API key is too short',
    };
  }

  // Gemini API 키 형식: AIza로 시작
  if (!trimmedKey.startsWith('AIza')) {
    return {
      valid: false,
      error: 'Invalid API key format',
      details: 'Gemini API key must start with "AIza"',
    };
  }

  // 영숫자, 하이픈, 언더스코어만 허용
  const validPattern = /^[A-Za-z0-9_-]+$/;
  if (!validPattern.test(trimmedKey)) {
    return {
      valid: false,
      error: 'Invalid API key format',
      details: 'API key contains invalid characters',
    };
  }

  return {
    valid: true,
  };
}

/**
 * API 키 활성 상태 검증 (실제 API 호출)
 * Gemini API에 간단한 요청을 보내서 키가 유효한지 확인
 */
export async function validateGeminiApiKeyActive(
  apiKey: string
): Promise<ValidationResult> {
  try {
    // 형식 검증 먼저 수행
    const formatValidation = validateGeminiApiKeyFormat(apiKey);
    if (!formatValidation.valid) {
      return formatValidation;
    }

    // 간단한 모델 목록 조회 API 호출로 키 유효성 검증
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        return {
          valid: false,
          error: 'Invalid or inactive API key',
          details: errorData.error?.message || 'API key authentication failed',
        };
      }

      if (response.status === 429) {
        return {
          valid: false,
          error: 'API quota exceeded',
          details: 'Your API key has exceeded its quota',
        };
      }

      return {
        valid: false,
        error: 'API key validation failed',
        details: errorData.error?.message || `HTTP ${response.status}`,
      };
    }

    return {
      valid: true,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'API key validation error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * API 키 보안 강화 유틸리티
 */

/**
 * API 키 마스킹 (로깅 등에서 사용)
 * 예: AIzaSyABC...XYZ (앞 10자 + ... + 뒤 3자)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 15) {
    return '***';
  }

  const start = apiKey.substring(0, 10);
  const end = apiKey.substring(apiKey.length - 3);
  return `${start}...${end}`;
}

/**
 * API 키 sanitization (XSS 방지)
 */
export function sanitizeApiKey(apiKey: string): string {
  if (!apiKey || typeof apiKey !== 'string') {
    return '';
  }

  // HTML 태그 제거 및 특수 문자 이스케이프
  return apiKey
    .trim()
    .replace(/[<>\"']/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
