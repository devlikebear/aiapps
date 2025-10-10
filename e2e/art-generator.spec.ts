import { test, expect } from '@playwright/test';
import { setTestAPIKey, clearAPIKey } from './helpers/api-key';

/**
 * E2E 테스트: 아트 생성기
 *
 * 테스트 시나리오:
 * 1. API 키 설정 → 프롬프트 입력 → 생성 → 다운로드
 * 2. 갤러리 조회, 필터링, 삭제
 */

test.describe('Art Generator', () => {
  // 각 테스트 전에 API 키 설정
  test.beforeEach(async ({ page }) => {
    await clearAPIKey(page);
    const testAPIKey = process.env.TEST_GEMINI_API_KEY || 'test-api-key';
    await setTestAPIKey(page, testAPIKey);
  });

  // 각 테스트 후 API 키 정리
  test.afterEach(async ({ page }) => {
    await clearAPIKey(page);
  });

  test.describe('Art Generation Flow', () => {
    test('should complete full art generation flow', async ({ page }) => {
      // 1. 아트 생성기 페이지 이동
      await page.goto('/apps/art-generator');
      await expect(page).toHaveTitle(/Art Generator/i);

      // 2. 프롬프트 빌더 섹션 확인
      await expect(
        page.getByRole('heading', { name: /프롬프트 빌더/i })
      ).toBeVisible();

      // 3. 아트 스타일 선택
      await page.selectOption('[data-testid="style-select"]', 'pixel-art');

      // 4. 주제 선택
      await page.selectOption('[data-testid="subject-select"]', 'character');

      // 5. 색상 팔레트 선택
      await page.selectOption('[data-testid="palette-select"]', 'vibrant');

      // 6. 종횡비 선택 (1:1)
      await page.click('[data-testid="aspect-ratio-1-1"]');

      // 7. 프롬프트 입력
      await page.fill(
        '[data-testid="prompt-input"]',
        '2D pixel art fantasy warrior character'
      );

      // 8. 프롬프트 미리보기 확인
      const promptPreview = page.locator('[data-testid="prompt-preview"]');
      await expect(promptPreview).toBeVisible();
      await expect(promptPreview).toContainText('pixel-art');
      await expect(promptPreview).toContainText('character');

      // 9. 생성 버튼 클릭
      await page.click('[data-testid="generate-button"]');

      // 10. 로딩 상태 확인
      await expect(
        page.locator('[data-testid="loading-spinner"]')
      ).toBeVisible();

      // 11. 생성 완료 대기 (최대 60초)
      await expect(page.locator('[data-testid="generated-image"]')).toBeVisible(
        {
          timeout: 60000,
        }
      );

      // 12. 이미지 UI 확인
      const generatedImage = page.locator('[data-testid="generated-image"]');
      await expect(generatedImage).toHaveAttribute('src', /.+/);

      // 13. 다운로드 버튼 확인
      await expect(
        page.locator('[data-testid="download-button"]')
      ).toBeVisible();

      // 14. 다운로드 버튼 클릭
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-button"]');
      const download = await downloadPromise;

      // 15. 다운로드 파일명 확인 (.png)
      expect(download.suggestedFilename()).toMatch(/\.png$/);

      // 16. 편집 버튼 확인
      await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();
    });

    test('should show error for invalid prompt', async ({ page }) => {
      await page.goto('/apps/art-generator');

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

      await page.goto('/apps/art-generator');
      await page.fill('[data-testid="prompt-input"]', 'test prompt');
      await page.click('[data-testid="generate-button"]');

      // API 키 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        /API key/i
      );
    });

    test('should support different aspect ratios', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 종횡비 옵션 확인
      await expect(
        page.locator('[data-testid="aspect-ratio-1-1"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="aspect-ratio-16-9"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="aspect-ratio-9-16"]')
      ).toBeVisible();

      // 16:9 선택
      await page.click('[data-testid="aspect-ratio-16-9"]');

      // 선택된 상태 확인
      await expect(
        page.locator('[data-testid="aspect-ratio-16-9"]')
      ).toHaveClass(/selected|active/);
    });
  });

  test.describe('Gallery Management', () => {
    test('should display generated art in gallery', async ({ page }) => {
      // 먼저 아트 생성 (간단한 프롬프트)
      await page.goto('/apps/art-generator');
      await page.fill('[data-testid="prompt-input"]', '2D fantasy landscape');
      await page.click('[data-testid="generate-button"]');

      // 생성 완료 대기
      await expect(page.locator('[data-testid="generated-image"]')).toBeVisible(
        {
          timeout: 60000,
        }
      );

      // 갤러리 탭으로 이동
      await page.click('[data-testid="gallery-tab"]');

      // 갤러리 아이템 확인
      await expect(
        page.locator('[data-testid="gallery-item"]').first()
      ).toBeVisible();

      // 아이템 메타데이터 확인
      const galleryItem = page.locator('[data-testid="gallery-item"]').first();
      await expect(galleryItem).toContainText('fantasy');
    });

    test('should filter gallery by tags', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 갤러리 탭으로 이동
      await page.click('[data-testid="gallery-tab"]');

      // 태그 필터 선택
      await page.click('[data-testid="tag-filter-character"]');

      // 필터링된 아이템만 표시되는지 확인
      const galleryItems = page.locator('[data-testid="gallery-item"]');
      const count = await galleryItems.count();

      if (count > 0) {
        // 모든 아이템이 character 태그를 가지고 있는지 확인
        for (let i = 0; i < count; i++) {
          const item = galleryItems.nth(i);
          await expect(item).toContainText('character');
        }
      }
    });

    test('should delete art from gallery', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 갤러리 탭으로 이동
      await page.click('[data-testid="gallery-tab"]');

      // 첫 번째 아이템 삭제
      const firstItem = page.locator('[data-testid="gallery-item"]').first();

      // 삭제 버튼 클릭
      await firstItem.locator('[data-testid="delete-button"]').click();

      // 확인 다이얼로그 대기
      page.once('dialog', (dialog) => {
        expect(dialog.type()).toBe('confirm');
        dialog.accept();
      });

      // 삭제 성공 메시지 확인
      await expect(
        page.locator('[data-testid="success-message"]')
      ).toBeVisible();
    });

    test('should search gallery by prompt', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 갤러리 탭으로 이동
      await page.click('[data-testid="gallery-tab"]');

      // 검색어 입력
      await page.fill('[data-testid="search-input"]', 'fantasy');

      // 검색 결과 확인
      const searchResults = page.locator('[data-testid="gallery-item"]');
      const count = await searchResults.count();

      if (count > 0) {
        // 모든 결과가 "fantasy"를 포함하는지 확인
        for (let i = 0; i < count; i++) {
          const item = searchResults.nth(i);
          const text = await item.textContent();
          expect(text?.toLowerCase()).toContain('fantasy');
        }
      }
    });

    test('should show image preview on hover', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 갤러리 탭으로 이동
      await page.click('[data-testid="gallery-tab"]');

      // 첫 번째 아이템에 호버
      const firstItem = page.locator('[data-testid="gallery-item"]').first();
      await firstItem.hover();

      // 프리뷰 모달 확인
      await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
    });
  });

  test.describe('Advanced Features', () => {
    test('should support image editing', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 갤러리 탭으로 이동
      await page.click('[data-testid="gallery-tab"]');

      // 첫 번째 아이템 편집
      const firstItem = page.locator('[data-testid="gallery-item"]').first();
      await firstItem.locator('[data-testid="edit-button"]').click();

      // 편집 모드 확인
      await expect(page.locator('[data-testid="edit-mode"]')).toBeVisible();

      // 편집 프롬프트 입력
      await page.fill(
        '[data-testid="edit-prompt-input"]',
        'Add a dragon in the background'
      );

      // 편집 적용 버튼 클릭
      await page.click('[data-testid="apply-edit-button"]');

      // 편집 완료 대기
      await expect(page.locator('[data-testid="generated-image"]')).toBeVisible(
        {
          timeout: 60000,
        }
      );
    });

    test('should support style transfer', async ({ page }) => {
      await page.goto('/apps/art-generator');

      // 스타일 전이 탭으로 이동
      await page.click('[data-testid="style-transfer-tab"]');

      // 베이스 이미지 업로드
      const baseImageInput = page.locator('[data-testid="base-image-input"]');
      await baseImageInput.setInputFiles('./e2e/fixtures/test-image.png');

      // 스타일 이미지 업로드
      const styleImageInput = page.locator('[data-testid="style-image-input"]');
      await styleImageInput.setInputFiles('./e2e/fixtures/style-image.png');

      // 전이 버튼 클릭
      await page.click('[data-testid="transfer-button"]');

      // 전이 완료 대기
      await expect(page.locator('[data-testid="generated-image"]')).toBeVisible(
        {
          timeout: 60000,
        }
      );
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work on different browsers', async ({ page, browserName }) => {
      await page.goto('/apps/art-generator');

      // 페이지 로드 확인
      await expect(page).toHaveTitle(/Art Generator/i);

      // 주요 UI 요소 확인
      await expect(
        page.getByRole('heading', { name: /프롬프트 빌더/i })
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="generate-button"]')
      ).toBeVisible();

      console.log(`✅ Art Generator works on ${browserName}`);
    });
  });
});
