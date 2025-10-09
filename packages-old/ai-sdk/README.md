# @aiapps/ai-sdk

Gemini AI 통합을 위한 공유 TypeScript SDK

## 기능

- **Gemini Lyria RealTime**: WebSocket 기반 실시간 음악 생성
- **Gemini 2.5 Flash Image**: 이미지 생성, 편집, 합성, 스타일 전이
- **레이트 리밋**: Token Bucket 알고리즘 기반 자동 레이트 리밋
- **재시도**: Exponential Backoff 기반 자동 재시도
- **타입 안전성**: 완전한 TypeScript 지원
- **로깅**: 요청 ID 및 지연 시간 추적

## 설치

```bash
npm install @aiapps/ai-sdk
```

## 사용법

### Lyria Client (음악 생성)

```typescript
import { LyriaClient } from '@aiapps/ai-sdk';

const client = new LyriaClient({
  apiKey: process.env.GEMINI_API_KEY
});

// 이벤트 리스너 등록
client.on('stream', (response) => {
  console.log('Progress:', response.progress);
});

client.on('complete', (response) => {
  console.log('Audio generated:', response.audio);
});

// 음악 생성
const result = await client.generate({
  prompt: 'Epic orchestral battle music',
  bpm: 120,
  density: 0.7,
  brightness: 0.6,
  duration: 30,
  scale: 'major',
});
```

### Image Client (이미지 생성)

```typescript
import { GeminiImageClient } from '@aiapps/ai-sdk';

const client = new GeminiImageClient({
  apiKey: process.env.GEMINI_API_KEY
});

// 이미지 생성
const result = await client.generate({
  prompt: '2D pixel art fantasy character',
  aspectRatio: '1:1',
  numberOfImages: 2,
  seed: 42,
});

// 이미지 편집
const edited = await client.edit({
  image: { data: imageBuffer, mimeType: 'image/png' },
  prompt: 'Add a red hat to the character',
});

// 다중 이미지 합성
const composed = await client.compose({
  images: [image1, image2, image3],
  prompt: 'Combine these characters into one scene',
});

// 스타일 전이
const styled = await client.styleTransfer({
  baseImage: contentImage,
  styleImage: styleReference,
  prompt: 'Apply pixel art style',
});
```

### 레이트 리밋 & 재시도

```typescript
import { RateLimiter, withRetry } from '@aiapps/ai-sdk';

// 레이트 리미터 생성 (분당 60회)
const limiter = new RateLimiter({
  tokensPerInterval: 60,
  interval: 60000,
});

// 토큰 획득
await limiter.acquire();

// 재시도 래퍼
const result = await withRetry(
  () => client.generate(request),
  { maxRetries: 3, initialDelay: 1000 }
);
```

### 모킹 (테스트용)

```typescript
import { mockLyriaClient, mockImageClient } from '@aiapps/ai-sdk/mocks';

// Lyria 모킹
const mockLyria = mockLyriaClient();
const result = await mockLyria.generate({ prompt: 'Test music' });

// Image 모킹
const mockImage = mockImageClient();
const result = await mockImage.generate({ prompt: 'Test image' });
```

## API 참조

### LyriaClient

#### Constructor Options
- `apiKey`: Gemini API 키 (필수)
- `timeout`: 타임아웃 (ms, 기본값: 60000)
- `maxRetries`: 최대 재시도 횟수 (기본값: 3)
- `reconnectAttempts`: 재연결 시도 횟수 (기본값: 5)

#### Methods
- `generate(request: LyriaRequest): Promise<LyriaResponse>`
- `disconnect(): void`
- `getState(): ConnectionState`

#### Events
- `stateChange`: 연결 상태 변경
- `stream`: 스트리밍 데이터 수신
- `complete`: 생성 완료
- `error`: 에러 발생

### GeminiImageClient

#### Constructor Options
- `apiKey`: Gemini API 키 (필수)
- `timeout`: 타임아웃 (ms, 기본값: 60000)
- `maxRetries`: 최대 재시도 횟수 (기본값: 3)
- `model`: 사용할 모델 (기본값: 'gemini-2.0-flash-exp')

#### Methods
- `generate(request: ImageGenerateRequest): Promise<ImageGenerateResponse>`
- `edit(request: ImageEditRequest): Promise<ImageEditResponse>`
- `compose(request: ImageComposeRequest): Promise<ImageComposeResponse>`
- `styleTransfer(request: ImageStyleTransferRequest): Promise<ImageStyleTransferResponse>`

## 개발

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 테스트
npm test

# 커버리지
npm run test:coverage

# 타입 체크
npm run type-check
```

## 라이선스

ISC
