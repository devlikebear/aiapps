# AI 아트 생성기 개선 계획

**작성일**: 2025-10-11
**담당자**: devlikebear
**목적**: AI 아트 생성기 기능 완성 및 사용자 경험 개선

---

## 📊 현황 분석

### ✅ 구현 완료 기능

- **기본 이미지 생성**: Gemini 2.5 Flash Image API 연동
- **프롬프트 빌더**: Character, Item, Environment 프리셋
- **사용 타입 선택**: Game, Illustration, Concept Art, Marketing
- **레퍼런스 이미지**: 업로드 및 influence 설정
- **갤러리**: IndexedDB 기반 이미지 저장/조회
- **태그 시스템**: 자동 태그 생성 및 필터링
- **배경 작업 큐**: localStorage 기반 FIFO 큐
- **이미지 편집**: `/api/art/edit` 엔드포인트 구현 완료 ✅
- **ImageEditor 컴포넌트**: 마스크 기반 편집, Before/After 비교 ✅
- **라이브러리 통합**: 통합 미디어 라이브러리에 갤러리 기능 통합 ✅
- **공유 UI 컴포넌트**: `@aiapps/ui` 패키지 구성 완료 ✅
- **이미지 합성**: `/api/art/compose` 엔드포인트 구현 완료 ✅
- **ImageComposer 컴포넌트**: 다중 이미지 합성, 프롬프트 가이드 ✅
- **라이브러리 멀티 셀렉트**: 이미지 선택 모드 및 합성 통합 ✅
- **스타일 전이**: `/api/art/style-transfer` 엔드포인트 구현 완료 ✅
- **StyleTransfer 컴포넌트**: 텍스트 프롬프트 기반 스타일 적용 ✅
- **참조 이미지 지원**: 선택적 스타일 참조 이미지 업로드 ✅

### ❌ 미구현 기능

- **고급 검색**: 텍스트 검색, 다중 필터 없음
- **프리셋 관리**: 사용자 정의 프리셋 저장 불가

### 🔧 개선 필요 영역

- **코드 품질**: 900줄 컴포넌트 분리 필요
- **상태 관리**: 과도한 useState 사용
- **에러 처리**: alert() 대신 Toast 사용
- **타입 안전성**: 중복 타입 정의 정리

---

## 🎯 우선순위별 작업 계획

### **Phase 1: 핵심 기능 완성** (Week 1)

#### 1.1 이미지 편집 기능 구현 ✅ **완료**

**목표**: Gemini Image API의 편집 기능 활용

**작업 항목**:

- [x] `app/api/art/edit/route.ts` 구현 ✅
  - 프롬프트 기반 이미지 편집
  - 영역 선택 편집 (마스크)
  - Gemini `generateContent` API 사용
- [x] `components/art/ImageEditor.tsx` 구현 ✅
  - 이미지 선택 UI
  - 편집 프롬프트 입력 (예제 프롬프트 제공)
  - 편집 영역 선택 도구 (Canvas 기반 마스크 그리기)
  - Before/After 비교
- [x] 라이브러리에서 편집 버튼 추가 ✅
  - 이미지 카드 및 상세 모달에 편집 버튼 통합
  - `/library` 페이지와 통합
- [x] 편집 결과 저장 기능 ✅

**완료된 PR**:

- PR #42: 이미지 편집 기능 구현
- PR #44: 라이브러리 통합
- PR #46: API 엔드포인트 수정
- PR #47: 지원되지 않는 파라미터 제거

**실제 소요**: 1일

---

#### 1.2 이미지 합성 기능 구현 ✅ **완료**

**목표**: 여러 이미지를 합성하여 새로운 이미지 생성

**작업 항목**:

- [x] `app/api/art/compose/route.ts` 구현 ✅
  - 다중 이미지 입력 처리 (2-10개)
  - 합성 프롬프트 적용
  - Gemini 2.5 Flash Image API 사용
- [x] `components/art/ImageComposer.tsx` 구현 ✅
  - 이미지 선택 UI (파일 업로드)
  - 합성 프롬프트 입력 및 예시
  - 이미지 추가/제거 기능
  - 합성 결과 미리보기
- [x] 라이브러리에서 다중 선택 모드 추가 ✅
  - 선택 모드 토글 버튼
  - 이미지 카드 체크박스
  - 플로팅 "이미지 합성" 버튼
- [x] 합성 이미지 메타데이터 저장 ✅

**완료된 PR**:

- PR #51: 이미지 합성 기능 구현 (API + ImageComposer + 라이브러리 통합)

**실제 소요**: 1일

---

#### 1.3 스타일 전이 기능 구현 ✅ **완료**

**목표**: 텍스트 프롬프트로 이미지에 예술적 스타일 적용

**작업 항목**:

- [x] `app/api/art/style-transfer/route.ts` 구현 ✅
  - 베이스 이미지 + 스타일 프롬프트 입력
  - Gemini 2.5 Flash Image API 사용
  - 레이트 리밋 및 에러 핸들링
- [x] `components/art/StyleTransfer.tsx` 구현 ✅
  - 베이스 이미지 표시
  - 스타일 프롬프트 입력 (8개 예시 제공)
  - 선택적 스타일 참조 이미지 업로드
  - 결과 미리보기 및 갤러리 저장
- [x] 라이브러리 통합 ✅
  - 이미지 카드 및 상세 모달에 버튼 추가

**완료된 PR**:

- PR #53: 스타일 전이 기능 구현 (API + StyleTransfer + 라이브러리 통합)

**실제 소요**: 1일

---

#### 1.4 갤러리 검색 및 필터링 강화

**목표**: 대량의 이미지를 효율적으로 관리

