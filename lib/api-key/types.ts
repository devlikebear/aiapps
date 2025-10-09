/**
 * API Key Management 타입 정의
 */

/**
 * API 제공자 타입
 */
export type ApiProvider = 'gemini';

/**
 * API 키 정보
 */
export interface ApiKeyInfo {
  provider: ApiProvider;
  key: string;
  encrypted: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date; // 향후 만료 정책 지원
}

/**
 * API 키 저장소 키
 */
export const API_KEY_STORAGE_KEY = 'aiapps_api_keys';

/**
 * API 키 검증 결과
 */
export interface ApiKeyValidationResult {
  valid: boolean;
  error?: string;
  provider?: ApiProvider;
}

/**
 * API 키 설정 상태
 */
export interface ApiKeySettings {
  keys: Record<ApiProvider, ApiKeyInfo | null>;
  lastUpdatedAt: Date;
}
