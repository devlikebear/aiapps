# AI 앱 로드맵

## 프로젝트 목표

- Vercel에 배포 가능한 Next.js 15+ 기반 AI 도구 허브를 구축한다.
- Gemini 계열 API(Lyria, 2.5 Flash Image)를 활용해 멀티모달 생성 기능을 제공한다.
- 단일 Next.js 프로젝트에서 여러 AI 앱을 호스팅하는 갤러리 형태로 구성한다.

## 프로젝트 구조 (변경됨)

- **아키텍처**: 단일 Next.js 15 프로젝트 (모노레포 구조 폐기)
- **앱 구조**: `/apps/[app-name]` 패턴으로 여러 AI 도구 호스팅
- **공유 라이브러리**: `lib/` 디렉토리에 AI SDK, 유틸리티, 타입 정의
- **스타일링**: Tailwind CSS v3 (PostCSS)
- **상태 관리**: Zustand
- **환경 변수**: `.env.local` (로컬), Vercel 환경 변수 (프로덕션)

## 아키텍처 개요

- **클라이언트**: Next.js App Router, React Server Components, Tailwind UI, Zustand 상태 관리
- **서버**: Next.js Route Handler로 API 레이어 구성
- **AI 통합**: `lib/ai/` 디렉토리에 Gemini API 클라이언트 구현
- **스토리지**: 클라이언트 메모리 및 Blob URL (프로토타입), 향후 Vercel Blob 또는 Supabase
- **관측 가능성**: Vercel Analytics와 커스텀 로깅

## 공통 마일스톤
1. 저장소 부트스트랩: Next.js 15 템플릿, Tailwind v3 설정, Vitest/Playwright 중심의 린트·테스트 도구 구성.
2. 공유 SDK 스켈레톤 구축: 타입 정의, 공급자 클라이언트, 테스트용 모킹 구현.
3. 배포 파이프라인: 앱별 Vercel 프로젝트, 프리뷰 환경, CI 검사(린트, 테스트, 타입 체킹) 자동화.
4. 문서화: README, 기여 가이드, 작업 방식과 맞는 PR 템플릿 업데이트.

## 앱 1 · AI 게임 오디오 생성기
- **목표 산출물**: BGM 루프, 짧은 효과음 클립, WAV/MP3 다운로드 지원.
- **AI 모델**: Gemini Lyria RealTime (실시간 스트리밍 음악 생성)
  - WebSocket 기반 실시간 생성
  - 16-bit PCM, 48kHz, 스테레오
  - BPM(60-200), Density(0-1), Brightness(0-1) 제어
  - 악기 전용 (보컬 미지원)
  - 프롬프트 가중치 및 설정 파라미터 커스터마이징
- **v1 기능**
  - 장르·무드·BPM·악기·밝기·밀도 등 템플릿 기반 프롬프트 빌더.
  - 실시간 프롬프트 검증과 예상 토큰 비용 표시.
  - 생성 작업 오케스트레이션: WebSocket 연결, 실시간 스트리밍, 진행률 표시.
  - 태깅 가능한 에셋 라이브러리와 HTML5 오디오 플레이어 프리뷰.
  - 오디오 버퍼링 및 실시간 재생 지원.
- **구현 단계**
  1. 프롬프트 스키마(가중치, BPM, density, brightness, scale)와 작업 오케스트레이션 실패 테스트 작성.
  2. Gemini Lyria WebSocket 기반 `/api/audio` Route Handler 구현 및 대체 경로 마련.
  3. 실시간 스트리밍 UI와 서스펜스/로딩 상태 포함 클라이언트 페이지(`/audio/create`, `/audio/library`) 연결.
  4. PCM 오디오 후처리(노멀라이징, 루프 처리, WAV/MP3 변환) 백그라운드 작업 추가.
  5. Playwright 시나리오: WebSocket 연결 → 실시간 생성 → 에셋 수신 → 다운로드 흐름 검증.

