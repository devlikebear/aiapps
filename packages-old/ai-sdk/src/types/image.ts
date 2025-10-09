/**
 * Gemini 2.5 Flash Image 관련 타입 정의
 */

/**
 * 종횡비 타입
 */
export type AspectRatio =
  | '1:1'
  | '16:9'
  | '9:16'
  | '4:3'
  | '3:4'
  | '21:9'
  | '9:21';

/**
 * 이미지 포맷
 */
export type ImageFormat = 'png' | 'jpeg' | 'webp';

/**
 * 지원 언어
 */
export type SupportedLanguage = 'en' | 'es-MX' | 'ja-JP' | 'zh-CN' | 'hi-IN';

/**
 * 이미지 생성 요청
 */
export interface ImageGenerateRequest {
  prompt: string;
  aspectRatio?: AspectRatio;
  numberOfImages?: number; // 1-4
  seed?: number;
  language?: SupportedLanguage;
  negativePrompt?: string;
}

/**
 * 이미지 편집 요청
 */
export interface ImageEditRequest {
  image: ImageInput;
  prompt: string;
  language?: SupportedLanguage;
}

/**
 * 이미지 합성 요청
 */
export interface ImageComposeRequest {
  images: ImageInput[]; // 최대 3개
  prompt: string;
  language?: SupportedLanguage;
}

/**
 * 스타일 전이 요청
 */
export interface ImageStyleTransferRequest {
  baseImage: ImageInput;
  styleImage: ImageInput;
  prompt?: string;
  language?: SupportedLanguage;
}

/**
 * 이미지 입력 타입
 */
export interface ImageInput {
  data?: ArrayBuffer | string; // ArrayBuffer 또는 base64
  mimeType?: string;
  path?: string; // 파일 경로
}

/**
 * 생성된 이미지 데이터
 */
export interface GeneratedImage {
  data: ArrayBuffer;
  mimeType: string;
  width: number;
  height: number;
  seed?: number;
}

/**
 * 이미지 생성 응답
 */
export interface ImageGenerateResponse {
  images: GeneratedImage[];
  requestId: string;
  generatedAt: Date;
  estimatedTokens?: number;
}

/**
 * 이미지 편집 응답
 */
export interface ImageEditResponse {
  image: GeneratedImage;
  requestId: string;
  generatedAt: Date;
}

/**
 * 이미지 합성 응답
 */
export interface ImageComposeResponse {
  image: GeneratedImage;
  requestId: string;
  generatedAt: Date;
}

/**
 * 스타일 전이 응답
 */
export interface ImageStyleTransferResponse {
  image: GeneratedImage;
  requestId: string;
  generatedAt: Date;
}
