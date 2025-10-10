/**
 * Zod 스키마 기반 입력 검증
 * XSS, Injection 공격 방지
 */

import { z } from 'zod';

/**
 * 공통 검증 규칙
 */

// 프롬프트 검증 (XSS 방지)
const promptSchema = z
  .string()
  .min(3, 'Prompt must be at least 3 characters')
  .max(1000, 'Prompt must be less than 1000 characters')
  .regex(
    /^[a-zA-Z0-9가-힣\s\.,!?'"()-]+$/,
    'Prompt contains invalid characters'
  )
  .transform((val) => val.trim());

// API 키 검증
const apiKeySchema = z
  .string()
  .min(20, 'Invalid API key')
  .regex(/^AIza[A-Za-z0-9_-]+$/, 'Invalid Gemini API key format');

/**
 * 오디오 생성 요청 스키마
 */
export const audioGenerateRequestSchema = z.object({
  prompt: promptSchema,
  type: z.enum(['bgm', 'sfx'], {
    errorMap: () => ({ message: 'Type must be either bgm or sfx' }),
  }),
  genre: z.string().min(1, 'Genre is required').max(50),
  bpm: z
    .number()
    .int()
    .min(60, 'BPM must be at least 60')
    .max(200, 'BPM must be at most 200')
    .optional(),
  duration: z
    .number()
    .positive('Duration must be positive')
    .min(5, 'Duration must be at least 5 seconds')
    .max(60, 'Duration must be at most 60 seconds'),
  mood: z.string().max(50).optional(),
  instruments: z.array(z.string().max(50)).max(10).optional(),
});

export type AudioGenerateRequest = z.infer<typeof audioGenerateRequestSchema>;

/**
 * 아트 생성 요청 스키마
 */
export const artGenerateRequestSchema = z.object({
  prompt: promptSchema,
  style: z
    .enum([
      'pixel',
      'cartoon',
      'anime',
      'realistic',
      'watercolor',
      'oil-painting',
      'sketch',
    ])
    .or(z.string().max(50)), // 커스텀 스타일 허용
  resolution: z
    .enum(['512x512', '768x768', '1024x1024', '1024x768', '768x1024'])
    .default('1024x1024'),
  aspectRatio: z
    .enum(['1:1', '4:3', '3:4', '16:9', '9:16'])
    .default('1:1')
    .optional(),
  quality: z.enum(['draft', 'standard', 'high']).default('standard').optional(),
  seed: z.number().int().positive().optional(),
  batchSize: z
    .number()
    .int()
    .min(1, 'Batch size must be at least 1')
    .max(4, 'Batch size must be at most 4')
    .default(1)
    .optional(),
});

export type ArtGenerateRequest = z.infer<typeof artGenerateRequestSchema>;

/**
 * API 키 설정 요청 스키마
 */
export const apiKeySettingsSchema = z.object({
  provider: z.enum(['gemini'], {
    errorMap: () => ({ message: 'Only Gemini provider is supported' }),
  }),
  apiKey: apiKeySchema,
  encryptionEnabled: z.boolean().default(true).optional(),
});

export type ApiKeySettings = z.infer<typeof apiKeySettingsSchema>;

/**
 * 태그 필터 요청 스키마
 */
export const tagFilterSchema = z.object({
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(50)
        .regex(/^[a-zA-Z0-9가-힣\s-]+$/, 'Invalid tag format')
    )
    .max(20, 'Too many tags'),
  matchAll: z.boolean().default(false).optional(),
});

export type TagFilter = z.infer<typeof tagFilterSchema>;

/**
 * 파일 메타데이터 스키마
 */
export const fileMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9가-힣\s\._-]+$/, 'Invalid filename'),
  size: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024), // 최대 50MB
  type: z.enum(['audio/wav', 'audio/mp3', 'image/png', 'image/jpeg']),
  createdAt: z.date().or(z.string().datetime()),
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

/**
 * 스키마 검증 헬퍼 함수
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      };
    }
    return {
      success: false,
      error: 'Validation failed',
    };
  }
}

/**
 * 안전한 문자열 sanitization
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * URL 검증 및 sanitization
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .regex(/^https?:\/\//, 'URL must start with http:// or https://')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // 위험한 프로토콜 차단
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'Invalid or dangerous URL' }
  );

export type SafeUrl = z.infer<typeof urlSchema>;