## 앱 2 · AI 2D 게임 아트 생성기
- **목표 산출물**: 2D 픽셀 아트, 2D 컨셉 아트, PNG 파일, 스프라이트 시트.
- **AI 모델**: Gemini 2.5 Flash Image (텍스트→이미지 생성)
  - 텍스트 기반 이미지 생성
  - 이미지 편집 및 수정
  - 다중 이미지 합성 (최대 3개)
  - 스타일 전이 (Style Transfer)
  - 종횡비 제어 (1:1 ~ 21:9)
  - 고품질 텍스트 렌더링
  - SynthID 워터마크 자동 삽입
  - 지원 언어: EN, es-MX, ja-JP, zh-CN, hi-IN
- **v1 기능**
  - 스타일 프리셋·해상도·종횡비·팔레트 제약 제공 캔버스형 프롬프트 UI.
  - 반복 작업을 위한 시드 제어와 배치 생성.
  - 이미지 편집 모드: 기존 이미지 수정, 다중 이미지 합성, 스타일 전이.
  - 자동 스프라이트 시트 조립과 메타데이터(프레임 크기, 애니메이션 힌트) 생성.
  - 갤러리 비교 슬라이더, 프롬프트별 버전 히스토리.
  - 반복 개선(Iterative Refinement) 워크플로우.
- **구현 단계**
  1. 프롬프트 프리셋, 종횡비 설정, 스프라이트 시트 조립기, API 클라이언트 모킹 실패 테스트 추가.
  2. Gemini 2.5 Flash Image 엔드포인트 활용 `/api/art` Route Handler 구현 (생성/편집/합성/스타일전이).
  3. 반응형 Tailwind UI 클라이언트 페이지(`/art/create`, `/art/edit`, `/art/gallery`) 작성.
  4. 투명 처리, 팔레트 축소, 스프라이트 시트 자동 조립 등 후처리 유틸 통합.
  5. Playwright 플로우: 배치 생성 → 이미지 편집 → 갤러리 검토 → 스프라이트 시트 번들 다운로드.

## 공통 고려 사항
- Tailwind 설정과 Storybook을 포함한 공유 UI 키트(`packages/ui`) 구축, 필요 시 Chromatic 시각 회귀 도입.
- 미들웨어 기반 레이트 리밋과 오남용 방지를 구현(IP 제한, 사용자별 쿼터 등).
- 두 앱에서 공통으로 수집할 분석 이벤트 정의(프롬프트 사용량, 생성 성공/실패).
- 사용자 피드백 수집 루프 운영: 평가, 오류 보고, 개선 백로그로 연결.

## 즉각적 다음 단계
1. 프로젝트 구조(단일 Next.js 워크스페이스 vs. 이중 앱) 확정 및 스캐폴딩 생성.
2. Tailwind v3 + 테스트 하네스 설정 후 `chore:` 커밋 메시지로 베이스라인 커밋.
3. UI 개발을 막는 요소가 없도록 모킹된 응답을 가진 AI SDK 프로토타입 작성.
4. 오디오 프롬프트 1차 흐름을 위한 실패 테스트부터 마련.

## Phase 0: 프로젝트 초기화 및 환경 설정 (1-2일)

### 목표
- Next.js 15+ 모노레포 구조 구축
- 개발 환경 및 도구 설정
- CI/CD 파이프라인 기본 구성

### 작업 항목
1. **저장소 구조 설정**
   - [ ] Next.js 15 프로젝트 초기화
   - [ ] 모노레포 구조 구성 (`apps/`, `packages/`)
   - [ ] TypeScript 설정 (`tsconfig.json`)
   - [ ] `.gitignore` 설정

2. **스타일링 도구 설정**
   - [ ] Tailwind CSS v3 설치 및 PostCSS 구성
   - [ ] 공통 스타일 변수 및 테마 정의
   - [ ] Tailwind 플러그인 설정 (forms, typography 등)

3. **테스트 환경 구축**
   - [ ] Vitest 설치 및 설정 (단위/통합 테스트)
   - [ ] Playwright 설치 및 설정 (E2E 테스트)
   - [ ] 테스트 커버리지 도구 설정

4. **린팅 및 코드 품질**
   - [ ] ESLint 설정 (Next.js 15 규칙)
   - [ ] Prettier 설정 및 ESLint 통합
   - [ ] Husky + lint-staged 설정 (pre-commit hooks)