**작업 항목**:
- [ ] 텍스트 검색 구현 (프롬프트, 태그)
- [ ] 다중 필터 UI
  - 스타일 필터 (체크박스)
  - 해상도 필터 (범위 선택)
  - 품질 필터
  - 날짜 범위 선택
- [ ] 정렬 옵션
  - 날짜순 (최신/오래된)
  - 이름순
  - 파일 크기순
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 필터 상태 URL 쿼리 저장

**구현 예시**:
```typescript
interface GalleryFilters {
  searchQuery?: string;
  styles?: ArtStyle[];
  resolutions?: string[];
  qualities?: QualityPreset[];
  dateRange?: { start: Date; end: Date };
  sortBy: 'date' | 'name' | 'size';
  sortOrder: 'asc' | 'desc';
}

// app/apps/art-generator/gallery/page.tsx
const filteredImages = useMemo(() => {
  return applyFilters(imageList, filters);
}, [imageList, filters]);
```

**예상 소요**: 1-2일

---

#### 1.5 배치 작업 관리 UI 개선

**목표**: 작업 큐 진행 상황 시각화 및 제어

**작업 항목**:
- [ ] `components/queue/JobQueueManager.tsx` 생성
  - 큐에 있는 작업 목록
  - 각 작업의 진행률 표시
  - 작업 취소 버튼
  - 우선순위 변경 (드래그 앤 드롭)
- [ ] 헤더에 작업 큐 아이콘 추가 (진행 중일 때 표시)
- [ ] 실패한 작업 재시도 메커니즘
- [ ] 작업 완료 알림 개선 (Toast)

**현재 문제**:
- `app/apps/art-generator/create/page.tsx:264-271`에서 큐 추가 후 피드백 부족
- 레퍼런스 이미지 사용 시 큐 우회 → 일관성 없음

**개선안**:
```typescript
// lib/queue/types.ts
interface ImageJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  prompt: string;
  style: ArtStyle;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  priority: number; // 1-10
}
```

**예상 소요**: 1-2일

---

### **Phase 2: 사용자 경험 개선** (Week 2)

#### 2.1 프리셋 관리 시스템

**목표**: 사용자가 자주 사용하는 설정을 저장/재사용

**작업 항목**:
- [ ] `lib/storage/preset-db.ts` 생성 (IndexedDB)
- [ ] 프리셋 저장 UI
  - 현재 설정 저장 버튼
  - 프리셋 이름 입력
  - 태그 추가
- [ ] 프리셋 갤러리 페이지
  - 저장된 프리셋 목록
  - 프리셋 미리보기
  - 불러오기/삭제 기능
- [ ] JSON Export/Import 기능
  - 프리셋 공유 기능
  - 커뮤니티 프리셋 가져오기
- [ ] 기본 프리셋 제공
  - "Fantasy RPG Character"
  - "Pixel Art Platformer"
  - "Concept Art Landscape"

**데이터 구조**:
```typescript
interface UserPreset {
  id: string;
  name: string;
  description?: string;
  assetType: 'character' | 'item' | 'environment';
  preset: CharacterPreset | ItemPreset | EnvironmentPreset;
  style: ArtStyle;
  resolution: string;
  quality: QualityPreset;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  usageCount: number;
}
```

**예상 소요**: 2-3일

---

#### 2.2 레퍼런스 이미지 관리 개선

**목표**: 레퍼런스 이미지 재사용성 향상

**작업 항목**:
- [ ] 레퍼런스 이미지 라이브러리 (IndexedDB)
  - 업로드한 레퍼런스 저장
  - 태그 및 카테고리 분류
  - 검색 기능
- [ ] 갤러리에서 레퍼런스로 추가
  - "레퍼런스로 사용" 버튼
  - 생성 페이지로 자동 전달
- [ ] 레퍼런스 이미지 편집 도구
  - 크롭 기능
  - 리사이즈
  - 밝기/대비 조절
- [ ] 레퍼런스 프리셋
  - 자주 사용하는 레퍼런스 조합 저장
  - "Character + Background" 프리셋

**UI 개선**:
```typescript
// components/art/ReferenceLibrary.tsx
interface ReferenceImage {
  id: string;
  data: string; // base64
  name: string;
  tags: string[];
  category: 'character' | 'background' | 'item' | 'style';
  usageCount: number;
  createdAt: Date;
}
```

**예상 소요**: 2-3일

---

#### 2.3 관련 이미지 추천 알고리즘 강화

**목표**: 더 정확한 이미지 추천 제공

**현재 구현**:
- `app/apps/art-generator/create/page.tsx:154-188`
- 단순 태그 매칭만 사용

**개선 사항**:
- [ ] 프롬프트 유사도 분석
  - TF-IDF 벡터화
  - 코사인 유사도 계산
- [ ] 시각적 특성 우선순위
  - 해상도 유사도 (±20%)
  - 비율 유사도 (동일 비율 우선)
- [ ] 사용자 선호도 학습
  - 다운로드 기록 추적
  - 자주 사용하는 스타일 가중치
- [ ] 추천 이유 표시
  - "프롬프트 유사도: 85%"
  - "동일 스타일"

