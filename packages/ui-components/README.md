# @aiapps/ui-components

AI 게임 에셋 생성 앱들을 위한 공유 UI 컴포넌트 라이브러리입니다.

## 설치

이 패키지는 workspace 내에서 사용됩니다:

```json
{
  "dependencies": {
    "@aiapps/ui-components": "*"
  }
}
```

## 컴포넌트

### Button

다양한 스타일과 크기의 버튼 컴포넌트

```tsx
import { Button } from '@aiapps/ui-components';

<Button variant="primary" size="lg">
  클릭하세요
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' (기본값: 'primary')
- `size`: 'sm' | 'md' | 'lg' (기본값: 'md')
- `fullWidth`: boolean (기본값: false)

### Card

그림자와 패딩을 가진 카드 컨테이너

```tsx
import { Card } from '@aiapps/ui-components';

<Card padding="md" shadow="md">
  <p>카드 내용</p>
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' (기본값: 'md')
- `shadow`: 'none' | 'sm' | 'md' | 'lg' (기본값: 'md')

### FeatureCard

아이콘, 제목, 설명이 있는 기능 소개 카드

```tsx
import { FeatureCard } from '@aiapps/ui-components';

<FeatureCard
  icon="🎨"
  title="AI 생성"
  description="AI로 빠르게 에셋을 생성합니다"
/>
```

**Props:**
- `icon`: string (이모지 또는 아이콘)
- `title`: string
- `description`: string

### Container

반응형 컨테이너 with max-width 옵션

```tsx
import { Container } from '@aiapps/ui-components';

<Container maxWidth="lg" centered>
  <p>컨텐츠</p>
</Container>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' (기본값: 'lg')
- `centered`: boolean (기본값: false)

### PageHeader

그라디언트 텍스트를 사용하는 페이지 헤더

```tsx
import { PageHeader } from '@aiapps/ui-components';

<PageHeader
  title="AI Audio Generator"
  subtitle="Powered by Gemini"
  gradient={{ from: 'blue-600', to: 'purple-600' }}
/>
```

**Props:**
- `title`: string
- `subtitle`: string (선택사항)
- `gradient`: { from: string, to: string } (선택사항)

## 개발

```bash
# 개발 모드 (watch)
npm run dev

# 빌드
npm run build

# 린트
npm run lint

# 타입 체크
npm run type-check
```

## 기술 스택

- React 19
- TypeScript
- Tailwind CSS (앱에서 제공)