5. **환경 변수 관리**
   - [ ] `.env.local.example` 템플릿 생성
   - [ ] Vercel 환경 변수 플레이스홀더 준비
   - [ ] 환경 변수 타입 정의 (`env.d.ts`)

6. **문서화 기본 구조**
   - [ ] README.md 작성 (프로젝트 개요, 설치 방법)
   - [ ] CONTRIBUTING.md 작성 (기여 가이드)
   - [ ] PR 템플릿 생성

### 완료 기준
- [x] `npm run dev` 실행 시 Next.js 앱 정상 구동
- [x] `npm run lint` 오류 없음
- [x] `npm run test` 실행 가능 (테스트 없어도 실행됨)
- [x] Git hooks 정상 작동

---

## Phase 1: 공유 AI SDK 구축 (2-3일)

### 목표
- Gemini API (Lyria, 2.5 Flash Image) 통합을 위한 공유 SDK 구축
- 타입 안전성, 재시도, 레이트 리밋, 모킹 지원

### 작업 항목
1. **SDK 패키지 초기화**
   - [ ] `packages/ai-sdk` 디렉토리 생성
   - [ ] package.json 설정 (dependencies, exports)
   - [ ] TypeScript 설정

2. **타입 정의**
   - [ ] Gemini Lyria 요청/응답 타입 (`LyriaRequest`, `LyriaResponse`)
   - [ ] Gemini Image 요청/응답 타입 (`ImageRequest`, `ImageResponse`)
   - [ ] 공통 에러 타입 (`AIError`, `RateLimitError`)
   - [ ] 설정 타입 (`SDKConfig`)

3. **Gemini Lyria 클라이언트 구현**
   - [ ] WebSocket 연결 관리 클래스
   - [ ] 실시간 스트리밍 핸들러
   - [ ] BPM, Density, Brightness 파라미터 지원
   - [ ] 재연결 로직 및 에러 핸들링
   - [ ] PCM 오디오 버퍼 처리

4. **Gemini Image 클라이언트 구현**
   - [ ] 텍스트→이미지 생성 API 래퍼
   - [ ] 이미지 편집 API 래퍼
   - [ ] 다중 이미지 합성 API 래퍼
   - [ ] 스타일 전이 API 래퍼
   - [ ] 종횡비 및 해상도 설정 지원

5. **공통 기능**
   - [ ] 레이트 리밋 미들웨어 (Token Bucket 알고리즘)
   - [ ] 재시도 로직 (Exponential Backoff)
   - [ ] 구조화된 응답 파싱
   - [ ] 로깅 및 관측 가능성 (요청 ID, 지연 시간)

6. **테스트 및 모킹**
   - [ ] 각 클라이언트에 대한 단위 테스트 (Vitest)
   - [ ] 모킹 유틸리티 (`mockLyriaClient`, `mockImageClient`)
   - [ ] 통합 테스트 (실제 API 호출 옵션)

### 완료 기준
- [x] SDK 패키지 독립적으로 빌드 가능 (`npm run build`)
- [x] 모든 단위 테스트 통과 (커버리지 ≥80%)
- [x] 타입 체킹 오류 없음
- [x] 모킹 유틸리티를 사용한 예제 코드 작동

---

## Phase 2: 앱 1 - AI 게임 오디오 생성기 ✅ (완료)

### 목표
- Gemini Lyria를 활용한 실시간 음악 생성 애플리케이션 구축
- 게임 장르별 프리셋, BGM/SFX 생성, 다운로드 및 변환

### 완료된 작업

#### 2.1 백엔드 API 구현 ✅

1. **타입 정의 및 프리셋**
   - [x] `lib/audio/types.ts`: 오디오 타입, 게임 장르, 포맷 정의
   - [x] 5가지 게임 프리셋: RPG, FPS, Puzzle, Racing, Retro/8-bit
   - [x] BPM, Density, Brightness 파라미터 자동 적용

