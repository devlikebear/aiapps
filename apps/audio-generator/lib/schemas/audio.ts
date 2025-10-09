/**
 * 오디오 생성 관련 Zod 스키마
 */

import { z } from 'zod';

/**
 * 장르 목록
 */
export const GENRES = [
  'orchestral',
  'electronic',
  'ambient',
  'rock',
  'jazz',
  'classical',
  'cinematic',
  'video-game',
  'chiptune',
] as const;

/**
 * 무드 목록
 */
export const MOODS = [
  'epic',
  'calm',
  'energetic',
  'dark',
  'happy',
  'mysterious',
  'sad',
  'intense',
  'relaxing',
] as const;

/**
 * 악기 목록
 */
export const INSTRUMENTS = [
  'piano',
  'guitar',
  'drums',
  'bass',
  'strings',
  'brass',
  'woodwinds',
  'synthesizer',
  'percussion',
] as const;

/**
 * 음악 스케일
 */
export const SCALES = [
  'major',
  'minor',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
] as const;

/**
 * 오디오 프롬프트 스키마
 */
export const audioPromptSchema = z.object({
  // 기본 프롬프트
  prompt: z
    .string()
    .min(1, 'Prompt is required')
    .max(500, 'Prompt must be less than 500 characters'),

  // 장르
  genre: z.enum(GENRES).optional(),

  // 무드
  mood: z.enum(MOODS).optional(),

  // BPM (60-200)
  bpm: z
    .number()
    .int()
    .min(60, 'BPM must be at least 60')
    .max(200, 'BPM must be at most 200')
    .default(120),

  // 악기 (다중 선택)
  instruments: z.array(z.enum(INSTRUMENTS)).default([]),

  // Density (0-1)
  density: z
    .number()
    .min(0, 'Density must be between 0 and 1')
    .max(1, 'Density must be between 0 and 1')
    .default(0.5),

  // Brightness (0-1)
  brightness: z
    .number()
    .min(0, 'Brightness must be between 0 and 1')
    .max(1, 'Brightness must be between 0 and 1')
    .default(0.5),

  // 스케일
  scale: z.enum(SCALES).default('major'),

  // 길이 (초)
  duration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 seconds')
    .max(120, 'Duration must be at most 120 seconds')
    .default(30),
});

export type AudioPrompt = z.infer<typeof audioPromptSchema>;

/**
 * 오디오 에셋 메타데이터 스키마
 */
export const audioAssetSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  genre: z.enum(GENRES).optional(),
  mood: z.enum(MOODS).optional(),
  bpm: z.number(),
  instruments: z.array(z.enum(INSTRUMENTS)),
  duration: z.number(),
  fileUrl: z.string().url(),
  fileFormat: z.enum(['wav', 'mp3']),
  fileSizeBytes: z.number(),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
});

export type AudioAsset = z.infer<typeof audioAssetSchema>;
