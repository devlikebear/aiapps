# 기여 가이드라인

AI Apps 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 📖 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 워크플로우](#개발-워크플로우)
- [코딩 규칙](#코딩-규칙)
- [커밋 메시지 규칙](#커밋-메시지-규칙)
- [Pull Request 프로세스](#pull-request-프로세스)
- [이슈 리포팅](#이슈-리포팅)

---

## 행동 강령

### 우리의 약속

모든 참여자에게 존중과 배려가 있는 환경을 제공하기 위해 노력합니다.

### 기대하는 행동

- 다른 관점과 경험 존중
- 건설적인 비판 수용
- 커뮤니티에 최선의 이익을 고려
- 다른 커뮤니티 구성원에 대한 공감

### 금지되는 행동

- 성적 언어나 이미지 사용
- 트롤링, 모욕적/경멸적 댓글
- 공개적 또는 개인적 괴롭힘
- 명시적 허가 없이 타인의 개인 정보 공개

---

## 시작하기

### 사전 요구 사항

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0
- **Git**: 최신 버전
- **GitHub 계정**: 기여를 위해 필요

### 개발 환경 설정

1. **리포지토리 포크**

   GitHub에서 리포지토리를 포크합니다.

2. **로컬에 클론**

   ```bash
   git clone https://github.com/YOUR-USERNAME/aiapps.git
   cd aiapps
   ```

3. **업스트림 리모트 추가**

   ```bash
   git remote add upstream https://github.com/devlikebear/aiapps.git
   ```

4. **의존성 설치**

   ```bash
   npm install
   ```

5. **개발 서버 실행**

   ```bash
   npm run dev
   ```

---

## 개발 워크플로우

### 1. Issue 기반 개발

모든 작업은 GitHub Issue로 시작합니다:

1. **Issue 생성 또는 선택**
   - 새로운 기능/버그 수정을 위한 Issue 생성
   - 또는 기존 Issue 선택 (라벨: `good first issue`, `help wanted`)

2. **Issue 번호 확인**
   - 예: `#42 - Add dark mode support`

### 2. 브랜치 생성

Issue 번호를 포함한 브랜치를 생성합니다:

```bash
# 메인 브랜치 최신화
git checkout main
git pull upstream main

# 피처 브랜치 생성
git checkout -b feature/42-dark-mode
```

#### 브랜치 네이밍 규칙

- `feature/[issue-number]-[short-description]`: 새로운 기능
- `fix/[issue-number]-[short-description]`: 버그 수정
- `docs/[issue-number]-[short-description]`: 문서 수정
- `test/[issue-number]-[short-description]`: 테스트 추가
- `refactor/[issue-number]-[short-description]`: 리팩토링
- `chore/[issue-number]-[short-description]`: 기타 작업

### 3. 개발 진행

```bash
# 개발 서버 실행
npm run dev

# 린트 검사
npm run lint

# 타입 체크
npm run type-check

# 테스트 실행
npm run test
```

### 4. 커밋

Conventional Commits 규칙을 따릅니다:

```bash
git add .
git commit -m "feat(ui): add dark mode toggle

- Add theme switcher component
- Implement dark mode styles
- Save user preference to localStorage

Closes #42"
```

### 5. Push 및 PR 생성

```bash
# 브랜치 푸시
git push origin feature/42-dark-mode

# GitHub에서 Pull Request 생성
```

---

## 코딩 규칙

### TypeScript

- **Strict Mode**: 항상 strict mode 사용
- **타입 정의**: `any` 사용 최소화
- **명시적 타입**: 함수 파라미터와 반환값에 타입 명시

```typescript
// ✅ 좋은 예
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User | null {
  // ...
}

// ❌ 나쁜 예
function getUser(id: any): any {
  // ...
}
```

### React

- **함수형 컴포넌트**: 클래스 컴포넌트 사용 금지
- **Hooks**: React Hooks 사용
- **Props 타입**: 모든 컴포넌트에 Props 인터페이스 정의

```typescript
// ✅ 좋은 예
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### 스타일링

- **Tailwind CSS**: 유틸리티 클래스 사용
- **반응형**: 모바일 우선 접근 방식
- **다크 모드**: `dark:` 접두사 사용

```tsx
// ✅ 좋은 예
<div className="p-4 bg-white dark:bg-gray-900 md:p-6">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### 파일 구조

- **컴포넌트**: `components/` 디렉토리
- **유틸리티**: `lib/` 디렉토리
- **타입**: 각 파일 내부 또는 `types/` 디렉토리
- **테스트**: 같은 디렉토리에 `.test.ts` 또는 `.spec.ts`

---

## 커밋 메시지 규칙

### Conventional Commits

모든 커밋 메시지는 Conventional Commits 규칙을 따릅니다.

#### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

#### Scope

- `audio`: 오디오 생성기
- `art`: 아트 생성기
- `api`: API 관련
- `ui`: UI 컴포넌트
- `db`: IndexedDB 관련
- `queue`: 작업 큐
- `lib`: 라이브러리/유틸리티

#### 예제

```bash
# 새로운 기능
feat(audio): add reverb effect option

# 버그 수정
fix(api): handle rate limit properly

# 문서 수정
docs(readme): update installation steps

# 리팩토링
refactor(db): simplify query logic

# 테스트
test(audio): add unit tests for prompt builder
```

#### Breaking Changes

Breaking change가 있는 경우 `!`를 추가하고 footer에 설명:

```bash
feat(api)!: change audio generation response format

BREAKING CHANGE: Audio response now returns object instead of string.
Migration guide: https://...
```

---

## Pull Request 프로세스

### PR 체크리스트

PR을 생성하기 전에 다음을 확인하세요:

- [ ] 린트 검사 통과 (`npm run lint`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 테스트 통과 (`npm run test`)
- [ ] Conventional Commits 규칙 준수
- [ ] Issue 번호 참조 (예: `Closes #42`)
- [ ] README 또는 문서 업데이트 (필요시)

### PR 템플릿

```markdown
## 설명

Issue #번호를 간단히 설명합니다.

## 변경 사항

- 변경 사항 1
- 변경 사항 2

## 테스트

- [ ] 단위 테스트 추가
- [ ] E2E 테스트 추가
- [ ] 수동 테스트 완료

## 스크린샷 (UI 변경 시)

(스크린샷 첨부)

## 체크리스트

- [ ] 린트 검사 통과
- [ ] 타입 체크 통과
- [ ] 테스트 통과
- [ ] 문서 업데이트
```

### PR 리뷰

1. **자동 검사**: GitHub Actions가 자동으로 린트, 타입 체크, 테스트 실행
2. **코드 리뷰**: 최소 1명의 승인 필요
3. **변경 요청**: 리뷰어의 피드백에 따라 수정
4. **병합**: 승인 후 squash merge

---

## 이슈 리포팅

### 버그 리포트

버그를 발견하셨나요? Issue를 생성해주세요!

#### 버그 리포트 템플릿

```markdown
## 버그 설명

버그에 대한 명확하고 간결한 설명.

## 재현 방법

1. '...'로 이동
2. '...'를 클릭
3. '...'까지 스크롤
4. 에러 확인

## 예상 동작

무엇이 일어날 것으로 예상했는지 설명.

## 실제 동작

실제로 무슨 일이 일어났는지 설명.

## 스크린샷

(스크린샷 첨부)

## 환경

- OS: [예: macOS 14.0]
- 브라우저: [예: Chrome 120]
- Node.js: [예: 20.10.0]

## 추가 정보

버그에 대한 추가 컨텍스트.
```

### 기능 요청

새로운 기능을 제안하고 싶으신가요?

#### 기능 요청 템플릿

```markdown
## 기능 설명

원하는 기능에 대한 명확하고 간결한 설명.

## 문제점

현재 어떤 문제가 있는지 설명.

## 제안하는 해결책

원하는 동작에 대한 설명.

## 대안

고려한 다른 해결책이나 기능 설명.

## 추가 정보

제안에 대한 추가 컨텍스트나 스크린샷.
```

---

## 질문이 있으신가요?

- **GitHub Discussions**: 일반적인 질문
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **이메일**: devlikebear@example.com

---

## 감사의 말

모든 기여자들에게 감사드립니다! 🎉

<div align="center">

**함께 만들어가는 AI Apps**

[⬆ 맨 위로](#기여-가이드라인)

</div>