**구현**:
```typescript
// lib/utils/recommendation.ts
interface RecommendationScore {
  imageId: string;
  score: number;
  reasons: string[];
}

function calculateSimilarity(
  currentSettings: {
    prompt: string;
    style: ArtStyle;
    resolution: string;
  },
  image: StoredImage
): RecommendationScore {
  let score = 0;
  const reasons: string[] = [];

  // 태그 매칭 (30%)
  const tagMatch = calculateTagSimilarity(currentSettings, image.tags);
  score += tagMatch * 0.3;
  if (tagMatch > 0.5) reasons.push(`태그 일치: ${Math.round(tagMatch * 100)}%`);

  // 프롬프트 유사도 (40%)
  const promptSimilarity = calculatePromptSimilarity(
    currentSettings.prompt,
    image.metadata.prompt
  );
  score += promptSimilarity * 0.4;
  if (promptSimilarity > 0.5) reasons.push(`프롬프트 유사: ${Math.round(promptSimilarity * 100)}%`);

  // 스타일 일치 (20%)
  if (currentSettings.style === image.metadata.style) {
    score += 0.2;
    reasons.push('동일 스타일');
  }

  // 해상도 유사도 (10%)
  const resSimilarity = calculateResolutionSimilarity(
    currentSettings.resolution,
    `${image.metadata.width}x${image.metadata.height}`
  );
  score += resSimilarity * 0.1;

  return { imageId: image.id, score, reasons };
}
```

**예상 소요**: 1-2일

---

#### 2.4 코드 리팩토링 및 품질 개선

**목표**: 유지보수성 향상 및 버그 감소

**작업 항목**:
- [ ] `app/apps/art-generator/create/page.tsx` 분리 (900줄 → 300줄 이하)
  - `components/art/GenerationForm.tsx` 추출
  - `components/art/GeneratedImageGrid.tsx` 추출
  - `components/art/RelatedImagesSection.tsx` 추출
  - `components/art/ImageDetailModal.tsx` 추출
- [ ] 공통 타입 정리
  - `lib/types/image.ts` 생성
  - `StoredImage` 타입 통합
- [ ] 상태 관리 개선
  - Form 상태를 Zustand 스토어로 이동
  - 또는 React Hook Form 적용
- [ ] 에러 처리 통일
  - `alert()` → Toast 컴포넌트
  - 에러 바운더리 추가
- [ ] ESLint 규칙 강화
  - `no-console` 경고 제거
  - `exhaustive-deps` 규칙 준수

**리팩토링 예시**:
```typescript
// Before: app/apps/art-generator/create/page.tsx (900줄)
export default function ArtCreatePage() {
  // 많은 useState...
  // 많은 함수...
  // 거대한 JSX...
}

// After: 분리된 컴포넌트
// components/art/GenerationForm.tsx
export function GenerationForm({ onGenerate }: Props) { ... }

// components/art/GeneratedImageGrid.tsx
export function GeneratedImageGrid({ images, onDownload, onDelete }: Props) { ... }

// components/art/RelatedImagesSection.tsx
export function RelatedImagesSection({ images, onImageSelect }: Props) { ... }

// app/apps/art-generator/create/page.tsx (300줄)
export default function ArtCreatePage() {
  return (
    <div>
      <GenerationForm onGenerate={handleGenerate} />
      <GeneratedImageGrid images={generatedImages} ... />
      <RelatedImagesSection images={relatedImages} ... />
    </div>
  );
}
```

**예상 소요**: 2-3일

---

### **Phase 3: 고급 기능 (선택 사항)** (Week 3+)

#### 3.1 이미지 버전 관리

**목표**: 동일 프롬프트의 여러 시드 결과 관리

**작업 항목**:
- [ ] 버전 그룹 생성 (동일 프롬프트)
- [ ] 버전 간 비교 UI
  - Side-by-side 비교
  - 슬라이드 비교
- [ ] 베스트 버전 마킹
- [ ] 버전 히스토리 타임라인

**Use Case**:
- 같은 프롬프트로 10개 생성 → 가장 마음에 드는 것 선택
- A/B 테스트

**예상 소요**: 2일

---

#### 3.2 프로젝트/컬렉션 관리

**목표**: 이미지를 프로젝트별로 조직화

**작업 항목**:
- [ ] 프로젝트 생성 UI
- [ ] 이미지를 프로젝트에 추가
- [ ] 프로젝트 갤러리 페이지
- [ ] 프로젝트 공유 기능
- [ ] 메모 및 주석 추가

**데이터 구조**:
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  imageIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**예상 소요**: 2-3일

---

#### 3.3 고급 프롬프트 도구

**목표**: 프롬프트 작성 생산성 향상

**작업 항목**:
- [ ] 프롬프트 히스토리
  - 최근 사용한 프롬프트 자동 저장
  - 히스토리에서 재사용
- [ ] 프롬프트 템플릿
  - `{character_type}` 같은 변수 지원
  - 템플릿 갤러리
- [ ] 부정 프롬프트 (Negative Prompt)
  - "제외할 요소" 입력
  - API 지원 여부 확인 필요
- [ ] AI 프롬프트 추천
  - 짧은 입력 → 확장된 프롬프트 생성
  - GPT API 활용 (선택 사항)

**예상 소요**: 2-3일

---

#### 3.4 이미지 공유 기능

**목표**: IndexedDB에 저장된 이미지를 다양한 플랫폼으로 공유

**작업 항목**:

##### 3.4.1 소셜 미디어 공유 (Web Share API)
- [ ] `lib/utils/share.ts` 유틸리티 생성
  - Web Share API 지원 여부 체크
  - 이미지 Blob 변환
  - 메타데이터 첨부 (프롬프트, 태그)
- [ ] 갤러리/생성 페이지에 공유 버튼 추가
  - Twitter/X 공유
  - Facebook 공유
  - Instagram (모바일 전용)
  - LinkedIn
  - 클립보드 복사
