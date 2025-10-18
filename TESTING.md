# 테스트 전략 및 커버리지 (Phase 7)

## 개요

**상태**: ✅ Phase 7 - 테스트 & 버그 수정 진행 중
**테스트 커버리지**: 50개 테스트 통과 (7개 파일)
**테스트 실행 시간**: ~2.7초 (병렬 처리)

## 테스트 구조

### 1. 단위 테스트 (Unit Tests)

#### AI 유틸리티 (lib/ai/utils)
- **retry.test.ts** (4 tests) ✅
  - 지수 백오프 알고리즘 검증
  - 최대 재시도 횟수 관리
  - 지수 증가 패턴 확인

- **rate-limiter.test.ts** (5 tests) ✅
  - Token Bucket 알고리즘
  - 토큰 대기 및 획득 로직
  - 동시성 처리

- **api-error-handling.test.ts** (11 tests) ✅ [NEW]
  - 에러 분류 및 타입 검증
  - 재시도 가능 여부 판단
  - HTTP 상태 코드 매핑
  - 에러 복구 전략
  - 로깅 컨텍스트

#### Job Queue (lib/queue)
- **job-queue.test.ts** (8 tests) ✅ [NEW]
  - Job 타입 정의 및 속성
  - 상태 전이 검증
  - 타임스탬프 추적
  - 에러 처리

### 2. UI 컴포넌트 테스트 (packages/ui)

- **Button.test.tsx** (8 tests) ✅
  - 렌더링 검증
  - 클릭 이벤트 핸들링
  - Props 변형 (variant, size)
  - Ref 포워딩
  - 접근성 (disabled 상태)

- **Input.test.tsx** (10 tests) ✅
  - 입력 렌더링
  - 라벨 및 헬퍼 텍스트
  - 에러 메시지 표시
  - 사용자 입력 처리
  - 에러 스타일링

- **Card.test.tsx** (4 tests) ✅
  - 자식 요소 렌더링
  - 패딩 크기 적용
  - Ref 포워딩
  - className 커스터마이징

## 테스트 통계

### 파일별 테스트
```
✓ lib/queue/job-queue.test.ts                           (8 tests)
✓ lib/ai/utils/__tests__/api-error-handling.test.ts     (11 tests)
✓ lib/ai/utils/__tests__/validation.test.ts            (17 tests)
✓ lib/ai/utils/__tests__/storage.test.ts               (21 tests)
✓ lib/stores/__tests__/store-patterns.test.ts          (24 tests) [NEW]
✓ lib/ai/utils/__tests__/retry.test.ts                 (4 tests)
✓ packages/ui/src/components/Button.test.tsx           (8 tests)
✓ packages/ui/src/components/Input.test.tsx            (10 tests)
✓ packages/ui/src/components/Card.test.tsx             (4 tests)
✓ lib/ai/utils/__tests__/rate-limiter.test.ts          (5 tests)

총계: 112 tests, 100% 통과율 ✅
```

### 테스트 실행 시간
- 변환: 266ms
- 설정: 766ms
- 수집: 699ms
- 테스트 실행: 1.15s
- **총 시간: 1.88초**

### 테스트별 상세 통계

| 범주 | 파일 | 테스트 수 | 내용 |
|------|------|----------|------|
| **AI 유틸리티** | 5 | 53 | Retry, Rate Limiter, 에러 처리, 검증, 저장소 |
| **Job Queue** | 1 | 8 | 상태 관리, 생명주기 |
| **상태 관리** | 1 | 24 | 스토어 패턴, 구독, 타입 안전성 |
| **UI 컴포넌트** | 3 | 22 | Button, Input, Card |
| **기타** | - | 5 | Rate Limiter 추가 |
| **합계** | **10** | **112** | **100% 통과율** |

## 테스트 인프라 개선

### 1. Vitest 설정 (vitest.config.ts)
```typescript
- 환경: jsdom (React 컴포넌트용)
- 글로벌 API: 활성화
- Setup files: @testing-library/jest-dom
- CSS 지원: 활성화
- 제외 패턴: node_modules, dist, .next, e2e
```

