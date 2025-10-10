import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* 병렬 테스트 실행 */
  fullyParallel: true,

  /* CI에서만 실패 시 재시도 */
  retries: process.env.CI ? 2 : 0,

  /* CI에서는 병렬 처리 비활성화 */
  workers: process.env.CI ? 1 : undefined,

  /* 테스트 리포터 */
  reporter: process.env.CI ? 'github' : 'html',

  /* 모든 테스트에 공통 설정 */
  use: {
    /* Base URL */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* 실패 시 스크린샷 캡처 */
    screenshot: 'only-on-failure',

    /* 실패 시 비디오 녹화 */
    video: 'retain-on-failure',

    /* 트레이스 수집 (디버깅용) */
    trace: 'on-first-retry',

    /* 타임아웃 설정 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 테스트 프로젝트 설정 (크로스 브라우저) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 모바일 브라우저 테스트 (선택 사항) */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* 개발 서버 자동 시작 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