- [ ] 공유 텍스트 커스터마이징
  - 프롬프트 포함 옵션
  - 해시태그 자동 추가 (#AIArt, #GeminiAI 등)
  - 워터마크 옵션

**구현 예시**:
```typescript
// lib/utils/share.ts
interface ShareImageOptions {
  image: StoredImage;
  includePrompt?: boolean;
  includeHashtags?: boolean;
  addWatermark?: boolean;
}

async function shareImage(options: ShareImageOptions): Promise<void> {
  const { image, includePrompt = true, includeHashtags = true } = options;

  // Base64 → Blob 변환
  const blob = await base64ToBlob(image.data);
  const file = new File([blob], `ai-art-${image.id}.png`, { type: 'image/png' });

  // 공유 텍스트 구성
  let text = 'AI로 생성한 아트 🎨\n\n';
  if (includePrompt) {
    text += `${image.metadata.prompt}\n\n`;
  }
  if (includeHashtags) {
    text += `#AIArt #GeminiAI #${image.metadata.style}`;
  }

  // Web Share API 사용
  if (navigator.share) {
    await navigator.share({
      title: 'AI Generated Art',
      text,
      files: [file],
    });
  } else {
    // Fallback: 플랫폼별 URL 생성
    shareToTwitter(text, image);
  }
}

// 플랫폼별 공유 URL 생성
function shareToTwitter(text: string, image: StoredImage) {
  // 1. 이미지를 임시 URL로 업로드 (선택 사항)
  // 2. Twitter Intent URL 생성
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, '_blank');
}
```

##### 3.4.2 이메일 공유
- [ ] 이메일 클라이언트 연동
  - `mailto:` 프로토콜 사용
  - 이미지를 Data URL로 임베드
  - 또는 이미지를 첨부파일로 추가 (제한적)
- [ ] 이메일 템플릿
  - 제목 자동 생성
  - 본문에 프롬프트 및 메타데이터 포함
  - HTML 이메일 지원

**구현 예시**:
```typescript
// lib/utils/share.ts
function shareViaEmail(image: StoredImage) {
  const subject = encodeURIComponent(`AI 생성 아트 - ${image.metadata.style}`);
  const body = encodeURIComponent(`
안녕하세요,

AI로 생성한 아트를 공유합니다!

프롬프트: ${image.metadata.prompt}
스타일: ${image.metadata.style}
해상도: ${image.metadata.width}×${image.metadata.height}

생성일: ${new Date(image.createdAt).toLocaleDateString('ko-KR')}

첨부된 이미지를 확인해주세요.
  `.trim());

  // 이미지를 Data URL로 포함 (제한적 - 크기 제한)
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = mailtoUrl;

  // 또는 사용자에게 수동 다운로드 후 첨부 안내
}
```

##### 3.4.3 Google Drive 업로드
- [ ] Google Drive API 연동
  - OAuth 2.0 인증 구현
  - `@react-oauth/google` 라이브러리 사용
- [ ] 드라이브 폴더 선택 UI
  - 폴더 브라우저
  - 새 폴더 생성 옵션
- [ ] 업로드 진행 상태 표시
- [ ] 배치 업로드 (여러 이미지 동시 업로드)

**구현 예시**:
```typescript
// lib/integrations/google-drive.ts
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface GoogleDriveUploadOptions {
  image: StoredImage;
  folderId?: string; // 선택적 폴더 ID
  onProgress?: (progress: number) => void;
}

class GoogleDriveUploader {
  private accessToken: string | null = null;

  async authenticate(): Promise<void> {
    // OAuth 2.0 인증 플로우
    const login = useGoogleLogin({
      onSuccess: (tokenResponse) => {
        this.accessToken = tokenResponse.access_token;
      },
      scope: 'https://www.googleapis.com/auth/drive.file',
    });

    login();
  }

  async uploadImage(options: GoogleDriveUploadOptions): Promise<string> {
    const { image, folderId, onProgress } = options;

    if (!this.accessToken) {
      throw new Error('Google Drive 인증이 필요합니다');
    }

    // Base64 → Blob 변환
    const blob = await base64ToBlob(image.data);

    // 메타데이터 구성
    const metadata = {
      name: `ai-art-${image.id}.png`,
      mimeType: 'image/png',
      description: image.metadata.prompt,
      parents: folderId ? [folderId] : [],
    };

    // Multipart 업로드
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error('Google Drive 업로드 실패');
    }

