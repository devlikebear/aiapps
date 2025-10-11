# @aiapps/ui

공유 UI 컴포넌트 라이브러리 - AI Apps 프로젝트용

## 설치

```bash
npm install @aiapps/ui
```

## 사용법

```typescript
import { Button, Card, Modal, Input } from '@aiapps/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button variant="primary" size="md">
        Click me
      </Button>
    </Card>
  );
}
```

## 컴포넌트

### Form Controls

- **Button** - 다양한 variants (primary, secondary, danger, ghost) 및 sizes (sm, md, lg)
- **Input** - 텍스트 입력, textarea, number 입력
- **Select** - 단일/다중 선택 드롭다운

### Layout & Feedback

- **Card** - 카드 레이아웃 (Header, Title, Content, Footer)
- **Modal** - 오버레이 모달 대화상자
- **Toast** - 알림 메시지 (success, error, info, warning)

### Status Display

- **LoadingSpinner** - 로딩 인디케이터
- **ErrorMessage** - 에러 메시지 표시

## 개발

```bash
# 빌드
npm run build

# 개발 모드 (watch)
npm run dev

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 기술 스택

- React 19
- TypeScript
- Tailwind CSS
- Class Variance Authority (CVA)
- tsup (빌드 도구)

## 라이선스

MIT
