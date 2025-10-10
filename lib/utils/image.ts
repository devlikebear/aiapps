/**
 * 이미지 처리 유틸리티
 */

/**
 * 레퍼런스 이미지 제약사항
 */
export const REFERENCE_IMAGE_CONSTRAINTS = {
  maxFiles: 3, // 최대 3개
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
  minDimension: 256, // 최소 256px
  maxDimension: 2048, // 최대 2048px
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

/**
 * 파일이 유효한 이미지 파일인지 검증
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 파일 형식 검증
  if (!REFERENCE_IMAGE_CONSTRAINTS.acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다. (PNG, JPEG, WebP만 가능)`,
    };
  }

  // 파일 크기 검증
  if (file.size > REFERENCE_IMAGE_CONSTRAINTS.maxFileSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${formatFileSize(REFERENCE_IMAGE_CONSTRAINTS.maxFileSize)})`,
    };
  }

  return { valid: true };
}

/**
 * 이미지를 Base64로 변환
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 크기 검증
 */
export function validateImageDimensions(img: HTMLImageElement): {
  valid: boolean;
  error?: string;
} {
  const { width, height } = img;
  const { minDimension, maxDimension } = REFERENCE_IMAGE_CONSTRAINTS;

  if (width < minDimension || height < minDimension) {
    return {
      valid: false,
      error: `이미지가 너무 작습니다. (최소 ${minDimension}×${minDimension}px)`,
    };
  }

  if (width > maxDimension || height > maxDimension) {
    return {
      valid: false,
      error: `이미지가 너무 큽니다. (최대 ${maxDimension}×${maxDimension}px)`,
    };
  }

  return { valid: true };
}

/**
 * 이미지 리사이징 (필요시)
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 리사이징이 필요한지 확인
        if (width <= maxWidth && height <= maxHeight) {
          // 리사이징 불필요
          resolve(e.target?.result as string);
          return;
        }

        // 비율 유지하며 리사이징
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);

        // Canvas로 리사이징
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Base64로 변환
        const resizedBase64 = canvas.toDataURL(file.type);
        resolve(resizedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일 전체 검증 및 처리
 */
export async function processImageFile(file: File): Promise<{
  success: boolean;
  preview?: string;
  error?: string;
}> {
  // 1. 파일 형식 및 크기 검증
  const fileValidation = validateImageFile(file);
  if (!fileValidation.valid) {
    return {
      success: false,
      error: fileValidation.error,
    };
  }

  try {
    // 2. Base64로 변환
    const base64 = await fileToBase64(file);

    // 3. 이미지 로드 및 크기 검증
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = base64;
    });

    const dimensionValidation = validateImageDimensions(img);
    if (!dimensionValidation.valid) {
      return {
        success: false,
        error: dimensionValidation.error,
      };
    }

    // 4. 리사이징 (필요시)
    const { maxDimension } = REFERENCE_IMAGE_CONSTRAINTS;
    const preview = await resizeImage(file, maxDimension, maxDimension);

    return {
      success: true,
      preview,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : '이미지 처리 중 오류 발생',
    };
  }
}
