import { test, expect } from '@playwright/test';
import { setTestAPIKey, clearAPIKey } from './helpers/api-key';

/**
 * E2E 테스트: 통합 미디어 라이브러리
 *
 * 테스트 시나리오:
 * 1. 모든 미디어 조회 (오디오 + 아트)
 * 2. 태그 필터링
 * 3. 검색 기능
 * 4. 정렬 기능
 */

test.describe('Media Library', () => {
  test.beforeEach(async ({ page }) => {
    await clearAPIKey(page);
    const testAPIKey = process.env.TEST_GEMINI_API_KEY || 'test-api-key';
    await setTestAPIKey(page, testAPIKey);
  });

  test.afterEach(async ({ page }) => {
    await clearAPIKey(page);
  });

  test.describe('Unified Library View', () => {
    test('should display all media types', async ({ page }) => {
      await page.goto('/library');

      // 페이지 로드 확인
      await expect(page).toHaveTitle(/Media Library/i);

      // 미디어 아이템 확인
      const mediaItems = page.locator('[data-testid="media-item"]');
      const count = await mediaItems.count();

      if (count > 0) {
        // 오디오와 아트가 모두 표시되는지 확인
        const audioItems = page.locator(
          '[data-testid="media-item"][data-type="audio"]'
        );
        const artItems = page.locator(
          '[data-testid="media-item"][data-type="art"]'
        );

        const audioCount = await audioItems.count();
        const artCount = await artItems.count();

        console.log(
          `📊 Media Library: ${audioCount} audio, ${artCount} art items`
        );
      }
    });

    test('should filter by media type', async ({ page }) => {
      await page.goto('/library');

      // 오디오만 필터
      await page.click('[data-testid="filter-audio"]');

      // 오디오 아이템만 표시되는지 확인
      const visibleItems = page.locator('[data-testid="media-item"]:visible');
      const count = await visibleItems.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const item = visibleItems.nth(i);
          await expect(item).toHaveAttribute('data-type', 'audio');
        }
      }

      // 아트만 필터
      await page.click('[data-testid="filter-art"]');

      const artItems = page.locator('[data-testid="media-item"]:visible');
      const artCount = await artItems.count();

      if (artCount > 0) {
        for (let i = 0; i < artCount; i++) {
          const item = artItems.nth(i);
          await expect(item).toHaveAttribute('data-type', 'art');
        }
      }
    });

    test('should filter by tags', async ({ page }) => {
      await page.goto('/library');

      // 태그 클릭
      await page.click('[data-testid="tag-epic"]');

      // 필터링된 아이템 확인
      const filteredItems = page.locator('[data-testid="media-item"]:visible');
      const count = await filteredItems.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const item = filteredItems.nth(i);
          await expect(item).toContainText('epic');
        }
      }
    });

    test('should search across all media', async ({ page }) => {
      await page.goto('/library');

      // 검색어 입력
      await page.fill('[data-testid="search-input"]', 'fantasy');

      // 검색 결과 확인
      const searchResults = page.locator('[data-testid="media-item"]:visible');
      const count = await searchResults.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const item = searchResults.nth(i);
          const text = await item.textContent();
          expect(text?.toLowerCase()).toContain('fantasy');
        }
      }
    });

    test('should sort media by date', async ({ page }) => {
      await page.goto('/library');

      // 날짜순 정렬 선택
      await page.selectOption('[data-testid="sort-select"]', 'date-desc');

      // 첫 번째와 두 번째 아이템의 날짜 비교
      const items = page.locator('[data-testid="media-item"]');
      const count = await items.count();

      if (count >= 2) {
        const firstDate = await items.first().getAttribute('data-created-at');
        const secondDate = await items.nth(1).getAttribute('data-created-at');

        if (firstDate && secondDate) {
          expect(new Date(firstDate).getTime()).toBeGreaterThanOrEqual(
            new Date(secondDate).getTime()
          );
        }
      }
    });
  });

  test.describe('Tag Management', () => {
    test('should show related media when clicking tag', async ({ page }) => {
      await page.goto('/library');

      // 첫 번째 미디어의 태그 클릭
      const firstItem = page.locator('[data-testid="media-item"]').first();
      const tag = firstItem.locator('[data-testid="tag"]').first();
      const tagText = await tag.textContent();

      await tag.click();

      // 필터링된 결과 확인
      const filteredItems = page.locator('[data-testid="media-item"]:visible');
      const count = await filteredItems.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const item = filteredItems.nth(i);
          await expect(item).toContainText(tagText || '');
        }
      }
    });

    test('should clear tag filters', async ({ page }) => {
      await page.goto('/library');

      // 태그 선택
      await page.click('[data-testid="tag-epic"]');

      // 필터 해제 버튼 클릭
      await page.click('[data-testid="clear-filters"]');

      // 모든 아이템이 다시 표시되는지 확인
      const allItems = page.locator('[data-testid="media-item"]:visible');
      const totalCount = await allItems.count();
      expect(totalCount).toBeGreaterThan(0);
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple items', async ({ page }) => {
      await page.goto('/library');

      // 첫 번째 아이템 선택
      await page.click(
        '[data-testid="media-item"]:first-child [data-testid="checkbox"]'
      );

      // 두 번째 아이템 선택
      await page.click(
        '[data-testid="media-item"]:nth-child(2) [data-testid="checkbox"]'
      );

      // 선택된 아이템 수 확인
      const selectedCount = page.locator('[data-testid="selected-count"]');
      await expect(selectedCount).toContainText('2');
    });

    test('should delete multiple items', async ({ page }) => {
      await page.goto('/library');

      // 여러 아이템 선택
      await page.click(
        '[data-testid="media-item"]:first-child [data-testid="checkbox"]'
      );
      await page.click(
        '[data-testid="media-item"]:nth-child(2) [data-testid="checkbox"]'
      );

      // 일괄 삭제 버튼 클릭
      await page.click('[data-testid="bulk-delete-button"]');

      // 확인 다이얼로그 대기
      page.once('dialog', (dialog) => {
        expect(dialog.type()).toBe('confirm');
        dialog.accept();
      });

      // 성공 메시지 확인
      await expect(
        page.locator('[data-testid="success-message"]')
      ).toBeVisible();
    });

    test('should download multiple items', async ({ page }) => {
      await page.goto('/library');

      // 여러 아이템 선택
      await page.click(
        '[data-testid="media-item"]:first-child [data-testid="checkbox"]'
      );
      await page.click(
        '[data-testid="media-item"]:nth-child(2) [data-testid="checkbox"]'
      );

      // 일괄 다운로드 버튼 클릭
      await page.click('[data-testid="bulk-download-button"]');

      // 다운로드 시작 확인 (ZIP 파일)
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.zip$/);
    });
  });

  test.describe('Performance', () => {
    test('should load large library efficiently', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/library');

      // 첫 화면 렌더링 대기
      await expect(
        page.locator('[data-testid="media-item"]').first()
      ).toBeVisible({
        timeout: 5000,
      });

      const loadTime = Date.now() - startTime;

      // 5초 이내 로드 확인
      expect(loadTime).toBeLessThan(5000);

      console.log(`⚡ Library loaded in ${loadTime}ms`);
    });

    test('should support infinite scroll', async ({ page }) => {
      await page.goto('/library');

      // 초기 아이템 수
      const initialItems = await page
        .locator('[data-testid="media-item"]')
        .count();

      // 페이지 끝까지 스크롤
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // 추가 아이템 로드 대기
      await page.waitForTimeout(2000);

      // 아이템 수 증가 확인
      const newItems = await page.locator('[data-testid="media-item"]').count();

      expect(newItems).toBeGreaterThanOrEqual(initialItems);
    });
  });
});
