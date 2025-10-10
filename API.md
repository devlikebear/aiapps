# API 문서

AI Apps의 API 엔드포인트 문서입니다.

## 목차

- [개요](#개요)
- [인증](#인증)
- [오디오 생성 API](#오디오-생성-api)
- [아트 생성 API](#아트-생성-api)
- [설정 API](#설정-api)
- [에러 처리](#에러-처리)
- [Rate Limiting](#rate-limiting)

---

## 개요

### Base URL

```
Development: http://localhost:3000
Production: https://your-domain.vercel.app
```

### Content Type

모든 요청과 응답은 `application/json` 형식을 사용합니다.

### 인증

API 키는 클라이언트 측 localStorage에 저장되며, 각 요청 시 헤더 또는 요청 본문에 포함됩니다.

---

## 인증

### API 키 관리

API 키는 서버에 저장되지 않고 클라이언트 측에서 관리됩니다:

1. **저장**: localStorage에 AES-256-GCM 암호화
2. **사용**: 각 API 요청 시 포함
3. **보안**: 디바이스 지문 기반 암호화 키

---

## 오디오 생성 API

### POST `/api/audio/generate`

Gemini Lyria API를 사용하여 오디오를 생성합니다.

#### 요청

```typescript
interface AudioGenerateRequest {
  apiKey: string;
  genre: string;
  mood: string;
  bpm: number; // 60-200
  instruments: string[];
  density?: number; // 0-1, 기본값: 0.5
  brightness?: number; // 0-1, 기본값: 0.5
  duration: number; // 초 단위
  scale?: string; // 기본값: 'major'
}
```

#### 예제 요청

```bash
curl -X POST http://localhost:3000/api/audio/generate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-gemini-api-key",
    "genre": "orchestral",
    "mood": "epic",
    "bpm": 120,
    "instruments": ["strings", "brass"],
    "duration": 30
  }'
```

#### 응답

```typescript
interface AudioGenerateResponse {
  success: true;
  data: {
    audio: string; // Base64 encoded WAV
    format: 'wav';
    duration: number;
    sampleRate: number;
    channels: number;
  };
}
```

#### 예제 응답

```json
{
  "success": true,
  "data": {
    "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
    "format": "wav",
    "duration": 30,
    "sampleRate": 48000,
    "channels": 2
  }
}
```

#### 에러 응답

```typescript
interface AudioGenerateError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## 아트 생성 API

### POST `/api/art/generate`

Gemini 2.5 Flash Image API를 사용하여 이미지를 생성합니다.

#### 요청

```typescript
interface ArtGenerateRequest {
  apiKey: string;
  prompt: string;
  style?: string; // 기본값: 'pixel-art'
  subject?: string; // 기본값: 'character'
  palette?: string; // 기본값: 'vibrant'
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'; // 기본값: '1:1'
  resolution?: string; // 기본값: '512x512'
  seed?: number; // 재현성을 위한 시드
}
```

#### 예제 요청

```bash
curl -X POST http://localhost:3000/api/art/generate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-gemini-api-key",
    "prompt": "2D pixel art fantasy warrior character",
    "style": "pixel-art",
    "aspectRatio": "1:1",
    "resolution": "512x512"
  }'
```

#### 응답

```typescript
interface ArtGenerateResponse {
  success: true;
  data: {
    image: string; // Base64 encoded PNG
    format: 'png';
    width: number;
    height: number;
    seed?: number;
  };
}
```

#### 예제 응답

```json
{
  "success": true,
  "data": {
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    "format": "png",
    "width": 512,
    "height": 512,
    "seed": 42
  }
}
```

### POST `/api/art/edit`

생성된 이미지를 편집합니다.

#### 요청

```typescript
interface ArtEditRequest {
  apiKey: string;
  image: string; // Base64 encoded image
  prompt: string; // 편집 지시사항
}
```

#### 예제 요청

```bash
curl -X POST http://localhost:3000/api/art/edit \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-gemini-api-key",
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    "prompt": "Add a dragon in the background"
  }'
```

#### 응답

동일한 `ArtGenerateResponse` 형식

### POST `/api/art/style-transfer`

이미지 스타일 전이를 수행합니다.

#### 요청

```typescript
interface StyleTransferRequest {
  apiKey: string;
  baseImage: string; // Base64 encoded image
  styleImage: string; // Base64 encoded style reference
  prompt?: string; // 추가 지시사항 (선택)
}
```

#### 예제 요청

```bash
curl -X POST http://localhost:3000/api/art/style-transfer \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-gemini-api-key",
    "baseImage": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    "styleImage": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    "prompt": "Apply impressionist style"
  }'
```

#### 응답

동일한 `ArtGenerateResponse` 형식

---

## 설정 API

### POST `/api/settings/validate`

Gemini API 키의 유효성을 검증합니다.

#### 요청

```typescript
interface ValidateRequest {
  apiKey: string;
}
```

#### 예제 요청

```bash
curl -X POST http://localhost:3000/api/settings/validate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-gemini-api-key"
  }'
```

#### 응답

```typescript
interface ValidateResponse {
  success: true;
  data: {
    valid: boolean;
    message?: string;
  };
}
```

#### 예제 응답

```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "API key is valid"
  }
}
```

---

## 에러 처리

### 에러 응답 형식

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 에러 코드

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| `INVALID_API_KEY` | API 키가 유효하지 않음 | 401 |
| `VALIDATION_ERROR` | 요청 데이터 검증 실패 | 400 |
| `RATE_LIMIT_EXCEEDED` | Rate limit 초과 | 429 |
| `GENERATION_FAILED` | AI 생성 실패 | 500 |
| `INTERNAL_ERROR` | 서버 내부 오류 | 500 |

### 에러 응답 예제

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 60 seconds.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## Rate Limiting

### 제한 정책

API 엔드포인트마다 다른 rate limit이 적용됩니다:

| 엔드포인트 | 제한 | 기간 |
|-----------|------|------|
| `/api/audio/generate` | 10 requests | 1분 |
| `/api/art/generate` | 20 requests | 1분 |
| `/api/art/edit` | 20 requests | 1분 |
| `/api/art/style-transfer` | 10 requests | 1분 |
| `/api/settings/validate` | 5 requests | 1분 |

### Rate Limit 헤더

Rate limit 정보는 응답 헤더에 포함됩니다:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1609459200
```

### Rate Limit 초과 시

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 10,
      "remaining": 0,
      "resetAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 성능 최적화

### 응답 시간

| 엔드포인트 | 평균 응답 시간 | 최대 응답 시간 |
|-----------|---------------|---------------|
| `/api/audio/generate` | 15-30초 | 60초 |
| `/api/art/generate` | 5-10초 | 30초 |
| `/api/art/edit` | 5-10초 | 30초 |
| `/api/art/style-transfer` | 10-20초 | 45초 |
| `/api/settings/validate` | <1초 | 5초 |

### Server-Timing 헤더

성능 분석을 위해 Server-Timing 헤더가 포함됩니다:

```
Server-Timing: validation;dur=50, generation;dur=15000, conversion;dur=200
```

---

## 모범 사례

### 1. API 키 보안

```typescript
// ❌ 나쁜 예: API 키를 평문으로 저장
localStorage.setItem('apiKey', apiKey);

// ✅ 좋은 예: 암호화하여 저장
import { encryptAPIKey } from '@/lib/api-key/encryption';
const encrypted = await encryptAPIKey(apiKey);
localStorage.setItem('gemini_api_key_encrypted', encrypted);
```

### 2. 에러 처리

```typescript
try {
  const response = await fetch('/api/audio/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  const data = await response.json();

  if (!data.success) {
    // 에러 처리
    if (data.error.code === 'RATE_LIMIT_EXCEEDED') {
      const retryAfter = data.error.details?.retryAfter || 60;
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    throw new Error(data.error.message);
  }

  return data.data;
} catch (error) {
  console.error('API request failed:', error);
  throw error;
}
```

### 3. Rate Limiting 처리

```typescript
import { RateLimiter } from '@/lib/api/rate-limiter';

const limiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000
});

async function generateAudio(request: AudioGenerateRequest) {
  const canProceed = await limiter.checkLimit('audio-generate');

  if (!canProceed) {
    throw new Error('Rate limit exceeded. Please wait.');
  }

  // API 요청 진행
  const response = await fetch('/api/audio/generate', { ... });
  return response;
}
```

---

## 참고 자료

- [Gemini API 문서](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel 배포 가이드](./DEPLOY.md)
- [프로젝트 개발 가이드](./CLAUDE.md)