2. **Route Handler: `/api/audio/generate`**
   - [x] POST 엔드포인트 구현
   - [x] Gemini Lyria 통합 (LyriaClient)
   - [x] 프롬프트 템플릿 자동 적용
   - [x] PCM → WAV 변환
   - [x] Base64 인코딩 응답
   - [x] 에러 핸들링

3. **Route Handler: `/api/audio/convert`**
   - [x] POST 엔드포인트 (포맷 변환)
   - [x] 다중 포맷 지원 (WAV, MP3, OGG, FLAC)
   - [x] 압축 및 최적화 옵션

4. **오디오 변환 유틸리티 (`lib/audio/converter.ts`)**
   - [x] PCM → WAV 변환
   - [x] 오디오 정규화 (볼륨 조정)
   - [x] 무음 제거 (트리밍)
   - [x] 페이드 인/아웃
   - [x] 샘플레이트 리샘플링
   - [x] 스테레오 → 모노 변환
   - [x] 메타데이터 추출
   - [x] 다운로드 기능

#### 2.2 프론트엔드 UI 구현 ✅

1. **페이지: `/apps/audio-generator` (홈)**
   - [x] 2단계 선택 UI (BGM/SFX → 게임 장르)
   - [x] 5가지 게임 프리셋 카드
   - [x] 프리셋 정보 표시 (BPM, 밀도, 밝기)
   - [x] 인터랙티브 선택 애니메이션

2. **페이지: `/apps/audio-generator/create`**
   - [x] 프롬프트 입력 폼
   - [x] 길이 슬라이더 (BGM: 30초~5분, SFX: 1~10초)
   - [x] BPM 슬라이더 (프리셋 기본값 기반)
   - [x] 프리셋 정보 표시
   - [x] 생성 버튼 및 진행 상태
   - [x] Suspense 로딩 fallback
   - [x] 에러 표시

3. **오디오 플레이어 컴포넌트 (`components/audio/AudioPlayer.tsx`)**
   - [x] 전체 재생 컨트롤 (재생, 일시정지, 정지)
   - [x] 진행 바 및 시크 기능
   - [x] 볼륨 조절 및 음소거
   - [x] 반복 재생 토글
   - [x] 시간 표시 (현재/전체)
   - [x] 메타데이터 표시 (BPM, 키, 크기)

4. **상태 관리 (`lib/stores/audio-store.ts`)**
   - [x] Zustand 스토어 설정
   - [x] 생성 요청 상태 관리
   - [x] 플레이어 상태 관리
   - [x] 오디오 히스토리 관리 (최근 10개)
   - [x] Blob URL 자동 생성 및 정리

5. **다운로드 기능**
   - [x] 4가지 포맷: WAV (무손실), MP3 (범용), OGG (오픈), FLAC (압축)
   - [x] WAV 직접 다운로드
   - [x] API 기반 포맷 변환

#### 2.3 품질 검증 ✅
- [x] TypeScript strict mode 통과
- [x] ESLint 경고 없음
- [x] Build 성공
- [x] Next.js 15 Suspense 호환

### 남은 작업 (향후)
- [ ] `/apps/audio-generator/library` 페이지 (에셋 라이브러리)
- [ ] Gemini Lyria API 실제 연동 (API Key 필요)
- [ ] Playwright E2E 테스트
- [ ] 접근성 테스트

---

## Phase 3: 앱 2 - AI 2D 게임 아트 생성기 (5-7일)

### 목표
- Gemini 2.5 Flash Image를 활용한 2D 게임 아트 생성 애플리케이션
- 픽셀 아트, 컨셉 아트 생성, 편집, 합성, 스타일 전이, 스프라이트 시트 조립

### 작업 항목

#### 3.1 백엔드 API 구현 (2-3일)
1. **프롬프트 스키마 및 검증**
   - [ ] Zod 스키마 정의 (`ArtPromptSchema`)
     - 스타일 프리셋, 해상도, 종횡비, 팔레트, 시드
   - [ ] 프롬프트 검증 로직
   - [ ] 토큰 비용 추정 유틸리티
   - [ ] 실패 테스트 작성 (Vitest)

