# AI Apps 프로젝트 계획

## 프로젝트 개요

Gemini AI를 활용한 멀티모달 생성 애플리케이션 모노레포:

- **AI 게임 오디오 생성기**: Gemini Lyria RealTime 기반 실시간 음악/효과음 생성
- **AI 2D 게임 아트 생성기**: Gemini 2.5 Flash Image 기반 2D 게임 아트 생성

**기술 스택**: Next.js 15 (App Router) | TypeScript | Tailwind CSS | Zustand | IndexedDB | Vercel

---

## 완료된 작업 (Phase 0-3.6) ✅

### 핵심 기능

- ✅ **Gemini Lyria API 연동 완료** - 오디오 생성 작동 중
- ✅ **Gemini Image API 연동 완료** - 이미지 생성 작동 중
- ✅ **AI SDK 패키지** - Lyria/Image 클라이언트, 레이트 리밋, 재시도 로직
- ✅ **IndexedDB v2** - 태그 시스템, 메타데이터 관리
- ✅ **API 키 관리** - AES-256 암호화, 디바이스 지문 기반 보안
- ✅ **오디오 생성기** - 프롬프트 빌더, 미리듣기, 라이브러리, 다운로드
- ✅ **아트 생성기** - 프롬프트 빌더, 미리보기, 갤러리, 다운로드
- ✅ **배경 작업 큐** - localStorage 기반 FIFO 큐, Toast 알림
- ✅ **태그 필터링** - 라이브러리/갤러리 필터, 관련 미디어 자동 표시
- ✅ **공통 UI** - 레이아웃, 네비게이션, 로딩/에러 상태

### 프로젝트 구조

```text
aiapps/
├── app/                         # Next.js 15 App Router
│   ├── apps/
│   │   ├── audio-generator/    # 오디오 생성기 앱
│   │   └── art-generator/      # 아트 생성기 앱
│   ├── api/                    # API Routes
│   │   ├── audio/              # 오디오 생성 API
│   │   ├── art/                # 아트 생성 API
│   │   └── settings/           # API 키 관리 API
│   ├── components/             # React 컴포넌트
│   └── lib/                    # 유틸리티, 스토어, DB
├── packages/
│   └── ai-sdk/                 # Gemini AI SDK
└── public/                     # 정적 파일
```

---

## 남은 작업 (Phase 4-8)

### Phase 4: UI 개선 및 품질 향상 🔄

**목표**: 사용자 경험 개선 및 코드 품질 향상

#### 4.1 공유 UI 컴포넌트 라이브러리

- [ ] `packages/ui` 패키지 생성
- [ ] 공통 컴포넌트 추출 및 마이그레이션:
  - [ ] Button, Input, Select (form controls)
  - [ ] Card, Modal, Toast (layout/feedback)
  - [ ] LoadingSpinner, ErrorMessage (상태 표시)
- [ ] Storybook 설정 및 컴포넌트 문서화
- [ ] 컴포넌트 단위 테스트 (Vitest + React Testing Library)

#### 4.2 접근성 개선

- [ ] WCAG 2.1 AA 준수 검증
- [ ] 키보드 네비게이션 개선
- [ ] ARIA 레이블 추가
- [ ] 색상 대비 검증 (4.5:1 이상)

#### 4.3 반응형 디자인

- [ ] 모바일 레이아웃 최적화 (320px~)
- [ ] 태블릿 레이아웃 (768px~)
- [ ] 터치 인터랙션 개선

#### 4.4 코드 품질

- [ ] ESLint 규칙 강화
- [ ] TypeScript strict mode 적용
- [ ] 중복 코드 리팩토링
- [ ] 성능 프로파일링 및 최적화

---

### Phase 5: 보안 및 관찰성 🔐

**목표**: 프로덕션 준비 - 보안 강화 및 모니터링

#### 5.1 보안 강화

- [ ] API 키 유효성 검증 강화
- [ ] Rate Limiting (API 엔드포인트)
- [ ] CORS 정책 설정
- [ ] Content Security Policy (CSP) 헤더
- [ ] 입력 검증 및 Sanitization

#### 5.2 에러 처리 및 로깅

- [ ] 구조화된 에러 타입 정의
- [ ] 클라이언트 에러 바운더리
- [ ] 서버 에러 로깅 (Vercel Analytics)
- [ ] 사용자 친화적 에러 메시지

#### 5.3 성능 모니터링

- [ ] Vercel Speed Insights 통합
- [ ] Core Web Vitals 측정
- [ ] 번들 사이즈 모니터링
- [ ] API 응답 시간 추적

---

### Phase 6: 배포 준비 🚀

**목표**: Vercel 프로덕션 배포 준비

#### 6.1 환경 설정

- [ ] 프로덕션 환경 변수 설정
- [ ] Vercel 프로젝트 연결
- [ ] 도메인 설정 (선택 사항)
- [ ] 환경별 API 엔드포인트 분리

#### 6.2 빌드 최적화