    const result = await response.json();
    return result.id; // 업로드된 파일 ID 반환
  }

  // 배치 업로드
  async uploadBatch(images: StoredImage[], folderId?: string): Promise<string[]> {
    const uploadPromises = images.map((image) =>
      this.uploadImage({ image, folderId })
    );
    return Promise.all(uploadPromises);
  }
}
```

##### 3.4.4 UI/UX 개선
- [ ] 공유 모달 컴포넌트 생성
  - 플랫폼 선택 (아이콘 그리드)
  - 공유 옵션 (프롬프트 포함, 워터마크 등)
  - 미리보기
- [ ] 갤러리 다중 선택 모드
  - 여러 이미지 일괄 공유
  - Google Drive 배치 업로드
- [ ] 공유 히스토리
  - 공유한 이미지 추적
  - 공유 횟수 통계
- [ ] 공유 링크 생성 (선택 사항)
  - 임시 공개 URL 생성
  - 만료 시간 설정
  - 비밀번호 보호

**컴포넌트 구조**:
```typescript
// components/art/ShareModal.tsx
interface ShareModalProps {
  image: StoredImage;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ image, isOpen, onClose }: ShareModalProps) {
  const [shareOptions, setShareOptions] = useState({
    includePrompt: true,
    includeHashtags: true,
    addWatermark: false,
  });

  const handleShare = async (platform: 'twitter' | 'facebook' | 'email' | 'drive') => {
    switch (platform) {
      case 'twitter':
        await shareToTwitter(image, shareOptions);
        break;
      case 'facebook':
        await shareToFacebook(image, shareOptions);
        break;
      case 'email':
        shareViaEmail(image);
        break;
      case 'drive':
        await uploadToGoogleDrive(image);
        break;
    }

    // 공유 히스토리 저장
    await saveShareHistory(image.id, platform);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">이미지 공유</h2>

        {/* 이미지 미리보기 */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image src={`data:image/png;base64,${image.data}`} alt="" fill />
        </div>

        {/* 공유 옵션 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shareOptions.includePrompt}
              onChange={(e) => setShareOptions({ ...shareOptions, includePrompt: e.target.checked })}
            />
            <span>프롬프트 포함</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shareOptions.includeHashtags}
              onChange={(e) => setShareOptions({ ...shareOptions, includeHashtags: e.target.checked })}
            />
            <span>해시태그 포함</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shareOptions.addWatermark}
              onChange={(e) => setShareOptions({ ...shareOptions, addWatermark: e.target.checked })}
            />
            <span>워터마크 추가</span>
          </label>
        </div>

        {/* 플랫폼 선택 */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleShare('twitter')} className="p-4 border rounded-lg hover:bg-gray-50">
            <Twitter className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Twitter</span>
          </button>
          <button onClick={() => handleShare('facebook')} className="p-4 border rounded-lg hover:bg-gray-50">
            <Facebook className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Facebook</span>
          </button>
          <button onClick={() => handleShare('email')} className="p-4 border rounded-lg hover:bg-gray-50">
            <Mail className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">이메일</span>
          </button>
          <button onClick={() => handleShare('drive')} className="p-4 border rounded-lg hover:bg-gray-50">
            <Cloud className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Google Drive</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

**보안 고려사항**:
- [ ] Google Drive OAuth 토큰 안전한 저장
- [ ] 공유 링크 만료 시간 설정
- [ ] 공유 시 개인정보 제거 (API 키 등)
- [ ] Rate Limiting (과도한 공유 방지)

**예상 소요**: 3-4일

---

#### 3.5 갤러리 내보내기/가져오기 기능

**목표**: IndexedDB 갤러리를 백업하고 다른 환경에서 복원

**작업 항목**:

##### 3.5.1 갤러리 내보내기 (Export)
- [ ] `lib/utils/gallery-export.ts` 유틸리티 생성
  - 선택된 이미지 직렬화
  - 매니페스트 JSON 생성
  - ZIP 압축 (JSZip 라이브러리)
- [ ] 선택 모드 UI
  - 전체 선택/해제 토글
  - 개별 이미지 선택 (체크박스)
  - 선택 개수 표시
  - 필터된 이미지만 선택 옵션
- [ ] 내보내기 옵션 모달
  - 이미지 품질 선택 (원본/압축)
  - 메타데이터 포함 여부
  - 파일명 커스터마이징
- [ ] 진행률 표시
  - 압축 진행률 바
  - 예상 파일 크기 표시
  - 취소 기능

**매니페스트 구조**:
```typescript
// manifest.json
interface GalleryManifest {
  version: '1.0';
  exportedAt: string; // ISO 8601
  totalImages: number;
  images: Array<{
    id: string;
    filename: string; // 'image-001.png'
    metadata: {
      prompt: string;
      style: ArtStyle;
      width: number;
      height: number;
      quality: QualityPreset;
      aspectRatio: string;
      seed?: number;
      createdAt: string;
    };
    tags: string[];
  }>;
  // 통계 정보
  statistics?: {
    styles: Record<ArtStyle, number>;
    resolutions: Record<string, number>;
    dateRange: { start: string; end: string };
  };
}
```

**구현 예시**:
```typescript
// lib/utils/gallery-export.ts
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportOptions {
  images: StoredImage[];
  includeMetadata?: boolean;
  imageQuality?: 'original' | 'compressed';
  fileName?: string;
}

async function exportGallery(options: ExportOptions): Promise<void> {
  const {
    images,
    includeMetadata = true,
    imageQuality = 'original',
    fileName = 'ai-gallery-export',
  } = options;

  const zip = new JSZip();

  // 매니페스트 생성
  const manifest: GalleryManifest = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalImages: images.length,
    images: [],
  };

  // 이미지 추가
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filename = `image-${String(i + 1).padStart(3, '0')}.png`;

    // Base64 → Blob 변환
    let blob = await base64ToBlob(image.data);

    // 압축 옵션
    if (imageQuality === 'compressed') {
      blob = await compressImage(blob, 0.8);
    }

    // ZIP에 이미지 추가
    zip.file(filename, blob);

    // 매니페스트에 정보 추가
    manifest.images.push({
      id: image.id,
      filename,
      metadata: image.metadata,
      tags: image.tags || [],
    });
  }

  // 통계 정보 추가
  if (includeMetadata) {
    manifest.statistics = calculateStatistics(images);
  }

  // 매니페스트 JSON 추가
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // ZIP 생성 및 다운로드
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  saveAs(blob, `${fileName}-${Date.now()}.zip`);
}

// 통계 계산
function calculateStatistics(images: StoredImage[]) {
  const styles: Record<string, number> = {};
  const resolutions: Record<string, number> = {};
  let minDate = new Date();
  let maxDate = new Date(0);

  images.forEach((image) => {
    // 스타일 통계
    const style = image.metadata.style || 'unknown';
    styles[style] = (styles[style] || 0) + 1;

    // 해상도 통계
    const resolution = `${image.metadata.width}×${image.metadata.height}`;
    resolutions[resolution] = (resolutions[resolution] || 0) + 1;

    // 날짜 범위
    const date = new Date(image.createdAt);
    if (date < minDate) minDate = date;
    if (date > maxDate) maxDate = date;
  });

  return {
    styles,
    resolutions,
    dateRange: {
      start: minDate.toISOString(),
      end: maxDate.toISOString(),
    },
  };
}
```

##### 3.5.2 갤러리 가져오기 (Import)
- [ ] `lib/utils/gallery-import.ts` 유틸리티 생성
  - ZIP 파일 파싱
  - 매니페스트 검증
  - IndexedDB에 이미지 저장
  - 중복 처리 전략
- [ ] 가져오기 UI
  - 파일 드래그 앤 드롭
  - 파일 선택 버튼
  - 가져오기 옵션 설정
- [ ] 중복 처리 옵션
  - 건너뛰기 (Skip)
  - 덮어쓰기 (Overwrite)
  - 새 ID로 저장 (Keep Both)
  - 사용자에게 선택 요청
- [ ] 가져오기 프리뷰
  - 매니페스트 정보 표시
  - 이미지 미리보기 (최대 10개)
  - 통계 요약
- [ ] 진행률 표시
  - 압축 해제 진행률
  - 이미지 저장 진행률
  - 성공/실패 개수

**구현 예시**:
```typescript
// lib/utils/gallery-import.ts
import JSZip from 'jszip';
import { saveImage } from '@/lib/storage/indexed-db';

interface ImportOptions {
  file: File;
  duplicateStrategy?: 'skip' | 'overwrite' | 'keep-both' | 'ask';
  onProgress?: (progress: number, current: number, total: number) => void;
}

interface ImportResult {
  success: number;
  skipped: number;
  failed: number;
  errors: Array<{ filename: string; error: string }>;
}

async function importGallery(options: ImportOptions): Promise<ImportResult> {
  const { file, duplicateStrategy = 'skip', onProgress } = options;

  const result: ImportResult = {
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  try {
    // ZIP 파일 로드
    const zip = await JSZip.loadAsync(file);

    // 매니페스트 읽기
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('매니페스트 파일이 없습니다');
    }

    const manifestText = await manifestFile.async('text');
    const manifest: GalleryManifest = JSON.parse(manifestText);

    // 버전 확인
    if (manifest.version !== '1.0') {
      throw new Error(`지원하지 않는 버전입니다: ${manifest.version}`);
    }

    // 기존 이미지 ID 목록 가져오기
    const existingImages = await getAllImages();
    const existingIds = new Set(existingImages.map((img) => img.id));

    // 각 이미지 처리
    for (let i = 0; i < manifest.images.length; i++) {
      const imageInfo = manifest.images[i];

      try {
        // 중복 체크
        if (existingIds.has(imageInfo.id)) {
          if (duplicateStrategy === 'skip') {
            result.skipped++;
            continue;
          } else if (duplicateStrategy === 'keep-both') {
            // 새 ID 생성
            imageInfo.id = `${imageInfo.id}-${Date.now()}`;
          }
          // 'overwrite'인 경우 그대로 진행
        }

        // 이미지 파일 읽기
        const imageFile = zip.file(imageInfo.filename);
        if (!imageFile) {
          throw new Error(`이미지 파일을 찾을 수 없습니다: ${imageInfo.filename}`);
        }

        const blob = await imageFile.async('blob');
        const base64 = await blobToBase64(blob);

        // IndexedDB에 저장
        await saveImage({
          id: imageInfo.id,
          data: base64,
          metadata: imageInfo.metadata,
          tags: imageInfo.tags,
          createdAt: new Date(imageInfo.metadata.createdAt),
        });

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          filename: imageInfo.filename,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        });
      }

      // 진행률 업데이트
      if (onProgress) {
        const progress = ((i + 1) / manifest.images.length) * 100;
        onProgress(progress, i + 1, manifest.images.length);
      }
    }

    return result;
  } catch (error) {
    throw new Error(
      `가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

// Blob → Base64 변환
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // "data:image/png;base64," 부분 제거
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

##### 3.5.3 UI 컴포넌트
- [ ] `components/art/GalleryExportModal.tsx`
  - 선택 모드 토글
  - 내보내기 옵션 설정
  - 진행률 표시
- [ ] `components/art/GalleryImportModal.tsx`
  - 파일 업로드 영역
  - 매니페스트 프리뷰
  - 중복 처리 옵션
  - 가져오기 결과 표시
- [ ] 갤러리 페이지에 버튼 추가
  - "내보내기" 버튼 (헤더)
  - "가져오기" 버튼 (헤더)
  - 선택 모드 토글

**컴포넌트 예시**:
```typescript
// components/art/GalleryExportModal.tsx
interface GalleryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: StoredImage[];
}

export function GalleryExportModal({
  isOpen,
  onClose,
  selectedImages,
}: GalleryExportModalProps) {
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    imageQuality: 'original' as 'original' | 'compressed',
    fileName: 'ai-gallery-export',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportGallery({
        images: selectedImages,
        ...exportOptions,
      });
      onClose();
    } catch (error) {
      alert(`내보내기 실패: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const estimatedSize = selectedImages.reduce((acc, img) => {
    const size = img.data.length * 0.75; // Base64 → bytes
    return acc + size;
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">갤러리 내보내기</h2>

        {/* 선택 정보 */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">선택된 이미지</div>
              <div className="text-2xl font-bold">{selectedImages.length}개</div>
            </div>
            <div>
              <div className="text-gray-400">예상 파일 크기</div>
              <div className="text-2xl font-bold">
                {(estimatedSize / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          </div>
        </div>

        {/* 내보내기 옵션 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">파일명</label>
            <input
              type="text"
              value={exportOptions.fileName}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, fileName: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              placeholder="ai-gallery-export"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">이미지 품질</label>
            <select
              value={exportOptions.imageQuality}
              onChange={(e) =>
                setExportOptions({
                  ...exportOptions,
                  imageQuality: e.target.value as 'original' | 'compressed',
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <option value="original">원본 (최고 품질)</option>
              <option value="compressed">압축 (파일 크기 감소)</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportOptions.includeMetadata}
              onChange={(e) =>
                setExportOptions({
                  ...exportOptions,
                  includeMetadata: e.target.checked,
                })
              }
            />
            <span className="text-sm">메타데이터 및 통계 포함</span>
          </label>
        </div>

        {/* 진행률 */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>내보내는 중...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || selectedImages.length === 0}
            className="flex-1 app-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '내보내는 중...' : '내보내기'}
          </button>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 app-button-secondary"
          >
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

```typescript
// components/art/GalleryImportModal.tsx
export function GalleryImportModal({ isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'overwrite' | 'keep-both'>('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);

    // 매니페스트 미리보기
    try {
      const zip = await JSZip.loadAsync(selectedFile);
      const manifestFile = zip.file('manifest.json');
      if (manifestFile) {
        const manifestText = await manifestFile.async('text');
        const parsedManifest = JSON.parse(manifestText);
        setManifest(parsedManifest);
      }
    } catch (error) {
      alert('올바른 갤러리 파일이 아닙니다');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await importGallery({
        file,
        duplicateStrategy,
        onProgress: (_, current, total) => {
          setProgress({ current, total });
        },
      });

      setResult(importResult);

      if (importResult.failed === 0) {
        alert(`✅ ${importResult.success}개 이미지 가져오기 완료!`);
        onClose();
      }
    } catch (error) {
      alert(`가져오기 실패: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">갤러리 가져오기</h2>

        {/* 파일 업로드 */}
        {!file && (
          <div
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.zip';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileSelect(file);
              };
              input.click();
            }}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">ZIP 파일을 드래그하거나 클릭하세요</p>
            <p className="text-sm text-gray-400">갤러리 내보내기로 생성된 파일만 지원됩니다</p>
          </div>
        )}

        {/* 매니페스트 프리뷰 */}
        {manifest && !isImporting && !result && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-semibold mb-3">가져올 데이터</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">총 이미지</div>
                  <div className="text-xl font-bold">{manifest.totalImages}개</div>
                </div>
                <div>
                  <div className="text-gray-400">내보낸 날짜</div>
                  <div className="text-sm">
                    {new Date(manifest.exportedAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            </div>

            {/* 중복 처리 전략 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                중복 이미지 처리 방법
              </label>
              <select
                value={duplicateStrategy}
                onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              >
                <option value="skip">건너뛰기 (Skip)</option>
                <option value="overwrite">덮어쓰기 (Overwrite)</option>
                <option value="keep-both">둘 다 유지 (Keep Both)</option>
              </select>
            </div>

            <button onClick={handleImport} className="w-full app-button">
              가져오기 시작
            </button>
          </div>
        )}

        {/* 진행률 */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>가져오는 중...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <h3 className="font-semibold">가져오기 완료</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-green-400">
                <div className="text-xs text-gray-400">성공</div>
                <div className="text-xl font-bold">{result.success}</div>
              </div>
              <div className="text-yellow-400">
                <div className="text-xs text-gray-400">건너뜀</div>
                <div className="text-xl font-bold">{result.skipped}</div>
              </div>
              <div className="text-red-400">
                <div className="text-xs text-gray-400">실패</div>
                <div className="text-xl font-bold">{result.failed}</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-red-400">
                  오류 상세 ({result.errors.length}개)
                </summary>
                <ul className="mt-2 space-y-1 text-gray-400 max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      {err.filename}: {err.error}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
```

**필요한 라이브러리**:
```bash
npm install jszip file-saver
npm install --save-dev @types/jszip @types/file-saver
```

**예상 소요**: 2-3일

---

#### 3.6 소셜 및 통계 기능

**목표**: 사용자 참여 증대

**작업 항목**:
- [ ] 생성 통계 대시보드
  - 총 생성 수
  - 가장 많이 사용한 스타일
  - 월별/주별 생성 추이
  - 가장 많이 공유한 이미지
- [ ] 공유 가능한 갤러리 링크
  - 공개 URL 생성
  - 비밀번호 보호 옵션
- [ ] 커뮤니티 갤러리 (선택 사항)
  - 다른 사용자 작품 둘러보기
  - 좋아요 기능

**예상 소요**: 3-5일

---

## 📦 작업 순서 요약

### ✅ Week 1: 핵심 기능 완성
1. 이미지 편집 API + UI (2-3일)
2. 이미지 합성 API + UI (2-3일)
3. 스타일 전이 API + UI (2일)
4. 갤러리 검색/필터링 (1-2일)
5. 배치 작업 UI (1-2일)

**예상 소요**: 8-12일

---

### ✅ Week 2: UX 개선
1. 프리셋 관리 시스템 (2-3일)
2. 레퍼런스 이미지 관리 (2-3일)
3. 추천 알고리즘 강화 (1-2일)
4. 코드 리팩토링 (2-3일)

**예상 소요**: 7-11일

---

### 🔮 Week 3+: 고급 기능 (선택 사항)
1. 이미지 버전 관리 (2일)
2. 프로젝트/컬렉션 (2-3일)
3. 고급 프롬프트 도구 (2-3일)
4. **이미지 공유 기능** (3-4일)
   - SNS 공유 (Twitter, Facebook, Instagram)
   - 이메일 공유
   - Google Drive 업로드
   - 공유 모달 UI
5. **갤러리 내보내기/가져오기** (2-3일)
   - ZIP 압축 내보내기 (매니페스트 + 이미지)
   - ZIP 파일 가져오기 (중복 처리)
   - 선택 모드 UI
   - 진행률 표시
6. 소셜/통계 기능 (3-5일)

**예상 소요**: 14-20일

---

## 🧪 테스트 계획

### Unit Tests (Vitest)
- [ ] `lib/utils/recommendation.ts` 유사도 계산
- [ ] `lib/storage/preset-db.ts` CRUD 작업
- [ ] `lib/art/prompt-builder.ts` 프롬프트 생성
- [ ] `lib/utils/gallery-export.ts` 갤러리 내보내기
- [ ] `lib/utils/gallery-import.ts` 갤러리 가져오기

### Integration Tests (Vitest)
- [ ] `/api/art/edit` 엔드포인트
- [ ] `/api/art/compose` 엔드포인트
- [ ] `/api/art/style-transfer` 엔드포인트
- [ ] IndexedDB 작업 (갤러리 필터링)
- [ ] ZIP 압축/해제 (JSZip)
- [ ] 매니페스트 검증

### E2E Tests (Playwright)
- [ ] 이미지 편집 플로우
- [ ] 이미지 합성 플로우
- [ ] 스타일 전이 플로우
- [ ] 갤러리 검색/필터링
- [ ] 프리셋 저장/불러오기
- [ ] 이미지 공유 플로우 (SNS, 이메일, Google Drive)
- [ ] 갤러리 내보내기/가져오기 플로우

---

## 📊 성공 지표

### 기능 완성도
- [ ] Gemini Image API 4가지 기능 모두 구현 (생성/편집/합성/스타일전이)
- [ ] 사용자 정의 프리셋 시스템 작동
- [ ] 갤러리 검색/필터링 성능 (1000개 이미지에서 <100ms)

### 코드 품질
- [ ] 모든 컴포넌트 300줄 이하
- [ ] TypeScript strict mode 에러 0개
- [ ] ESLint 경고 0개
- [ ] 테스트 커버리지 ≥70%

### 사용자 경험
- [ ] 갤러리 로딩 시간 <1초
- [ ] 배치 작업 진행률 실시간 표시
- [ ] 에러 발생 시 명확한 메시지 제공
- [ ] 모바일 반응형 100% 지원

---

## 🔗 관련 문서

- [PLAN.md](../../../PLAN.md) - 전체 프로젝트 계획
- [AI_ART_GEN_PROJECT.md](../../../AI_ART_GEN_PROJECT.md) - 아트 생성기 상세 스펙
- [API.md](../../../API.md) - API 문서
- [CONTRIBUTING.md](../../../CONTRIBUTING.md) - 개발 가이드

---

## 📝 변경 이력

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2025-10-11 | 초안 작성 | ✅ 완료 |
| 2025-10-11 | 이미지 공유 기능 추가 | ✅ 완료 |
| 2025-10-11 | 갤러리 내보내기/가져오기 기능 추가 | ✅ 완료 |
| 2025-10-11 | Phase 1.1: 이미지 편집 기능 구현 (PR #42, #46, #47) | ✅ 완료 |
| 2025-10-11 | 라이브러리 통합 (PR #43, #44, #45) | ✅ 완료 |
| 2025-10-11 | Phase 4.1: 공유 UI 컴포넌트 라이브러리 (PR #48, #49) | ✅ 완료 |
| 2025-10-11 | Phase 1.2: 이미지 합성 기능 구현 (PR #51) | ✅ 완료 |
| 2025-10-11 | Phase 1.3: 스타일 전이 기능 구현 (PR #53) | ✅ 완료 |
| - | Phase 2 시작 | ⏳ 대기 |
| - | Phase 3 시작 | ⏳ 대기 |

---

## 💡 다음 액션

### ✅ 완료된 작업 (2025-10-11)

1. ✅ **Phase 1.1 완료**: 이미지 편집 기능 구현
   - API 엔드포인트, ImageEditor 컴포넌트, 라이브러리 통합
   - PR #42, #46, #47 완료

2. ✅ **라이브러리 통합 완료**: 갤러리를 통합 미디어 라이브러리로 이동
   - PR #43, #44, #45 완료

3. ✅ **Phase 4.1 완료**: 공유 UI 컴포넌트 라이브러리 구축
   - `@aiapps/ui` 패키지 생성 및 빌드 설정
   - 8개 공통 컴포넌트 (Button, Input, Select, Card, Modal, Toast, LoadingSpinner, ErrorMessage)
   - PR #48, #49 완료

4. ✅ **Phase 1.2 완료**: 이미지 합성 기능 구현
   - `/api/art/compose` 엔드포인트 구현
   - ImageComposer 컴포넌트 개발
   - 라이브러리 멀티 셀렉트 모드 통합
   - PR #51 완료

5. ✅ **Phase 1.3 완료**: 스타일 전이 기능 구현
   - `/api/art/style-transfer` 엔드포인트 구현
   - StyleTransfer 컴포넌트 개발 (프롬프트 + 참조 이미지)
   - 라이브러리에 스타일 전이 버튼 추가
   - PR #53 완료

### 🎯 다음 추천 작업

**옵션 1: Phase 1.4 - 갤러리 검색 및 필터링 강화** (1-2일)

- 즉시 체감 가능한 UX 개선
- 텍스트 검색, 다중 필터, 정렬 옵션
- 페이지네이션 또는 무한 스크롤
- 필터 상태 URL 쿼리 저장

**옵션 2: Phase 4.2-4.4 - UI/UX 품질 개선** (2-3일)

- 접근성 개선 (WCAG 2.1 AA)
- 반응형 디자인 최적화
- 코드 품질 및 리팩토링