2. **Route Handler: `/api/art/generate`**
   - [ ] POST 엔드포인트 구현
   - [ ] Gemini Image API 호출 (텍스트→이미지)
   - [ ] 배치 생성 지원 (시드 제어)
   - [ ] 이미지 저장 (Vercel Blob 또는 Supabase)
   - [ ] 에러 핸들링 및 로깅
   - [ ] 통합 테스트 작성

3. **Route Handler: `/api/art/edit`**
   - [ ] POST 엔드포인트 (이미지 편집)
   - [ ] 입력 이미지 업로드 처리
   - [ ] Gemini Image Edit API 호출
   - [ ] 편집 결과 저장

4. **Route Handler: `/api/art/compose`**
   - [ ] POST 엔드포인트 (다중 이미지 합성)
   - [ ] 최대 3개 이미지 업로드 처리
   - [ ] Gemini Image Compose API 호출

5. **Route Handler: `/api/art/style-transfer`**
   - [ ] POST 엔드포인트 (스타일 전이)
   - [ ] 베이스 이미지 + 스타일 이미지 업로드
   - [ ] Gemini Style Transfer API 호출

6. **Route Handler: `/api/art/gallery`**
   - [ ] GET 엔드포인트 (갤러리 목록)
   - [ ] POST 엔드포인트 (메타데이터 저장)
   - [ ] DELETE 엔드포인트 (이미지 삭제)
   - [ ] 프롬프트별 버전 히스토리 관리

7. **후처리 유틸리티**
   - [ ] 투명 배경 처리 (PNG 알파 채널)
   - [ ] 팔레트 축소 (색상 수 제한)
   - [ ] 스프라이트 시트 자동 조립
     - 여러 이미지를 그리드로 배치
     - 메타데이터 생성 (프레임 크기, 위치, 애니메이션 힌트)
   - [ ] 이미지 최적화 (압축)

#### 3.2 프론트엔드 UI 구현 (2-3일)
1. **페이지: `/art/create`**
   - [ ] 프롬프트 빌더 UI
     - 텍스트 프롬프트 입력 (다국어 지원 힌트)
     - 스타일 프리셋 선택 (픽셀 아트, 컨셉 아트, 카툰 등)
     - 해상도 선택 (256x256, 512x512, 1024x1024)
     - 종횡비 선택 (1:1, 16:9, 4:3 등)
     - 팔레트 제약 (색상 수 제한 체크박스)
     - 시드 입력 (반복 생성용)
     - 배치 생성 수량 입력
   - [ ] 실시간 프롬프트 미리보기
   - [ ] 토큰 비용 표시
   - [ ] 생성 버튼 및 로딩 상태
   - [ ] 생성 결과 표시 (이미지 그리드)

2. **페이지: `/art/edit`**
   - [ ] 이미지 업로드 컴포넌트
   - [ ] 편집 프롬프트 입력
   - [ ] 편집 모드 선택 (수정, 합성, 스타일 전이)
   - [ ] 합성 모드: 다중 이미지 업로드 (최대 3개)
   - [ ] 스타일 전이 모드: 베이스 + 스타일 이미지 업로드
   - [ ] 편집 결과 표시 및 다운로드

3. **페이지: `/art/gallery`**
   - [ ] 갤러리 그리드 레이아웃 (반응형)
   - [ ] 이미지 메타데이터 표시
   - [ ] 비교 슬라이더 (Before/After)
   - [ ] 프롬프트별 버전 히스토리 탐색
   - [ ] 스프라이트 시트 번들 다운로드 버튼
   - [ ] 삭제 기능

4. **상태 관리**
   - [ ] Zustand 스토어 설정 (`artStore`)
   - [ ] 생성/편집 작업 상태 관리
   - [ ] 갤러리 이미지 목록 관리

5. **공통 컴포넌트**
   - [ ] 이미지 업로드 드래그 앤 드롭
   - [ ] 이미지 미리보기 모달
   - [ ] 비교 슬라이더 컴포넌트