### 2. 테스트 실행 명령어
```bash
# 단위 테스트 실행
npm test

# 파일 변경 감지 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

## 테스트 커버리지

### 높은 커버리지 (100%)
- `packages/ui/src/components/Button.tsx`
- `packages/ui/src/components/Input.tsx`
- `packages/ui/src/components/Card.tsx`
- `lib/ai/utils/retry.ts`

### 부분 커버리지
- `lib/ai/utils/rate-limiter.ts`: 94.11% (병렬 처리 edge case)
- 유틸리티 함수: ~60%
- 타입 정의: 100%

### 커버리지 필요 영역
- API 엔드포인트 (app/api/*): 0%
- 저장소/상태 관리: 0%
- E2E 시나리오: 검증 필요

## E2E 테스트 상태

### Playwright 구성
- 테스트 디렉토리: `e2e/`
- 설정 파일: `playwright.config.ts`
- 실행 모드: 병렬 처리 (workers: 기본값)
- 스크린샷: 실패 시만 캡처

### E2E 테스트 파일
1. **art-generator.spec.ts** - 아트 생성 전체 플로우
2. **audio-generator.spec.ts** - 오디오 생성 전체 플로우
3. **media-library.spec.ts** - 미디어 라이브러리 기능

### E2E 테스트 실행
```bash
# 개발 서버 필요
npm run dev

# 다른 터미널에서
npm run test:e2e

# 헤드리스 모드
npm run test:e2e -- --headed=false
```

## 다음 단계 (Phase 7 계속)

### 즉시 작업
1. ✅ Vitest 인프라 구축
2. ✅ 단위 테스트 50개 작성 및 통과
3. ⏳ E2E 테스트 실행 및 검증
4. 📝 API 엔드포인트 통합 테스트 추가

### 우선순위 작업
1. **API 엔드포인트 테스트**
   - `/api/audio/generate`
   - `/api/art/generate`
   - `/api/art/edit`, `/api/art/compose`, `/api/art/style-transfer`

2. **저장소 테스트**
   - IndexedDB 작업
   - Zustand 스토어 상태 변경

3. **통합 테스트**
   - Job Queue + API 엔드포인트
   - UI 컴포넌트 + 스토어 연동

### Phase 7 완료 기준
- [ ] 단위 테스트: 50+ (현재 50 ✅)
- [ ] E2E 테스트: 3개 spec 모두 통과
- [ ] 커버리지: ≥80% (핵심 모듈)
- [ ] 버그 수정: 발견된 이슈 해결
- [ ] 성능: 테스트 실행 <5초

## 테스트 모범 사례

### 1. 단위 테스트 작성
```typescript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange
    const input = setupTestData();

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### 2. UI 컴포넌트 테스트
```typescript
it('should render with accessibility attributes', () => {
  render(<Button aria-label="Submit" />);
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});
```

### 3. 에러 케이스 테스트
```typescript
it('should handle errors gracefully', () => {
  expect(() => invalidOperation()).toThrow(CustomError);
});
```

## 유용한 명령어

```bash
# 특정 테스트 파일만 실행
npm test -- retry.test

# 테스트 이름으로 필터링
npm run test:watch -- --grep "Button"

# 커버리지 HTML 리포트 생성
npm run test:coverage -- --reporter=html

# 병렬 처리 비활성화 (디버깅용)
npm test -- --no-isolate

# 상세 로그 출력
npm test -- --reporter=verbose
```

## 트러블슈팅

### jsdom 환경 오류
```
ReferenceError: document is not defined
```
**해결**: vitest.config.ts에서 `environment: 'jsdom'` 확인

### E2E 테스트 시간초과
**해결**:
- 개발 서버 실행 확인 (`npm run dev`)
- Playwright 브라우저 설치 확인 (`npx playwright install`)
- 네트워크 상태 확인

### 테스트 캐시 문제
```bash
# 캐시 초기화
rm -rf .next
npm test
```

---

**마지막 업데이트**: 2025-10-18
**Phase**: 7 - 테스트 & 버그 수정
**상태**: 진행 중 ✅