- [ ] 정적 에셋 최적화 (이미지, 폰트)
- [ ] 코드 스플리팅 검증
- [ ] Tree Shaking 확인
- [ ] 번들 사이즈 최적화 (<500KB 초기 로드)

#### 6.3 CI/CD 파이프라인

- [ ] GitHub Actions 워크플로우
  - [ ] Lint + Type Check
  - [ ] 단위/통합 테스트
  - [ ] E2E 테스트 (선택)
- [ ] PR 자동 프리뷰 배포
- [ ] main 브랜치 자동 배포

---

### Phase 7: 테스트 및 버그 수정 🧪

**목표**: 전체 시스템 검증 및 안정화

#### 7.1 E2E 테스트 (Playwright)

- [ ] 오디오 생성 플로우
  - [ ] API 키 설정 → 프롬프트 입력 → 생성 → 다운로드
  - [ ] 라이브러리 조회, 필터링, 삭제
- [ ] 아트 생성 플로우
  - [ ] API 키 설정 → 프롬프트 입력 → 생성 → 다운로드
  - [ ] 갤러리 조회, 필터링, 삭제
- [ ] 크로스 브라우저 테스트 (Chrome, Firefox, Safari)

#### 7.2 통합 테스트

- [ ] API 엔드포인트 테스트
- [ ] IndexedDB 작업 테스트
- [ ] Job Queue 시스템 테스트

#### 7.3 사용자 테스트

- [ ] 베타 테스트 그룹 모집
- [ ] 피드백 수집 및 버그 수정
- [ ] 성능 개선 (피드백 기반)

---

### Phase 8: 런치 및 모니터링 📊

**목표**: 프로덕션 배포 및 지속적 개선

#### 8.1 프로덕션 배포

- [ ] 프로덕션 환경 최종 검증
- [ ] Vercel 배포 실행
- [ ] 배포 후 smoke test

#### 8.2 문서화

- [ ] README.md 업데이트 (사용자 가이드)
- [ ] API 문서화
- [ ] 기여 가이드라인 (CONTRIBUTING.md)
- [ ] 라이선스 파일 (LICENSE)

#### 8.3 모니터링 및 유지보수

- [ ] 프로덕션 메트릭 대시보드
- [ ] 에러 알림 설정
- [ ] 사용자 피드백 수집 메커니즘
- [ ] 정기 성능 검토

---

## 타임라인

| Phase | 설명 | 예상 기간 | 상태 |
|-------|------|-----------|------|
| Phase 0 | 프로젝트 초기화 | 1-2일 | ✅ 완료 |
| Phase 1 | AI SDK 구축 | 2-3일 | ✅ 완료 |
| Phase 2 | 오디오 생성기 | 5-7일 | ✅ 완료 |
| Phase 3 | 아트 생성기 | 5-7일 | ✅ 완료 |
| Phase 3.6 | 태그 필터링 & 배경 큐 | 2일 | ✅ 완료 |
| **Phase 4** | **UI 개선** | **3-5일** | **🔄 다음** |
| Phase 5 | 보안 & 관찰성 | 3-4일 | ⏳ 대기 |
| Phase 6 | 배포 준비 | 2-3일 | ⏳ 대기 |
| Phase 7 | 테스트 & 버그 수정 | 3-5일 | ⏳ 대기 |
| Phase 8 | 런치 & 모니터링 | 2-3일 | ⏳ 대기 |

**총 예상 기간**: 약 4-6주 (Phase 0-3.6 완료, Phase 4-8 남음)

---

## 기술적 결정 사항

### 아키텍처

- **모노레포**: 코드 공유 및 일관성 유지
- **App Router**: Next.js 15 최신 기능 활용
- **IndexedDB**: 클라이언트 측 영구 저장소
- **배경 작업 큐**: localStorage 기반 FIFO 큐

### API 통합

- **Gemini Lyria**: WebSocket 스트리밍 (실시간 오디오)
- **Gemini Image**: REST API (이미지 생성)
- **레이트 리밋**: Token Bucket 알고리즘
- **재시도 로직**: Exponential Backoff

### 보안

- **API 키 암호화**: AES-256-GCM
- **디바이스 지문**: navigator 기반 고유 ID
- **환경 변수**: Vercel 환경 변수 관리

### 상태 관리

- **Zustand**: 글로벌 상태 (설정, 에셋)
- **React State**: 로컬 컴포넌트 상태
- **IndexedDB**: 영구 저장소

---

## 다음 단계

**즉시 시작 가능한 작업 (Phase 4)**:

1. `packages/ui` 패키지 생성 및 공통 컴포넌트 추출
2. Storybook 설정 및 컴포넌트 문서화
3. 반응형 디자인 개선 (모바일 최적화)
4. 접근성 검증 및 개선 (WCAG 2.1 AA)

**우선순위**:

- Phase 4.1 (UI 컴포넌트 라이브러리) → 코드 재사용성 향상
- Phase 4.3 (반응형 디자인) → 모바일 사용자 경험 개선
- Phase 4.2 (접근성) → 포용적 디자인
