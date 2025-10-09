import { z } from 'zod';

// Art styles
export const ART_STYLES = [
  'pixel-art',
  'anime',
  'cartoon',
  'realistic',
  'watercolor',
  'oil-painting',
  'sketch',
  'digital-art',
  'concept-art',
  'minimalist',
] as const;

// Art types
export const ART_TYPES = [
  'character',
  'environment',
  'item',
  'ui-element',
  'icon',
  'background',
  'tile',
  'sprite',
  'portrait',
  'landscape',
] as const;

// Moods
export const MOODS = [
  'cheerful',
  'dark',
  'mysterious',
  'epic',
  'calm',
  'energetic',
  'horror',
  'whimsical',
  'serious',
  'playful',
] as const;

// Image formats
export const IMAGE_FORMATS = ['png', 'jpeg', 'webp'] as const;

// Base image prompt schema
export const imagePromptSchema = z.object({
  prompt: z
    .string()
    .min(1, '프롬프트를 입력해주세요')
    .max(2000, '프롬프트는 최대 2000자입니다'),
  negativePrompt: z.string().max(1000).optional(),
  style: z.enum(ART_STYLES).optional(),
  artType: z.enum(ART_TYPES).optional(),
  mood: z.enum(MOODS).optional(),
  width: z.number().int().min(256).max(2048).default(1024),
  height: z.number().int().min(256).max(2048).default(1024),
  format: z.enum(IMAGE_FORMATS).default('png'),
  seed: z.number().int().min(0).max(2147483647).optional(),
});

// Image edit schema
export const imageEditSchema = z.object({
  imageData: z.string().min(1, '이미지 데이터가 필요합니다'),
  prompt: z
    .string()
    .min(1, '편집 프롬프트를 입력해주세요')
    .max(2000, '프롬프트는 최대 2000자입니다'),
  negativePrompt: z.string().max(1000).optional(),
  format: z.enum(IMAGE_FORMATS).default('png'),
});

// Image composition schema
export const imageComposeSchema = z.object({
  images: z
    .array(z.string().min(1))
    .min(2, '최소 2개의 이미지가 필요합니다')
    .max(10, '최대 10개의 이미지만 합성 가능합니다'),
  prompt: z
    .string()
    .min(1, '합성 프롬프트를 입력해주세요')
    .max(2000, '프롬프트는 최대 2000자입니다'),
  format: z.enum(IMAGE_FORMATS).default('png'),
});

// Style transfer schema
export const styleTransferSchema = z.object({
  baseImage: z.string().min(1, '베이스 이미지가 필요합니다'),
  styleImage: z.string().min(1, '스타일 이미지가 필요합니다'),
  prompt: z.string().max(2000).optional(),
  styleStrength: z.number().min(0).max(1).default(0.7),
  format: z.enum(IMAGE_FORMATS).default('png'),
});

// Image asset schema
export const imageAssetSchema = z.object({
  id: z.string(),
  imageData: z.string(),
  prompt: z.string(),
  style: z.enum(ART_STYLES).optional(),
  artType: z.enum(ART_TYPES).optional(),
  mood: z.enum(MOODS).optional(),
  width: z.number().int(),
  height: z.number().int(),
  format: z.enum(IMAGE_FORMATS),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  tokenCost: z.number().optional(),
});

// Library query schema
export const libraryQuerySchema = z.object({
  tags: z.array(z.string()).optional(),
  style: z.enum(ART_STYLES).optional(),
  artType: z.enum(ART_TYPES).optional(),
  mood: z.enum(MOODS).optional(),
});

// Types
export type ImagePrompt = z.infer<typeof imagePromptSchema>;
export type ImageEdit = z.infer<typeof imageEditSchema>;
export type ImageCompose = z.infer<typeof imageComposeSchema>;
export type StyleTransfer = z.infer<typeof styleTransferSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type LibraryQuery = z.infer<typeof libraryQuerySchema>;
