/**
 * Art Generator 앱 타입 정의
 */

/**
 * 아트 스타일 타입
 */
export type ArtStyle =
  | 'pixel-art'
  | 'concept-art'
  | 'character-design'
  | 'environment'
  | 'ui-icons';

/**
 * 이미지 종횡비
 */
export type AspectRatio =
  | '1:1'
  | '4:3'
  | '16:9'
  | '9:16'
  | '21:9'
  | '3:4'
  | 'custom';

/**
 * 이미지 해상도 프리셋
 */
export type ResolutionPreset =
  | '256x256' // 작은 아이콘/타일
  | '512x512' // 중간 크기 에셋
  | '1024x1024' // 고해상도 에셋
  | '1920x1080' // Full HD 배경
  | '2048x2048' // 초고해상도
  | 'custom';

/**
 * 이미지 포맷
 */
export type ImageFormat = 'png' | 'jpeg' | 'webp';

/**
 * 품질 프리셋
 */
export type QualityPreset = 'draft' | 'standard' | 'high';

/**
 * 사용 목적 타입
 */
export type UsageType = 'game' | 'web' | 'general';

/**
 * 사용 목적별 프리셋
 */
export interface UsageTypePreset {
  type: UsageType;
  name: string;
  description: string;
  icon: string;
  defaults: {
    format: ImageFormat;
    resolution: ResolutionPreset;
    aspectRatio: AspectRatio;
    quality: QualityPreset;
    colorProfile: 'sRGB' | 'Adobe RGB';
  };
  optimizations: {
    transparency?: boolean;
    tileability?: boolean;
    spriteReady?: boolean;
    fileSize?: 'optimized' | 'standard';
    responsive?: boolean;
    retina?: boolean;
  };
  availableStyles: ArtStyle[];
}

/**
 * 아트 스타일 프리셋
 */
export interface ArtStylePreset {
  style: ArtStyle;
  name: string;
  description: string;
  recommendedResolution: ResolutionPreset;
  aspectRatio: AspectRatio;
  promptTemplate: string;
  icon: string;
  examples: string[]; // 예시 프롬프트
}

/**
 * Art Generator 요청 파라미터
 */
export interface ArtGenerateRequest {
  // 기본 설정
  style: ArtStyle;
  prompt: string;

  // 이미지 파라미터
  resolution?: ResolutionPreset | string; // "512x512" or "custom"
  aspectRatio?: AspectRatio;
  width?: number; // custom 해상도용
  height?: number; // custom 해상도용

  // 생성 옵션
  seed?: number; // 재현성을 위한 시드 (선택적)
  batchSize?: number; // 배치 생성 (1-4)
  quality?: 'draft' | 'standard' | 'high';

  // 스타일 가이드
  colorPalette?: string[]; // HEX 색상 코드 배열
  referenceImage?: string; // Base64 또는 URL (스타일 참조용)
}

/**
 * 이미지 편집 요청
 */
export interface ImageEditRequest {
  image: string; // Base64 또는 URL
  prompt: string;
  editType: 'inpaint' | 'outpaint' | 'variation' | 'upscale';
  mask?: string; // Inpaint용 마스크 (Base64)
  strength?: number; // 0.0-1.0 (편집 강도)
}

/**
 * 이미지 합성 요청
 */
export interface ImageComposeRequest {
  images: string[]; // Base64 또는 URL 배열 (최대 3개)
  prompt: string;
  composition?: 'blend' | 'collage' | 'layered';
}

/**
 * 스타일 전이 요청
 */
export interface StyleTransferRequest {
  baseImage: string; // Base64 또는 URL
  styleImage: string; // Base64 또는 URL
  strength?: number; // 0.0-1.0 (스타일 강도)
}

/**
 * 생성된 이미지 메타데이터
 */
export interface ImageMetadata {
  id: string;
  style: ArtStyle;

  // 파일 정보
  format: ImageFormat;
  width: number;
  height: number;
  fileSize: number; // bytes
  aspectRatio: string;

  // 생성 정보
  prompt: string;
  seed?: number;
  quality: string;
  createdAt: Date;

  // 추가 정보
  hasWatermark: boolean; // SynthID 워터마크
  estimatedCost?: number; // USD
}