#### 3.3 테스트 및 검증 (1일)
- [ ] Playwright E2E 테스트
  - 프롬프트 입력 → 배치 생성
  - 생성된 이미지 갤러리 확인
  - 이미지 편집 플로우 (업로드 → 편집 → 결과 확인)
  - 다중 이미지 합성 플로우
  - 스타일 전이 플로우
  - 스프라이트 시트 다운로드
- [ ] 접근성 테스트
- [ ] 반응형 테스트

### 완료 기준
- [x] `/art/create`에서 프롬프트 입력 후 이미지 생성 성공
- [x] 배치 생성 및 시드 제어 정상 작동
- [x] `/art/edit`에서 이미지 편집, 합성, 스타일 전이 성공
- [x] `/art/gallery`에서 생성된 이미지 확인 및 버전 히스토리 탐색 가능
- [x] 스프라이트 시트 자동 조립 및 다운로드 정상 작동
- [x] 모든 E2E 테스트 통과

---

## Phase 4: 공통 UI 키트 및 품질 개선 (2-3일)

### 목표
- 두 앱에서 공유하는 UI 컴포넌트 라이브러리 구축
- 디자인 시스템 일관성 확보
- 코드 품질 및 접근성 개선

### 작업 항목

1. **공유 UI 컴포넌트 라이브러리 (`components/ui`)**
   - [ ] 공통 컴포넌트 디렉토리 구성
   - [ ] Tailwind 설정 활용
   - [ ] 공통 컴포넌트 작성
     - Button (Primary, Secondary, Danger)
     - Input (Text, Number, Slider)
     - Select (Dropdown, Multi-select)
     - Modal (Confirm, Alert)
     - Toast (Success, Error, Info)
     - Card (이미지, 오디오 에셋)
     - Spinner (로딩)
   - [ ] Storybook 설정 (선택 사항)
   - [ ] 컴포넌트 단위 테스트 (Vitest + Testing Library)

2. **디자인 시스템 정의**
   - [ ] 색상 팔레트 (Primary, Secondary, Accent, Neutral)
   - [ ] 타이포그래피 (Font Family, Sizes, Weights)
   - [ ] 간격 및 레이아웃 (Spacing Scale)
   - [ ] 그림자 및 보더 (Shadows, Border Radius)
   - [ ] 애니메이션 (Transitions, Keyframes)

3. **접근성 개선**
   - [ ] ARIA 레이블 추가
   - [ ] 키보드 네비게이션 지원
   - [ ] 포커스 스타일 개선
   - [ ] 색상 대비 검증 (WCAG AA 이상)
   - [ ] 스크린 리더 테스트

4. **코드 품질 개선**
   - [ ] ESLint 규칙 강화 (a11y 플러그인)
   - [ ] 타입 커버리지 향상 (TypeScript strict mode)
   - [ ] 코드 리뷰 체크리스트 작성
   - [ ] 성능 최적화 (이미지 지연 로딩, 코드 스플리팅)

### 완료 기준

- [ ] `components/ui` 공통 컴포넌트 라이브러리 구축
- [ ] 두 앱에서 공유 컴포넌트 사용 가능
- [x] 모든 공통 컴포넌트 단위 테스트 통과
- [x] 접근성 검사 도구 (axe, Lighthouse) 점수 90 이상

---

## Phase 5: 보안, 레이트 리밋, 관측 가능성 (2-3일)

### 목표
- API 보안 강화 (레이트 리밋, 인증)
- 오남용 방지
- 관측 가능성 및 모니터링 구축

### 작업 항목
1. **레이트 리밋 구현**
   - [ ] 미들웨어 기반 레이트 리밋 (`middleware.ts`)
   - [ ] IP 기반 제한 (예: 100 req/hour)
   - [ ] 사용자별 쿼터 관리 (로그인 시)
   - [ ] Redis 또는 Vercel KV 활용 (분산 환경)
   - [ ] 레이트 리밋 초과 시 429 응답 및 Retry-After 헤더

2. **인증 (선택 사항)**
   - [ ] NextAuth.js 설정 (Google, GitHub 등)
   - [ ] 세션 관리
   - [ ] 사용자별 에셋 격리

