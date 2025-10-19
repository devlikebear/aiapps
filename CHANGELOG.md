# Changelog

모든 주요 변경 사항은 이 파일에 기록됩니다.

**현재 버전**: v1.0.0
**릴리스 날짜**: 2025-10-19

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)을 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 준수합니다.

## [Unreleased]

### Added
- 트윗 생성 및 공유 기능
- Google Drive 통합 저장 기능
- 작업 큐 시스템 (Job Queue)
- 통합 미디어 라이브러리

### Changed
- 헤더 네비게이션 리팩토링

### Fixed
- 트윗 라이브러리 카드의 텍스트 오버플로우 문제
- Google Drive 메타데이터 크기 제한 최적화
- API 키 확인 방식 개선

## [1.0.0] - 2025-10-18

### Added
- ✨ **AI 게임 오디오 생성기** (Gemini Lyria RealTime)
  - 실시간 배경 음악 생성
  - 효과음 생성
  - 장르, 분위기, BPM, 악기 커스터마이징
  - WebSocket 스트리밍

- ✨ **AI 2D 게임 아트 생성기** (Gemini 2.5 Flash Image)
  - 2D 픽셀 아트 생성
  - 캐릭터 생성
  - 배경 생성
  - 이미지 편집 기능
  - 스타일 전이 (Style Transfer)
  - 이미지 합성 (Image Composition)

- 🎵 **오디오 기능**
  - 프롬프트 빌더
  - 배경 작업 큐
  - 미리듣기
  - 라이브러리 관리
  - 다운로드 (.wav)

- 🎨 **아트 기능**
  - 프롬프트 빌더
  - 다양한 종횡비 지원 (1:1, 16:9, 9:16)
  - 갤러리 관리
  - 다운로드 (.png)
  - 배치 생성

- 🔐 **보안 & 개인정보**
  - 클라이언트 측 API 키 관리
  - AES-256-GCM 암호화
  - 디바이스 지문 기반 키 생성
  - localStorage 안전 저장

- 📊 **관찰성 & 성능**
  - Vercel Speed Insights 통합
  - Core Web Vitals 추적 (LCP, CLS, TTFB, INP)
  - 에러 바운더리
  - 구조화된 로깅

- 📱 **UI/UX**
  - Tailwind CSS 기반 반응형 디자인
  - 다크 모드 지원
  - 프롬프트 빌더 인터페이스
  - 오디오/이미지 라이브러리 UI
  - 설정 페이지

- 📚 **온보딩 & 도움말**
  - 첫 사용자 가이드
  - 상세 문서
  - API 키 설정 가이드

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Database**: IndexedDB, localStorage
- **AI APIs**: Google Gemini (Lyria, Flash Image)
- **Real-time**: WebSocket
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics, Speed Insights
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Code Quality
- ✅ Unit & Integration Tests
- ✅ E2E Tests (Playwright)
- ✅ Linting (ESLint)
- ✅ Code Formatting (Prettier)
- ✅ TypeScript strict mode
- ✅ Error Handling
- ✅ Logging & Monitoring

---

## 주요 기능별 변경 사항

### 트윗 생성기 (v1.0.0)
- **Added**: 트윗 생성 API
- **Added**: Twitter(X) 공유 기능
- **Added**: Google Drive 저장 기능
- **Added**: 작업 큐 통합
- **Added**: 라이브러리 관리

### 아트 생성기 (v1.0.0)
- **Added**: 이미지 생성
- **Added**: 이미지 편집
- **Added**: 스타일 전이
- **Added**: 이미지 합성
- **Added**: 배치 생성

### 오디오 생성기 (v1.0.0)
- **Added**: 오디오 생성
- **Added**: 실시간 스트리밍
- **Added**: 배경 작업 큐

### Google Drive 통합 (v1.0.0)
- **Added**: 클라우드 저장
- **Added**: 파일 업로드/다운로드
- **Added**: 공유 관리
- **Added**: 메타데이터 지원

---

## 마이그레이션 가이드

### v1.0.0 초기 릴리스
첫 릴리스이므로 마이그레이션이 필요하지 않습니다.

---

## 알려진 문제 & 제한사항

### API 레이트 제한
- 개당 요청당 API 호출 제한 있음 (Google Gemini API 정책)
- 자세한 내용은 [문서](./CLAUDE.md) 참고

### 브라우저 호환성
- IndexedDB 지원 필요
- localStorage 지원 필요
- 최신 모던 브라우저 권장

### 파일 크기
- 오디오: 최대 100MB
- 이미지: 최대 50MB (압축됨)

---

## 감사의 말

- [Google Gemini AI](https://ai.google.dev/) - AI 모델
- [Next.js](https://nextjs.org/) - 프레임워크
- [Vercel](https://vercel.com/) - 배포 플랫폼
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- 모든 오픈소스 기여자들

---

**마지막 업데이트**: 2025-10-19
