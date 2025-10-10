# E2E 테스트 가이드

이 디렉토리는 Playwright를 사용한 End-to-End (E2E) 테스트를 포함합니다.

## 📁 구조

```
e2e/
├── audio-generator.spec.ts    # 오디오 생성기 E2E 테스트
├── art-generator.spec.ts      # 아트 생성기 E2E 테스트
├── media-library.spec.ts      # 통합 미디어 라이브러리 E2E 테스트
├── helpers/
│   └── api-key.ts            # API 키 설정 헬퍼 함수
├── fixtures/                 # 테스트 픽스처 (이미지, 오디오 등)
└── README.md                 # 이 파일
```

## 🚀 테스트 실행

### 전체 테스트 실행

```bash
npm run test:e2e
```

### 특정 브라우저만 테스트

```bash
# Chromium만
npx playwright test --project=chromium

# Firefox만
npx playwright test --project=firefox

# WebKit (Safari)만
npx playwright test --project=webkit
```

### 특정 테스트 파일만 실행

```bash
# 오디오 생성기만
npx playwright test e2e/audio-generator.spec.ts

# 아트 생성기만
npx playwright test e2e/art-generator.spec.ts

# 미디어 라이브러리만
npx playwright test e2e/media-library.spec.ts
```

### UI 모드로 실행 (디버깅용)

```bash
npx playwright test --ui
```

### 헤드풀 모드로 실행 (브라우저 보기)

```bash
npx playwright test --headed
```

### 특정 테스트만 실행 (grep)

```bash
# "generation flow"를 포함하는 테스트만
npx playwright test --grep "generation flow"

# "API key"를 포함하지 않는 테스트
npx playwright test --grep-invert "API key"
```

## 🔧 설정

### 환경 변수

E2E 테스트는 `.env.test` 파일에서 환경 변수를 읽습니다:

```bash
# .env.test
TEST_GEMINI_API_KEY=your-test-api-key-here
BASE_URL=http://localhost:3000
NODE_ENV=test
```

**주의**: `.env.test` 파일은 Git에 커밋되지 않습니다. 실제 API 키는 절대 커밋하지 마세요!

### Playwright 설정

`playwright.config.ts` 파일에서 다음을 설정할 수 있습니다:

- 테스트 타임아웃
- 브라우저 프로젝트 (Chromium, Firefox, WebKit)
- 스크린샷 및 비디오 녹화 옵션
- 개발 서버 자동 시작

## 📝 테스트 작성 가이드

### 기본 구조

```typescript
import { test, expect } from '@playwright/test';
import { setTestAPIKey, clearAPIKey } from './helpers/api-key';

test.describe('Feature Name', () => {
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

  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page).toHaveTitle(/Expected Title/);
    // ... 테스트 로직
  });
});
```

### 헬퍼 함수 사용

```typescript
// API 키 설정
await setTestAPIKey(page, 'your-api-key');

// API 키 제거
await clearAPIKey(page);

// API 키 확인
const hasKey = await hasAPIKey(page);

// Settings 페이지에서 API 키 입력
await setAPIKeyViaSettings(page, 'your-api-key');
```

### data-testid 사용

UI 요소는 `data-testid` 속성을 사용하여 선택합니다:

```typescript
// 버튼 클릭
await page.click('[data-testid="generate-button"]');

// 입력 필드
await page.fill('[data-testid="prompt-input"]', 'test prompt');

// 선택 박스
await page.selectOption('[data-testid="genre-select"]', 'orchestral');

// 체크박스
await page.check('[data-testid="checkbox"]');
```

## 🎯 테스트 시나리오

### 오디오 생성기 (`audio-generator.spec.ts`)

1. **생성 플로우**
   - API 키 설정 → 프롬프트 입력 → 생성 → 다운로드
   - 에러 처리 (빈 프롬프트, API 키 없음)
   - 종횡비 선택

2. **라이브러리**
   - 생성된 오디오 표시
   - 태그 필터링
   - 삭제
   - 검색

3. **크로스 브라우저**
   - Chrome, Firefox, Safari 호환성

### 아트 생성기 (`art-generator.spec.ts`)

1. **생성 플로우**
   - API 키 설정 → 프롬프트 입력 → 생성 → 다운로드
   - 에러 처리
   - 종횡비 선택

2. **갤러리**
   - 생성된 아트 표시
   - 태그 필터링
   - 삭제
   - 검색
   - 이미지 프리뷰

3. **고급 기능**
   - 이미지 편집
   - 스타일 전이

4. **크로스 브라우저**
   - Chrome, Firefox, Safari 호환성

### 통합 미디어 라이브러리 (`media-library.spec.ts`)

1. **통합 뷰**
   - 모든 미디어 타입 표시 (오디오 + 아트)
   - 미디어 타입별 필터링
   - 태그 필터링
   - 검색
   - 정렬

2. **태그 관리**
   - 관련 미디어 표시
   - 필터 해제

3. **일괄 작업**
   - 여러 아이템 선택
   - 일괄 삭제
   - 일괄 다운로드

4. **성능**
   - 대용량 라이브러리 로드
   - 무한 스크롤

## 🐛 디버깅

### 실패한 테스트 디버깅

1. **스크린샷 확인**

   테스트 실패 시 자동으로 스크린샷이 `test-results/` 디렉토리에 저장됩니다.

2. **비디오 확인**

   실패한 테스트의 비디오가 `test-results/` 디렉토리에 저장됩니다.

3. **트레이스 뷰어**

   ```bash
   npx playwright show-trace test-results/.../trace.zip
   ```

4. **디버그 모드**

   ```bash
   # 디버거와 함께 실행
   npx playwright test --debug

   # 특정 테스트만 디버그
   npx playwright test e2e/audio-generator.spec.ts --debug
   ```

### Playwright Inspector

```bash
# Inspector 실행
npx playwright test --debug

# 특정 브라우저에서 Inspector 실행
npx playwright test --project=chromium --debug
```

## 📊 테스트 리포트

### HTML 리포트

```bash
# 테스트 실행 후 자동으로 리포트 생성
npm run test:e2e

# 리포트 열기
npx playwright show-report
```

### CI/CD 리포트

GitHub Actions에서는 자동으로 GitHub 리포터를 사용합니다.

## ✅ 체크리스트

- [ ] 모든 E2E 테스트 통과
- [ ] 크로스 브라우저 테스트 통과 (Chrome, Firefox, Safari)
- [ ] API 키 없이 실행 시 적절한 에러 메시지
- [ ] 실패한 테스트의 스크린샷/비디오 확인
- [ ] 테스트 커버리지: 주요 사용자 플로우 커버

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
