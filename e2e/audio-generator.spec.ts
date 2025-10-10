import { test, expect } from '@playwright/test';
import { setTestAPIKey, clearAPIKey } from './helpers/api-key';

/**
 * E2E 테스트: 오디오 생성기
 *
 * 테스트 시나리오:
 * 1. API 키 설정 → 프롬프트 입력 → 생성 → 다운로드
 * 2. 라이브러리 조회, 필터링, 삭제
 */

test.describe('Audio Generator', () => {
  // 각 테스트 전에 API 키 설정
  test.beforeEach(async ({ page }) => {
    await clearAPIKey(page);
    // 테스트용 API 키 (실제 프로덕션에서는 환경 변수로 관리)
    const testAPIKey = process.env.TEST_GEMINI_API_KEY || 'test-api-key';
    await setTestAPIKey(page, testAPIKey);
  });

  // 각 테스트 후 API 키 정리
  test.afterEach(async ({ page }) => {
    await clearAPIKey(page);
  });

  test.describe('Audio Generation Flow', () => {
    test('should complete full audio generation flow', async ({ page }) => {
      // 1. 오디오 생성기 페이지 이동
      await page.goto('/apps/audio-generator');
      await expect(page).toHaveTitle(/Audio Generator/i);

      // 2. 프롬프트 빌더 섹션 확인
      await expect(
        page.getByRole('heading', { name: /프롬프트 빌더/i })
      ).toBeVisible();

      // 3. 장르 선택
      await page.selectOption('[data-testid="genre-select"]', 'orchestral');

      // 4. 분위기 선택
      await page.selectOption('[data-testid="mood-select"]', 'epic');

      // 5. BPM 설정 (120)
      await page.fill('[data-testid="bpm-input"]', '120');

      // 6. 악기 선택 (최소 1개)
      await page.click('[data-testid="instrument-strings"]');
      await page.click('[data-testid="instrument-brass"]');

      // 7. 길이 설정 (30초)
      await page.fill('[data-testid="duration-input"]', '30');

      // 8. 프롬프트 미리보기 확인
      const promptPreview = page.locator('[data-testid="prompt-preview"]');
      await expect(promptPreview).toBeVisible();
      await expect(promptPreview).toContainText('orchestral');
      await expect(promptPreview).toContainText('epic');

      // 9. 생성 버튼 클릭
      await page.click('[data-testid="generate-button"]');

      // 10. 로딩 상태 확인
      await expect(
        page.locator('[data-testid="loading-spinner"]')
      ).toBeVisible();

      // 11. 생성 완료 대기 (최대 60초)
      await expect(page.locator('[data-testid="audio-player"]')).toBeVisible({
        timeout: 60000,
      });

      // 12. 오디오 플레이어 UI 확인
      await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="download-button"]')
      ).toBeVisible();

      // 13. 재생 버튼 클릭 (오디오 재생 테스트)
      await page.click('[data-testid="play-button"]');
      await page.waitForTimeout(2000); // 2초 재생

      // 14. 일시정지 버튼 확인
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // 15. 다운로드 버튼 클릭
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-button"]');
      const download = await downloadPromise;

      // 16. 다운로드 파일명 확인 (.wav)
      expect(download.suggestedFilename()).toMatch(/\.wav$/);
    });

    test('should show error for invalid prompt', async ({ page }) => {
      await page.goto('/apps/audio-generator');

      // 빈 프롬프트로 생성 시도
      await page.click('[data-testid="generate-button"]');

      // 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        /required/i
      );
    });

    test('should show API key error when not set', async ({ page }) => {
      // API 키 제거
      await clearAPIKey(page);

      await page.goto('/apps/audio-generator');
      await page.click('[data-testid="generate-button"]');

      // API 키 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        /API key/i
      );
    });
  });

  test.describe('Audio Library', () => {
    test('should display generated audio in library', async ({ page }) => {
      // 먼저 오디오 생성 (간단한 프롬프트)
      await page.goto('/apps/audio-generator');
      await page.selectOption('[data-testid="genre-select"]', 'ambient');
      await page.fill('[data-testid="duration-input"]', '10');
      await page.click('[data-testid="generate-button"]');

      // 생성 완료 대기
      await expect(page.locator('[data-testid="audio-player"]')).toBeVisible({
        timeout: 60000,
      });

      // 라이브러리 탭으로 이동
      await page.click('[data-testid="library-tab"]');

      // 라이브러리 아이템 확인
      await expect(
        page.locator('[data-testid="library-item"]').first()
      ).toBeVisible();

      // 아이템 메타데이터 확인
      const libraryItem = page.locator('[data-testid="library-item"]').first();
      await expect(libraryItem).toContainText('ambient');
      await expect(libraryItem).toContainText('10'); // 길이 (초)
    });

    test('should filter library by tags', async ({ page }) => {
      await page.goto('/apps/audio-generator');

      // 라이브러리 탭으로 이동
      await page.click('[data-testid="library-tab"]');

      // 태그 필터 선택
      await page.click('[data-testid="tag-filter-bgm"]');

      // 필터링된 아이템만 표시되는지 확인
      const libraryItems = page.locator('[data-testid="library-item"]');
      const count = await libraryItems.count();

      if (count > 0) {
        // 모든 아이템이 BGM 태그를 가지고 있는지 확인
        for (let i = 0; i < count; i++) {
          const item = libraryItems.nth(i);
          await expect(item).toContainText('bgm');
        }
      }
    });

    test('should delete audio from library', async ({ page }) => {
      await page.goto('/apps/audio-generator');

      // 라이브러리 탭으로 이동
      await page.click('[data-testid="library-tab"]');

      // 첫 번째 아이템 삭제
      const firstItem = page.locator('[data-testid="library-item"]').first();
      const itemText = await firstItem.textContent();

      // 삭제 버튼 클릭
      await firstItem.locator('[data-testid="delete-button"]').click();

      // 확인 다이얼로그 대기
      page.once('dialog', (dialog) => {
        expect(dialog.type()).toBe('confirm');
        dialog.accept();
      });

      // 아이템이 사라졌는지 확인
      await expect(
        page.locator('[data-testid="library-item"]')
      ).not.toContainText(itemText || '');
    });

    test('should search library by prompt', async ({ page }) => {
      await page.goto('/apps/audio-generator');

      // 라이브러리 탭으로 이동
      await page.click('[data-testid="library-tab"]');

      // 검색어 입력
      await page.fill('[data-testid="search-input"]', 'epic');

      // 검색 결과 확인
      const searchResults = page.locator('[data-testid="library-item"]');
      const count = await searchResults.count();

      if (count > 0) {
        // 모든 결과가 "epic"을 포함하는지 확인
        for (let i = 0; i < count; i++) {
          const item = searchResults.nth(i);
          const text = await item.textContent();
          expect(text?.toLowerCase()).toContain('epic');
        }
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work on different browsers', async ({ page, browserName }) => {
      await page.goto('/apps/audio-generator');

      // 페이지 로드 확인
      await expect(page).toHaveTitle(/Audio Generator/i);

      // 주요 UI 요소 확인
      await expect(
        page.getByRole('heading', { name: /프롬프트 빌더/i })
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="generate-button"]')
      ).toBeVisible();

      console.log(`✅ Audio Generator works on ${browserName}`);
    });
  });
});