3. **오남용 방지**
   - [ ] 프롬프트 길이 제한
   - [ ] 배치 생성 수량 제한
   - [ ] 업로드 파일 크기 제한
   - [ ] CAPTCHA 통합 (높은 트래픽 시)

4. **관측 가능성**
   - [ ] Vercel Analytics 통합
   - [ ] 커스텀 로깅 미들웨어
     - 요청 ID 생성 및 전파
     - 지연 시간 추적
     - 에러 로깅 (Sentry 또는 LogRocket)
   - [ ] 분석 이벤트 정의
     - 프롬프트 사용량
     - 생성 성공/실패율
     - 평균 생성 시간
     - 다운로드 횟수

5. **모니터링 대시보드**
   - [ ] Vercel Dashboard 설정
   - [ ] 커스텀 대시보드 (선택 사항, Grafana)
   - [ ] 알림 설정 (에러율, 응답 시간)

### 완료 기준
- [x] 레이트 리밋 정상 작동 (Playwright 테스트)
- [x] 오남용 방지 메커니즘 검증
- [x] 로그 및 분석 이벤트 수집 확인
- [x] 모니터링 대시보드 접근 가능

---

## Phase 6: 배포 및 프로덕션 준비 (2-3일)

### 목표
- Vercel 배포 파이프라인 구축
- 프로덕션 환경 최적화
- 문서화 완료

### 작업 항목
1. **Vercel 프로젝트 설정**
   - [ ] 앱 1 (오디오 생성기) Vercel 프로젝트 생성
   - [ ] 앱 2 (아트 생성기) Vercel 프로젝트 생성
   - [ ] 환경 변수 설정 (Gemini API Key 등)
   - [ ] 커스텀 도메인 연결 (선택 사항)

2. **CI/CD 파이프라인**
   - [ ] GitHub Actions 워크플로우 생성
     - Lint 검사
     - 타입 체킹
     - 단위 테스트
     - E2E 테스트 (Playwright)
   - [ ] PR 머지 시 자동 배포 (main 브랜치)
   - [ ] 프리뷰 환경 자동 생성 (PR별)

3. **프로덕션 최적화**
   - [ ] 이미지 최적화 (Next.js Image 컴포넌트)
   - [ ] 코드 스플리팅 및 지연 로딩
   - [ ] 번들 크기 분석 (`@next/bundle-analyzer`)
   - [ ] 성능 프로파일링 (Lighthouse)
   - [ ] 캐싱 전략 (CDN, 브라우저 캐시)

4. **보안 강화**
   - [ ] 환경 변수 검증 (런타임)
   - [ ] HTTPS 강제 (Vercel 기본)
   - [ ] CSP (Content Security Policy) 헤더 설정
   - [ ] CORS 설정

5. **문서화**
   - [ ] README.md 업데이트 (배포 방법, 환경 변수)
   - [ ] API 문서 작성 (OpenAPI/Swagger 선택 사항)
   - [ ] 사용자 가이드 작성
   - [ ] 트러블슈팅 가이드

6. **사용자 피드백 루프**
   - [ ] 피드백 폼 추가 (각 앱 하단)
   - [ ] 오류 보고 기능 (Sentry 통합)
   - [ ] 개선 백로그 관리 (GitHub Issues)

### 완료 기준
- [x] 두 앱 모두 Vercel에 배포 성공
- [x] CI/CD 파이프라인 정상 작동
- [x] Lighthouse 성능 점수 90 이상
- [x] 모든 문서화 완료
- [x] 피드백 수집 메커니즘 작동

---

## Phase 7: 테스트 및 버그 수정 (1-2일)

### 목표
- 프로덕션 환경 테스트
- 버그 수정 및 품질 개선

### 작업 항목
1. **프로덕션 환경 테스트**
   - [ ] 실제 사용자 시나리오 테스트
   - [ ] 크로스 브라우저 테스트 (Chrome, Firefox, Safari, Edge)
   - [ ] 모바일 디바이스 테스트 (iOS, Android)
   - [ ] 네트워크 속도 시뮬레이션 (3G, 4G)

2. **버그 수정**
   - [ ] 발견된 버그 우선순위 분류
   - [ ] Critical/High 우선순위 버그 수정
   - [ ] 회귀 테스트 작성