/**
 * Art Generator 응답
 */
export interface ArtGenerateResponse {
  images: Array<{
    data: string; // Base64
    format: ImageFormat;
    metadata: ImageMetadata;
  }>;
  batchId?: string; // 배치 생성 시 그룹 ID
}

/**
 * 이미지 편집 응답
 */
export interface ImageEditResponse {
  image: {
    data: string; // Base64
    format: ImageFormat;
  };
  metadata: ImageMetadata;
}

/**
 * 갤러리 아이템
 */
export interface GalleryItem {
  id: string;
  name: string;
  style: ArtStyle;

  // 파일 정보
  url: string; // Blob URL 또는 다운로드 URL
  thumbnail?: string; // 썸네일 URL
  format: ImageFormat;
  width: number;
  height: number;
  fileSize: number;

  // 메타데이터
  metadata: ImageMetadata;

  // 관리
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  favorite?: boolean;

  // 버전 관리 (편집 히스토리)
  version?: number;
  parentId?: string; // 원본 이미지 ID
}

/**
 * 이미지 생성 진행 상태
 */
export interface ImageGenerationProgress {
  status: 'pending' | 'generating' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  currentBatch?: number; // 배치 생성 시 현재 번호
  totalBatches?: number; // 배치 생성 시 전체 개수
}

/**
 * 스프라이트 시트 설정
 */
export interface SpriteSheetConfig {
  images: string[]; // 이미지 ID 배열
  columns: number;
  rows: number;
  padding?: number; // 이미지 간 간격 (px)
  backgroundColor?: string; // HEX 색상
}

/**
 * 아트 스타일 프리셋 목록
 */
export const ART_STYLE_PRESETS: Record<ArtStyle, ArtStylePreset> = {
  'pixel-art': {
    style: 'pixel-art',
    name: '픽셀 아트',
    description: '레트로 게임 스타일의 픽셀 아트',
    recommendedResolution: '512x512',
    aspectRatio: '1:1',
    promptTemplate: '16-bit pixel art {subject} with retro game style',
    icon: '🎮',
    examples: [
      '16-bit pixel art fantasy castle',
      '8-bit pixel art character warrior',
      'retro pixel art forest background',
    ],
  },
  'concept-art': {
    style: 'concept-art',
    name: '컨셉 아트',
    description: '디테일한 게임 컨셉 아트',
    recommendedResolution: '1920x1080',
    aspectRatio: '16:9',
    promptTemplate:
      'detailed concept art of {subject}, professional game design',
    icon: '🎨',
    examples: [
      'concept art of futuristic city',
      'detailed sci-fi spaceship design',
      'fantasy character concept art',
    ],
  },
  'character-design': {
    style: 'character-design',
    name: '캐릭터 디자인',
    description: '게임 캐릭터 디자인 및 일러스트',
    recommendedResolution: '1024x1024',
    aspectRatio: '1:1',
    promptTemplate: '2D character design of {subject}, game character art',
    icon: '👤',
    examples: [
      '2D character design fantasy knight',
      'anime style character mage',
      'chibi character design warrior',
    ],
  },
  environment: {
    style: 'environment',
    name: '환경/배경',
    description: '게임 환경 및 배경 이미지',
    recommendedResolution: '1920x1080',
    aspectRatio: '16:9',
    promptTemplate: '2D game environment {subject}, side-scrolling background',
    icon: '🏞️',
    examples: [
      '2D platformer forest background',
      'pixel art dungeon environment',
      'side-scrolling cave background',
    ],
  },
  'ui-icons': {
    style: 'ui-icons',
    name: 'UI/아이콘',
    description: '게임 UI 요소 및 아이콘',
    recommendedResolution: '256x256',
    aspectRatio: '1:1',
    promptTemplate: 'game UI icon {subject}, clean and simple design',
    icon: '🔲',
    examples: [
      'game UI health potion icon',
      'RPG sword icon flat design',
      'inventory item gold coin icon',
    ],
  },
};

/**
 * 해상도 정보
 */
export const RESOLUTION_PRESETS: Record<
  ResolutionPreset,
  {
    width: number;
    height: number;
    name: string;
    description: string;
  }
