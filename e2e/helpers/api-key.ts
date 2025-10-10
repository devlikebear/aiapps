import { Page } from '@playwright/test';

/**
 * E2E 테스트용 API 키 설정 헬퍼
 */

/**
 * localStorage에 암호화된 API 키 설정
 * 실제 암호화 로직을 우회하고 테스트용 API 키를 직접 설정
 */
export async function setTestAPIKey(page: Page, apiKey: string) {
  await page.evaluate(
    ({ key }) => {
      // 테스트용 디바이스 지문 설정
      localStorage.setItem('device_fingerprint', 'test-fingerprint-12345');

      // 테스트용 암호화된 API 키 설정
      // 실제로는 AES-256-GCM으로 암호화되지만, 테스트에서는 간단히 Base64 인코딩
      const encoded = btoa(key);
      localStorage.setItem('gemini_api_key_encrypted', encoded);
    },
    { key: apiKey }
  );
}

/**
 * localStorage에서 API 키 제거
 */
export async function clearAPIKey(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('gemini_api_key_encrypted');
    localStorage.removeItem('device_fingerprint');
  });
}

/**
 * API 키가 설정되어 있는지 확인
 */
export async function hasAPIKey(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return localStorage.getItem('gemini_api_key_encrypted') !== null;
  });
}

/**
 * Settings 페이지에서 API 키 입력
 */
export async function setAPIKeyViaSettings(page: Page, apiKey: string) {
  await page.goto('/settings');
  await page.waitForSelector('[data-testid="api-key-input"]', {
    timeout: 10000,
  });

  // API 키 입력
  await page.fill('[data-testid="api-key-input"]', apiKey);

  // 저장 버튼 클릭
  await page.click('[data-testid="save-api-key-button"]');

  // 성공 메시지 대기
  await page.waitForSelector('[data-testid="success-message"]', {
    timeout: 5000,
  });
}