3. **성능 개선**
   - [ ] 병목 지점 식별 및 최적화
   - [ ] 캐싱 전략 개선
   - [ ] API 응답 시간 단축

4. **사용자 경험 개선**
   - [ ] 에러 메시지 명확화
   - [ ] 로딩 상태 개선
   - [ ] 툴팁 및 도움말 추가

### 완료 기준
- [x] 모든 Critical/High 우선순위 버그 수정
- [x] 크로스 브라우저 테스트 통과
- [x] 모바일 테스트 통과
- [x] 성능 목표 달성 (Lighthouse 90+)

---

## Phase 8: 론칭 및 모니터링 (진행 중)

### 목표
- 공식 론칭
- 지속적인 모니터링 및 개선

### 작업 항목
1. **론칭 준비**
   - [ ] 최종 체크리스트 검증
   - [ ] 백업 및 롤백 계획 수립
   - [ ] 론칭 공지 준비

2. **모니터링**
   - [ ] 실시간 트래픽 모니터링
   - [ ] 에러율 추적
   - [ ] 사용자 피드백 수집

3. **지속적 개선**
   - [ ] 사용자 피드백 기반 기능 개선
   - [ ] A/B 테스팅 (선택 사항)
   - [ ] 새로운 기능 백로그 관리

### 완료 기준
- [x] 앱 정상 운영 중
- [x] 모니터링 시스템 정상 작동
- [x] 피드백 루프 운영 중

---

## 타임라인 요약

| Phase | 작업 내용 | 예상 기간 | 상태 |
|-------|----------|----------|------|
| Phase 0 | 프로젝트 초기화 | 1-2일 | ✅ 완료 |
| Phase 1 | 공유 AI SDK 구축 | 2-3일 | ✅ 완료 |
| Phase 2 | 앱 1 - 오디오 생성기 | 5-7일 | ✅ 완료 (Gemini API 연동 대기) |
| Phase 3 | 앱 2 - 아트 생성기 | 5-7일 | 🔄 진행 예정 |
| Phase 4 | 공통 UI 키트 | 2-3일 | 📋 계획 중 |
| Phase 5 | 보안/관측 가능성 | 2-3일 | 📋 계획 중 |
| Phase 6 | 배포 및 프로덕션 | 2-3일 | 📋 계획 중 |
| Phase 7 | 테스트/버그 수정 | 1-2일 | 📋 계획 중 |
| Phase 8 | 론칭 및 모니터링 | 진행 중 | 📋 계획 중 |

**현재 진행 상황**: Phase 2 완료, Phase 3 준비 중

**주요 완료 항목**:

- ✅ Next.js 15 프로젝트 구조 완성
- ✅ Tailwind CSS 설정 완료
- ✅ AI SDK 기본 구조 (타입 정의 및 유틸리티)
- ✅ 오디오 생성기 전체 UI 및 로직 구현
- ✅ GitHub Issue-based 개발 워크플로우 적용

**다음 단계**: Phase 3 (AI 2D 게임 아트 생성기) 시작

---

## 다음 즉각 실행 단계

### 현재 완료된 작업 (Phase 0-2) ✅

- Next.js 15 프로젝트 구조 완성
- Tailwind CSS v3 설정 완료
- AI SDK 기본 구조 완성
- 오디오 생성기 전체 기능 구현

### 다음 작업: Phase 3 시작 (AI 2D 게임 아트 생성기)

1. **백엔드 API 구현**
   - 프롬프트 스키마 및 검증 (`lib/art/types.ts`)
   - Route Handler: `/api/art/generate`
   - Route Handler: `/api/art/edit`
   - 이미지 유틸리티 (`lib/art/utils.ts`)
   - Vitest/Playwright 설정

2. **환경 변수 준비**
   - Gemini API Key 발급
   - `.env.local` 설정

3. **베이스라인 커밋**
   - `chore: initial project setup` 커밋

4. **Phase 1 준비**
   - `packages/ai-sdk` 디렉토리 생성
   - Gemini API 문서 재확인
