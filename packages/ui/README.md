# @aiapps/ui

AI Apps 프로젝트를 위한 공유 UI 컴포넌트 라이브러리

## 📦 설치

이 패키지는 모노레포 내부에서 사용됩니다.

```typescript
import { Button, Input, Select, Card, Modal, Toast } from '@aiapps/ui';
```

## 🚀 빠른 시작

```typescript
import { Button, Input, Card, Modal } from '@aiapps/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card padding="md">
      <Input
        label="이메일"
        type="email"
        placeholder="your@email.com"
        helperText="이메일 주소를 입력하세요"
      />

      <Button
        variant="primary"
        size="md"
        onClick={() => setIsOpen(true)}
      >
        모달 열기
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="확인"
      >
        <p>모달 내용</p>
      </Modal>
    </Card>
  );
}
```

## 🎨 컴포넌트

### Form Controls

#### Button
4가지 variant와 3가지 size를 지원하는 버튼

```typescript
<Button variant="primary" size="md" fullWidth disabled>
  클릭하세요
</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (기본값: 'primary')
- `size`: 'sm' | 'md' | 'lg' (기본값: 'md')
- `fullWidth`: boolean
- `disabled`: boolean

#### Input
라벨, 에러, 헬퍼 텍스트를 지원하는 입력 필드

```typescript
<Input
  label="사용자명"
  placeholder="username"
  error="필수 입력 항목입니다"
  helperText="4자 이상 입력하세요"
  fullWidth
/>
```

**Props**:
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean
- `disabled`: boolean

#### Select
드롭다운 선택 컴포넌트

```typescript
<Select
  label="국가 선택"
  options={[
    { value: 'kr', label: '한국' },
    { value: 'us', label: '미국' }
  ]}
  fullWidth
/>
```

**Props**:
- `label`: string
- `options`: Array<{ value: string; label: string }>
- `error`: string
- `helperText`: string

### Layout

#### Card
컨테이너 레이아웃

```typescript
<Card padding="lg">
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>
```

**Props**:
- `padding`: 'none' | 'sm' | 'md' | 'lg' (기본값: 'md')

#### Modal
모달 다이얼로그

```typescript
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="제목"
  size="md"
  closeOnBackdrop
>
  <p>모달 내용</p>
</Modal>
```

**Props**:
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' (기본값: 'md')
- `closeOnBackdrop`: boolean (기본값: true)

### Status

#### LoadingSpinner
로딩 인디케이터

```typescript
<LoadingSpinner size="lg" />
```

**Props**:
- `size`: 'sm' | 'md' | 'lg' (기본값: 'md')

#### ErrorMessage
에러 메시지 및 재시도 버튼

```typescript
<ErrorMessage
  title="오류"
  message="데이터를 불러올 수 없습니다"
  onRetry={() => refetch()}
/>
```

**Props**:
- `title`: string (기본값: 'Error')
- `message`: string (required)
- `onRetry`: () => void

#### Toast
토스트 알림

```typescript
<Toast
  message="저장되었습니다"
  type="success"
  position="top-right"
  duration={3000}
  onClose={() => {}}
/>
```

**Props**:
- `message`: string | ReactNode (required)
- `type`: 'success' | 'error' | 'warning' | 'info' (기본값: 'info')
- `duration`: number (기본값: 3000ms, 0이면 자동 닫기 비활성화)
- `position`: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
- `onClose`: () => void

## 📚 Storybook

컴포넌트 문서와 인터랙티브 예제:

```bash
cd packages/ui
npm run storybook
```

[http://localhost:6006](http://localhost:6006)에서 확인

## 🧪 테스트

```bash
cd packages/ui

# 단일 실행
npm run test

# Watch 모드
npm run test:watch

# 커버리지
npm run test:coverage
```

**테스트 현황**: 22개 테스트 모두 통과 ✅

## 🏗️ 빌드

```bash
cd packages/ui
npm run build
```

**빌드 출력**:
- `dist/index.js` - CommonJS (18.10 KB)
- `dist/index.mjs` - ES Modules (15.52 KB)
- `dist/index.d.ts` - TypeScript 타입 정의 (2.74 KB)

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Purple-500/600/700
- **Background**: Gray-900 (다크 테마)
- **Border**: Gray-800/700
- **Text**: Gray-100/300/400
- **Success**: Green-500/600
- **Error**: Red-500/600
- **Warning**: Yellow-500/600
- **Info**: Blue-500/600

### Typography
- **sm**: 0.875rem (14px)
- **md**: 1rem (16px)
- **lg**: 1.125rem (18px)

### Spacing
- **sm**: 12px (p-3, px-3 py-1.5)
- **md**: 16px (p-4, px-4 py-2)
- **lg**: 24px (p-6, px-6 py-3)

## 🔧 개발 가이드

### 새 컴포넌트 추가

1. **컴포넌트 파일 생성**: `src/components/NewComponent.tsx`
2. **Export 추가**: `src/index.ts`에 추가
3. **Storybook 스토리 작성**: `src/components/NewComponent.stories.tsx`
4. **테스트 작성**: `src/components/NewComponent.test.tsx`
5. **빌드 및 검증**:

```bash
npm run build
npm run test
npm run type-check
npm run lint
```

### 컴포넌트 작성 규칙

- forwardRef 패턴 사용
- TypeScript strict mode 준수
- Tailwind CSS + clsx 사용
- lucide-react 아이콘 사용
- 접근성 고려 (ARIA labels, keyboard navigation)

## 기술 스택

- **React** 19.0.0
- **TypeScript** 5.7.3 (strict mode)
- **Tailwind CSS** 3.4.17
- **clsx** 2.1.1 (조건부 클래스)
- **lucide-react** 0.469.0 (아이콘)
- **tsup** 8.0.0 (빌드)
- **Vitest** 3.2.4 (테스트)
- **Storybook** 9.1.10 (문서화)

## 📝 라이선스

MIT
