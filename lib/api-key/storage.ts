/**
 * API Key Storage
 * localStorage를 사용한 클라이언트 사이드 API 키 관리
 */

import type { ApiProvider, ApiKeyInfo, ApiKeySettings } from './types';
import { API_KEY_STORAGE_KEY } from './types';

/**
 * 간단한 Base64 인코딩 (기본 난독화)
 * 주의: 실제 보안을 위해서는 crypto-js 등의 라이브러리 사용 필요
 */
function simpleEncode(text: string): string {
  if (typeof window === 'undefined') return text;
  return btoa(encodeURIComponent(text));
}

function simpleDecode(encoded: string): string {
  if (typeof window === 'undefined') return encoded;
  return decodeURIComponent(atob(encoded));
}

/**
 * localStorage에서 API 키 설정 로드
 */
export function loadApiKeySettings(): ApiKeySettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!stored) return null;

    const decoded = simpleDecode(stored);
    const parsed = JSON.parse(decoded);

    // Date 객체 복원
    return {
      ...parsed,
      lastUpdatedAt: new Date(parsed.lastUpdatedAt),
      keys: Object.fromEntries(
        Object.entries(parsed.keys as Record<string, ApiKeyInfo | null>).map(
          ([provider, keyInfo]) => [
            provider,
            keyInfo
              ? {
                  ...keyInfo,
                  createdAt: new Date(keyInfo.createdAt),
                  lastUsedAt: keyInfo.lastUsedAt
                    ? new Date(keyInfo.lastUsedAt)
                    : undefined,
                  expiresAt: keyInfo.expiresAt
                    ? new Date(keyInfo.expiresAt)
                    : undefined,
                }
              : null,
          ]
        )
      ),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load API key settings:', error);
    return null;
  }
}

/**
 * localStorage에 API 키 설정 저장
 */
export function saveApiKeySettings(settings: ApiKeySettings): void {
  if (typeof window === 'undefined') return;

  try {
    const json = JSON.stringify(settings);
    const encoded = simpleEncode(json);
    localStorage.setItem(API_KEY_STORAGE_KEY, encoded);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save API key settings:', error);
    throw error;
  }
}

/**
 * 특정 제공자의 API 키 저장
 */
export function saveApiKey(provider: ApiProvider, key: string): void {
  const settings = loadApiKeySettings() || {
    keys: { gemini: null },
    lastUpdatedAt: new Date(),
  };

  const keyInfo: ApiKeyInfo = {
    provider,
    key: simpleEncode(key), // 난독화하여 저장
    encrypted: true,
    createdAt: new Date(),
  };

  settings.keys[provider] = keyInfo;
  settings.lastUpdatedAt = new Date();

  saveApiKeySettings(settings);
}

/**
 * 특정 제공자의 API 키 로드
 */
export function loadApiKey(provider: ApiProvider): string | null {
  const settings = loadApiKeySettings();
  if (!settings) return null;

  const keyInfo = settings.keys[provider];
  if (!keyInfo) return null;

  try {
    // 복호화
    const key = keyInfo.encrypted ? simpleDecode(keyInfo.key) : keyInfo.key;

    // 마지막 사용 시간 업데이트
    keyInfo.lastUsedAt = new Date();
    settings.lastUpdatedAt = new Date();
    saveApiKeySettings(settings);

    return key;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load API key:', error);
    return null;
  }
}

/**
 * 특정 제공자의 API 키 삭제
 */
export function deleteApiKey(provider: ApiProvider): void {
  const settings = loadApiKeySettings();
  if (!settings) return;

  settings.keys[provider] = null;
  settings.lastUpdatedAt = new Date();

  saveApiKeySettings(settings);
}

/**
 * 모든 API 키 삭제
 */
export function clearAllApiKeys(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * API 키 존재 여부 확인
 */
export function hasApiKey(provider: ApiProvider): boolean {
  const key = loadApiKey(provider);
  return key !== null && key.length > 0;
}

/**
 * sessionStorage에 평문 API 키 캐시 (선택적)
 */
const SESSION_KEY_PREFIX = 'aiapps_session_key_';

export function cacheApiKeyInSession(provider: ApiProvider, key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${provider}`, key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to cache API key in session:', error);
  }
}

export function getApiKeyFromSession(provider: ApiProvider): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${provider}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get API key from session:', error);
    return null;
  }
}

export function clearSessionCache(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(SESSION_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear session cache:', error);
  }
}

/**
 * API 키 가져오기 (sessionStorage 캐시 → localStorage)
 */
export function getApiKey(provider: ApiProvider): string | null {
  // 1. sessionStorage 캐시 확인
  const sessionKey = getApiKeyFromSession(provider);
  if (sessionKey) return sessionKey;

  // 2. localStorage에서 로드
  const key = loadApiKey(provider);
  if (key) {
    // sessionStorage에 캐시
    cacheApiKeyInSession(provider, key);
    return key;
  }

  return null;
}
