# API 명세서

AI Apps 프로젝트의 완전한 API 명세입니다.

**Base URL**: `/api`

---

## 📚 목차

- [인증](#인증)
- [에러 처리](#에러-처리)
- [오디오 API](#오디오-api)
- [아트 API](#아트-api)
- [트윗 API](#트윗-api)
- [Google Drive API](#google-drive-api)
- [Rate Limiting](#rate-limiting)

---

## 인증

### API 키 헤더

모든 요청은 `X-API-Key` 헤더에 Gemini API 키를 포함해야 합니다.

```bash
curl -H "X-API-Key: your-api-key" \
  https://aiapps.vercel.app/api/audio/generate
```

### 클라이언트 측 키 관리

- API 키는 **브라우저 localStorage에만** 저장됩니다
- AES-256-GCM으로 암호화됩니다
- 서버로 전송되지 않습니다

---

## 에러 처리

### 표준 에러 응답

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "details": {}
}
```

### 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|---------|------|
| `INVALID_INPUT` | 400 | 잘못된 입력 |
| `MISSING_REQUIRED_PARAMETER` | 400 | 필수 파라미터 누락 |
| `AUTHENTICATION_ERROR` | 401 | 인증 실패 |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit 초과 |
| `GEMINI_API_ERROR` | 500 | Gemini API 오류 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## 오디오 API

### 오디오 생성

생성된 오디오는 WebSocket을 통해 실시간으로 스트리밍됩니다.

#### `POST /api/audio/generate`

오디오를 생성합니다.

**Request Headers**:
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Request Body**:
```json
{
  "prompt": "epic orchestral music",
  "genre": "orchestral",
  "mood": "epic",
  "bpm": 120,
  "instruments": ["strings", "brass", "timpani"],
  "duration": 30
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| `prompt` | string | ✅ | - | 오디오 설명 (최대 500자) |
| `genre` | string | ✅ | - | 장르 (orchestral, electronic, ambient, etc.) |
| `mood` | string | ✅ | - | 분위기 (epic, calm, suspense, etc.) |
| `bpm` | number | ✅ | - | BPM (60-200) |
| `instruments` | array | ✅ | - | 악기 배열 |
| `duration` | number | ✅ | - | 길이 (초, 최대 300) |

**Response** (200 OK):
```json
{
  "id": "aud_123456",
  "status": "success",
  "audio": "data:audio/wav;base64,...",
  "format": "wav",
  "duration": 30,
  "sampleRate": 44100,
  "metadata": {
    "genre": "orchestral",
    "mood": "epic",
    "bpm": 120,
    "instruments": ["strings", "brass", "timpani"],
    "createdAt": "2025-10-19T12:00:00Z"
  }
}
```

**Error Responses**:

```json
{
  "error": "Prompt is required",
  "code": "MISSING_REQUIRED_PARAMETER",
  "status": 400
}
```

```json
{
  "error": "Invalid BPM (must be 60-200)",
  "code": "INVALID_INPUT",
  "status": 400
}
```

**예제**:

```bash
curl -X POST http://localhost:3000/api/audio/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "prompt": "upbeat electronic dance music",
    "genre": "electronic",
    "mood": "energetic",
    "bpm": 128,
    "instruments": ["synth", "drum", "bass"],
    "duration": 60
  }'
```

### 오디오 변환

#### `POST /api/audio/convert`

오디오 형식을 변환합니다.

**Request Body**:
```json
{
  "audio": "data:audio/wav;base64,...",
  "targetFormat": "mp3"
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `audio` | string | ✅ | Base64 인코딩된 오디오 |
| `targetFormat` | string | ✅ | 변환 형식 (mp3, m4a, ogg) |

**Response** (200 OK):
```json
{
  "id": "aud_convert_123",
  "status": "success",
  "audio": "data:audio/mp3;base64,...",
  "format": "mp3",
  "originalFormat": "wav"
}
```

---

## 아트 API

### 이미지 생성

#### `POST /api/art/generate`

이미지를 생성합니다.

**Request Headers**:
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Request Body**:
```json
{
  "prompt": "cute pixel art character",
  "style": "pixel-art",
  "resolution": "512x512",
  "aspectRatio": "1:1",
  "quality": "standard",
  "batchSize": 1,
  "referenceImages": {
    "images": ["data:image/png;base64,..."],
    "usages": ["style_reference", "composition_reference"],
    "influence": 50
  }
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| `prompt` | string | ✅ | - | 이미지 설명 |
| `style` | string | ✅ | - | 스타일 (pixel-art, cartoon, realistic, etc.) |
| `resolution` | string | ❌ | 512x512 | 해상도 (256x256-1024x1024) |
| `aspectRatio` | string | ❌ | 1:1 | 종횡비 (1:1, 16:9, 9:16) |
| `quality` | string | ❌ | standard | 품질 (draft, standard, high) |
| `batchSize` | number | ❌ | 1 | 배치 크기 (1-4) |
| `seed` | number | ❌ | - | 시드 (재현성) |
| `referenceImages` | object | ❌ | - | 참조 이미지 |

**Reference Images**:

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `images` | array | Base64 인코딩된 이미지 배열 |
| `usages` | array | 활용 방식 (style_reference, composition_reference, color_reference) |
| `influence` | number | 영향도 (0-100, 기본 50) |

**Response** (200 OK):
```json
{
  "images": [
    {
      "data": "data:image/png;base64,...",
      "format": "png",
      "metadata": {
        "id": "img_123456",
        "style": "pixel-art",
        "width": 512,
        "height": 512,
        "aspectRatio": 1.0,
        "fileSize": 150000,
        "prompt": "cute pixel art character",
        "quality": "standard",
        "createdAt": "2025-10-19T12:00:00Z",
        "hasWatermark": true,
        "estimatedCost": 0.002
      }
    }
  ],
  "batchId": "batch_123456"
}
```

**Error Responses**:

```json
{
  "error": "Missing required parameters: style and prompt",
  "code": "INVALID_INPUT",
  "status": 400
}
```

```json
{
  "error": "Invalid batch size (must be 1-4)",
  "code": "INVALID_INPUT",
  "status": 400
}
```

**예제**:

```bash
curl -X POST http://localhost:3000/api/art/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "prompt": "dragon boss character for RPG game",
    "style": "pixel-art",
    "resolution": "512x512",
    "quality": "high"
  }'
```

### 이미지 편집

#### `POST /api/art/edit`

기존 이미지를 편집합니다.

**Request Body**:
```json
{
  "image": "data:image/png;base64,...",
  "prompt": "add more details to the character",
  "mask": "data:image/png;base64,..."
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `image` | string | ✅ | 원본 이미지 (Base64) |
| `prompt` | string | ✅ | 편집 지시사항 |
| `mask` | string | ❌ | 마스크 이미지 (Base64) |

**Response** (200 OK):
```json
{
  "data": "data:image/png;base64,...",
  "format": "png",
  "metadata": {
    "id": "img_edit_123456",
    "operation": "edit",
    "createdAt": "2025-10-19T12:00:00Z"
  }
}
```

### 스타일 전이

#### `POST /api/art/style-transfer`

참조 이미지의 스타일을 원본 이미지에 적용합니다.

**Request Body**:
```json
{
  "baseImage": "data:image/png;base64,...",
  "styleImage": "data:image/png;base64,...",
  "strength": 0.7
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| `baseImage` | string | ✅ | - | 기본 이미지 (Base64) |
| `styleImage` | string | ✅ | - | 스타일 참조 이미지 (Base64) |
| `strength` | number | ❌ | 0.7 | 강도 (0.0-1.0) |

**Response** (200 OK):
```json
{
  "data": "data:image/png;base64,...",
  "format": "png",
  "metadata": {
    "id": "img_style_123456",
    "operation": "style-transfer",
    "strength": 0.7,
    "createdAt": "2025-10-19T12:00:00Z"
  }
}
```

### 이미지 합성

#### `POST /api/art/compose`

여러 이미지를 합성합니다.

**Request Body**:
```json
{
  "images": [
    "data:image/png;base64,...",
    "data:image/png;base64,..."
  ],
  "prompt": "compose these images into a single scene",
  "layout": "grid"
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| `images` | array | ✅ | - | 이미지 배열 (2-10개) |
| `prompt` | string | ✅ | - | 합성 지시사항 |
| `layout` | string | ❌ | grid | 레이아웃 (grid, horizontal, vertical) |

**Response** (200 OK):
```json
{
  "data": "data:image/png;base64,...",
  "format": "png",
  "metadata": {
    "id": "img_compose_123456",
    "operation": "compose",
    "imageCount": 2,
    "layout": "grid",
    "createdAt": "2025-10-19T12:00:00Z"
  }
}
```

---

## 트윗 API

### 트윗 생성

#### `POST /api/tweet/generate`

AI가 트윗을 생성합니다.

**Request Headers**:
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Request Body**:
```json
{
  "prompt": "share tips about web development",
  "tone": "professional",
  "length": "medium",
  "hashtags": true,
  "emoji": true,
  "mentions": ["@google", "@vercel"]
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| `prompt` | string | ✅ | - | 트윗 콘텐츠 설명 (최대 500자) |
| `tone` | string | ❌ | casual | 톤 (casual, professional, funny, inspirational) |
| `length` | string | ❌ | medium | 길이 (short, medium, long) |
| `hashtags` | boolean | ❌ | true | 해시태그 포함 여부 |
| `emoji` | boolean | ❌ | true | 이모지 포함 여부 |
| `mentions` | array | ❌ | - | 멘션할 계정 배열 |

**Response** (200 OK):
```json
{
  "id": "tweet_123456",
  "text": "Web development tips: Always validate your inputs! 🚀 #webdev #coding @vercel",
  "tone": "professional",
  "length": "medium",
  "metadata": {
    "characterCount": 85,
    "hasHashtags": true,
    "hashtagCount": 2,
    "hasEmoji": true,
    "emojiCount": 1,
    "mentionCount": 1,
    "createdAt": "2025-10-19T12:00:00Z"
  }
}
```

**Error Responses**:

```json
{
  "error": "Prompt is required",
  "code": "MISSING_REQUIRED_PARAMETER",
  "status": 400
}
```

```json
{
  "error": "Prompt is too long (max 500 characters)",
  "code": "INVALID_INPUT",
  "status": 400
}
```

**예제**:

```bash
curl -X POST http://localhost:3000/api/tweet/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "prompt": "announce new features for web app",
    "tone": "professional",
    "length": "medium",
    "hashtags": true,
    "emoji": true
  }'
```

### 트윗 저장

#### `POST /api/tweet/save`

생성된 트윗을 저장합니다.

**Request Body**:
```json
{
  "tweet": {
    "id": "tweet_123456",
    "text": "Web development tips...",
    "metadata": {}
  },
  "tags": ["development", "tips"],
  "saveTo": "google-drive"
}
```

**Parameters**:

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `tweet` | object | ✅ | 트윗 데이터 |
| `tags` | array | ❌ | 태그 배열 |
| `saveTo` | string | ✅ | 저장 위치 (local, google-drive) |

**Response** (200 OK):
```json
{
  "id": "saved_tweet_123456",
  "fileId": "gd_file_123456",
  "status": "saved",
  "location": "google-drive",
  "createdAt": "2025-10-19T12:00:00Z"
}
```

---

## Google Drive API

### 파일 업로드

#### `POST /api/google-drive/upload`

파일을 Google Drive에 업로드합니다.

**Request Body**:
```json
{
  "file": {
    "data": "data:audio/wav;base64,...",
    "name": "music.wav",
    "mimeType": "audio/wav"
  },
  "metadata": {
    "generator": "audio-generator",
    "tags": ["music", "ambient"]
  }
}
```

**Response** (200 OK):
```json
{
  "fileId": "gd_123456",
  "name": "music.wav",
  "webViewLink": "https://drive.google.com/file/d/...",
  "status": "uploaded",
  "createdAt": "2025-10-19T12:00:00Z"
}
```

### 파일 목록

#### `GET /api/google-drive/list`

Google Drive의 파일 목록을 조회합니다.

**Query Parameters**:

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `fileType` | string | 파일 타입 (audio, image, tweet) |
| `limit` | number | 조회 개수 (기본 50) |
| `pageToken` | string | 페이지 토큰 |

**Response** (200 OK):
```json
{
  "files": [
    {
      "fileId": "gd_123456",
      "name": "music.wav",
      "mimeType": "audio/wav",
      "webViewLink": "https://drive.google.com/file/d/...",
      "createdTime": "2025-10-19T12:00:00Z"
    }
  ],
  "nextPageToken": "CAIQ...",
  "totalCount": 150
}
```

### 파일 삭제

#### `DELETE /api/google-drive/delete`

Google Drive에서 파일을 삭제합니다.

**Request Body**:
```json
{
  "fileId": "gd_123456"
}
```

**Response** (200 OK):
```json
{
  "fileId": "gd_123456",
  "status": "deleted"
}
```

---

## Rate Limiting

### 제한 사항

API 요청에는 다음과 같은 rate limit이 적용됩니다:

| 엔드포인트 | 제한 | 시간대 |
|----------|------|--------|
| `/api/audio/generate` | 50개 요청 | 1시간 |
| `/api/art/generate` | 100개 요청 | 1시간 |
| `/api/tweet/generate` | 200개 요청 | 1시간 |

### Rate Limit 헤더

모든 응답에 다음 헤더가 포함됩니다:

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1634659200
```

### Rate Limit 초과

Rate limit을 초과하면 429 상태 코드가 반환됩니다:

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429,
  "details": {
    "retryAfter": 3600
  }
}
```

---

## 상태 확인

### `GET /api/art/generate`

아트 생성기 API 상태를 확인합니다.

**Response** (200 OK):
```json
{
  "status": "ok",
  "message": "Art Generator API is running",
  "model": "gemini-2.5-flash-image"
}
```

---

## 참고 사항

### Base64 인코딩

이미지와 오디오는 Base64로 인코딩되어 전송됩니다:

```javascript
// 클라이언트에서 Base64 변환
const file = new File(["..."], "image.png");
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target.result; // data:image/png;base64,...
};
reader.readAsDataURL(file);
```

### 타임아웃

- 오디오 생성: 60초
- 이미지 생성: 60초
- 트윗 생성: 30초

### 파일 크기 제한

- 입력 이미지: 최대 20MB
- 출력 이미지: 최대 50MB (압축됨)
- 오디오: 최대 100MB

---

## 버전

**API Version**: v1.0.0
**Project Version**: v1.0.0
**Release Date**: 2025-10-19
**Last Updated**: 2025-10-19

---

## 추가 리소스

- [프로젝트 문서](./CLAUDE.md)
- [배포 가이드](./DEPLOY.md)
- [GitHub 리포지토리](https://github.com/devlikebear/aiapps)
- [Gemini API 문서](https://ai.google.dev/)