> = {
  '256x256': {
    width: 256,
    height: 256,
    name: '256×256',
    description: '작은 아이콘/타일 (권장)',
  },
  '512x512': {
    width: 512,
    height: 512,
    name: '512×512',
    description: '중간 크기 에셋',
  },
  '1024x1024': {
    width: 1024,
    height: 1024,
    name: '1024×1024',
    description: '고해상도 에셋',
  },
  '1920x1080': {
    width: 1920,
    height: 1080,
    name: '1920×1080 (Full HD)',
    description: 'Full HD 배경',
  },
  '2048x2048': {
    width: 2048,
    height: 2048,
    name: '2048×2048',
    description: '초고해상도 (높은 비용)',
  },
  custom: {
    width: 0,
    height: 0,
    name: '사용자 정의',
    description: '원하는 크기 입력',
  },
};

/**
 * 이미지 포맷 정보
 */
export const IMAGE_FORMAT_INFO: Record<
  ImageFormat,
  {
    name: string;
    extension: string;
    mimeType: string;
    hasTransparency: boolean;
    description: string;
  }
> = {
  png: {
    name: 'PNG',
    extension: '.png',
    mimeType: 'image/png',
    hasTransparency: true,
    description: '무손실, 투명도 지원 (권장)',
  },
  jpeg: {
    name: 'JPEG',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    hasTransparency: false,
    description: '손실 압축, 작은 파일 크기',
  },
  webp: {
    name: 'WebP',
    extension: '.webp',
    mimeType: 'image/webp',
    hasTransparency: true,
    description: '최신 포맷, 최적 압축',
  },
};

/**
 * 품질 프리셋
 */
export const QUALITY_PRESETS: Record<
  'draft' | 'standard' | 'high',
  {
    name: string;
    description: string;
    estimatedTime: string; // 예상 생성 시간
    costMultiplier: number; // 비용 배수
  }
> = {
  draft: {
    name: '빠른 생성 (Draft)',
    description: '빠른 프로토타이핑용',
    estimatedTime: '5-10초',
    costMultiplier: 0.5,
  },
  standard: {
    name: '표준 (Standard)',
    description: '균형 잡힌 품질 (권장)',
    estimatedTime: '10-20초',
    costMultiplier: 1.0,
  },
  high: {
    name: '고품질 (High)',
    description: '최고 품질 출력',
    estimatedTime: '20-40초',
    costMultiplier: 2.0,
  },
};

/**
 * 사용 목적별 프리셋 목록
 */
export const USAGE_TYPE_PRESETS: Record<UsageType, UsageTypePreset> = {
  game: {
    type: 'game',
    name: '게임 에셋',
    description: '게임 개발에 최적화된 설정',
    icon: '🎮',
    defaults: {
      format: 'png',
      resolution: '512x512',
      aspectRatio: '1:1',
      quality: 'high',
      colorProfile: 'sRGB',
    },
    optimizations: {
      transparency: true,
      tileability: true,
      spriteReady: true,
    },
    availableStyles: [
      'pixel-art',
      'character-design',
      'environment',
      'ui-icons',
    ],
  },
  web: {
    type: 'web',
    name: '웹 콘텐츠',
    description: '웹사이트/앱 UI에 최적화된 설정',
    icon: '🌐',
    defaults: {
      format: 'webp',
      resolution: '1920x1080',
      aspectRatio: '16:9',
      quality: 'standard',
      colorProfile: 'sRGB',
    },
    optimizations: {
      fileSize: 'optimized',
      responsive: true,
      retina: true,
    },
    availableStyles: ['concept-art', 'character-design', 'ui-icons'],
  },
  general: {
    type: 'general',
    name: '일반 용도',
    description: '자유로운 창작을 위한 기본 설정',
    icon: '🎨',
    defaults: {
      format: 'png',
      resolution: '1024x1024',
      aspectRatio: '1:1',
      quality: 'standard',
      colorProfile: 'sRGB',
    },
    optimizations: {},
    availableStyles: [
      'pixel-art',
      'concept-art',
      'character-design',
      'environment',
      'ui-icons',
    ],
  },
};
