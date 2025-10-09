/**
 * Art Generator 유틸리티 함수
 */

import type { ImageFormat, AspectRatio, ResolutionPreset } from './types';
import { RESOLUTION_PRESETS, IMAGE_FORMAT_INFO } from './types';

/**
 * Base64 문자열을 Blob으로 변환
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  // Data URL 프리픽스 제거
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

  // Base64 디코딩
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Blob을 Base64 문자열로 변환
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 이미지 메타데이터 추출
 */
export async function extractImageMetadata(
  imageData: string,
  format: ImageFormat
): Promise<{
  width: number;
  height: number;
  fileSize: number;
  aspectRatio: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const blob = base64ToBlob(imageData, IMAGE_FORMAT_INFO[format].mimeType);
      const aspectRatio = calculateAspectRatio(img.width, img.height);

      resolve({
        width: img.width,
        height: img.height,
        fileSize: blob.size,
        aspectRatio,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData.startsWith('data:')
      ? imageData
      : `data:image/${format};base64,${imageData}`;
  });
}

/**
 * 종횡비 계산
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * 종횡비를 숫자 비율로 변환
 */
export function aspectRatioToNumber(aspectRatio: AspectRatio): number {
  const [width, height] = aspectRatio.split(':').map(Number);
  return width / height;
}

/**
 * 해상도 문자열 파싱
 */
export function parseResolution(resolution: string): {
  width: number;
  height: number;
} {
  if (resolution in RESOLUTION_PRESETS) {
    const preset = RESOLUTION_PRESETS[resolution as ResolutionPreset];
    return { width: preset.width, height: preset.height };
  }

  // "1920x1080" 형식 파싱
  const match = resolution.match(/^(\d+)x(\d+)$/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }

  throw new Error(`Invalid resolution format: ${resolution}`);
}

/**
 * 이미지 다운로드
 */
export function downloadImage(
  imageData: string,
  filename: string,
  format: ImageFormat
): void {
  const formatInfo = IMAGE_FORMAT_INFO[format];
  const blob = base64ToBlob(imageData, formatInfo.mimeType);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}${formatInfo.extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Blob URL 정리
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * 이미지 리사이즈 (Canvas 사용)
 */
export async function resizeImage(
  imageData: string,
  targetWidth: number,
  targetHeight: number,
  format: ImageFormat = 'png'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 고품질 리사이징
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Base64로 변환
      const mimeType = IMAGE_FORMAT_INFO[format].mimeType;
      const resizedData = canvas.toDataURL(mimeType, 0.95);
      resolve(resizedData);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * 썸네일 생성
 */
export async function createThumbnail(
  imageData: string,
  maxSize: number = 256
): Promise<string> {
  const metadata = await extractImageMetadata(imageData, 'png');
  const { width, height } = metadata;

  // 종횡비 유지하면서 크기 조정
  let thumbnailWidth = width;
  let thumbnailHeight = height;

  if (width > height) {
    if (width > maxSize) {
      thumbnailWidth = maxSize;
      thumbnailHeight = Math.round((height * maxSize) / width);
    }
  } else {
    if (height > maxSize) {
      thumbnailHeight = maxSize;
      thumbnailWidth = Math.round((width * maxSize) / height);
    }
  }

  return resizeImage(imageData, thumbnailWidth, thumbnailHeight, 'jpeg');
}

/**
 * 이미지 크기 검증
 */
export function validateImageSize(
  width: number,
  height: number,
  maxWidth: number = 2048,
  maxHeight: number = 2048,
  minWidth: number = 256,
  minHeight: number = 256
): { valid: boolean; error?: string } {
  if (width < minWidth || height < minHeight) {
    return {
      valid: false,
      error: `이미지 크기가 너무 작습니다 (최소: ${minWidth}×${minHeight})`,
    };
  }

  if (width > maxWidth || height > maxHeight) {
    return {
      valid: false,
      error: `이미지 크기가 너무 큽니다 (최대: ${maxWidth}×${maxHeight})`,
    };
  }

  return { valid: true };
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 이미지 데이터 압축
 */
export async function compressImage(
  imageData: string,
  quality: number = 0.8,
  format: ImageFormat = 'jpeg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const mimeType = IMAGE_FORMAT_INFO[format].mimeType;
      const compressedData = canvas.toDataURL(mimeType, quality);
      resolve(compressedData);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * 색상 팔레트 추출 (간단한 구현)
 */
export async function extractColorPalette(
  imageData: string,
  maxColors: number = 5
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // 샘플링을 위해 작은 크기로 리사이즈
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels = imageData.data;

      // 색상 수집 (간단한 구현 - 실제로는 K-means 등 사용)
      const colors = new Set<string>();
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors.add(hex);

        if (colors.size >= maxColors * 10) break; // 충분한 샘플 수집
      }

      // 상위 N개 색상 반환 (간단하게 처음 N개)
      resolve(Array.from(colors).slice(0, maxColors));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * 프롬프트 토큰 추정 (간단한 구현)
 */
export function estimatePromptTokens(prompt: string): number {
  // 간단한 추정: 단어 수 * 1.3 (평균 토큰/단어 비율)
  const words = prompt.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}

/**
 * 비용 추정 (Gemini 2.5 Flash Image 기준)
 */
export function estimateGenerationCost(
  resolution: string,
  batchSize: number = 1,
  quality: 'draft' | 'standard' | 'high' = 'standard'
): number {
  const { width, height } = parseResolution(resolution);
  const pixels = width * height;

  // 간단한 비용 모델 (실제 API 가격에 맞게 조정 필요)
  const basePrice = 0.001; // $0.001 per 256x256
  const pixelRatio = pixels / (256 * 256);

  let qualityMultiplier = 1.0;
  if (quality === 'draft') qualityMultiplier = 0.5;
  if (quality === 'high') qualityMultiplier = 2.0;

  return basePrice * pixelRatio * batchSize * qualityMultiplier;
}

/**
 * UUID 생성 (간단한 구현)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 스프라이트 시트 생성
 */
export async function createSpriteSheet(
  images: string[],
  columns: number,
  rows: number,
  padding: number = 0,
  backgroundColor: string = '#00000000'
): Promise<string> {
  if (images.length === 0) {
    throw new Error('No images provided');
  }

  if (images.length > columns * rows) {
    throw new Error('Too many images for the specified grid');
  }

  // 첫 번째 이미지로 셀 크기 결정
  const firstImg = new Image();
  await new Promise((resolve, reject) => {
    firstImg.onload = resolve;
    firstImg.onerror = reject;
    firstImg.src = images[0];
  });

  const cellWidth = firstImg.width;
  const cellHeight = firstImg.height;

  const canvas = document.createElement('canvas');
  canvas.width = columns * cellWidth + (columns - 1) * padding;
  canvas.height = rows * cellHeight + (rows - 1) * padding;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 배경색 설정
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 이미지 그리드 배치
  for (let i = 0; i < images.length; i++) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = images[i];
    });

    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = col * (cellWidth + padding);
    const y = row * (cellHeight + padding);

    ctx.drawImage(img, x, y, cellWidth, cellHeight);
  }

  return canvas.toDataURL('image/png');
}
