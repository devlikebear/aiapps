/**
 * 오디오 빌트인 프리셋
 * 게임 장르별 및 SFX 카테고리별 기본 프리셋
 */

import type { AudioPresetBuilderSchema } from './preset-builder-schema';

// ============================================
// BGM PRESETS (배경음악)
// ============================================

/**
 * RPG 게임 BGM 프리셋
 */
export const BUILTIN_RPG_PRESET: AudioPresetBuilderSchema = {
  id: 'builtin-bgm-rpg',
  name: 'RPG 어드벤처',
  description: '웅장한 오케스트라와 판타지 분위기',
  icon: '⚔️',
  type: 'bgm',
  genre: 'rpg',
  isBuiltIn: true,
  isDefault: true,
  isReadOnly: true,
  groups: [
    {
      id: 'rpg-mood',
      name: '분위기',
      icon: '🎭',
      order: 0,
      fields: [
        {
          id: 'mood',
          label: '무드',
          type: 'select',
          value: 'epic',
          order: 0,
          options: [
            'epic',
            'mysterious',
            'majestic',
            'dark',
            'peaceful',
            'adventurous',
          ],
          promptTemplate: '{{value}} atmosphere',
        },
      ],
    },
    {
      id: 'rpg-instruments',
      name: '악기',
      icon: '🎼',
      order: 1,
      fields: [
        {
          id: 'instruments',
          label: '악기',
          type: 'multiselect',
          value: ['strings', 'brass'],
          order: 0,
          options: [
            'strings',
            'brass',
            'woodwinds',
            'percussion',
            'choir',
            'harp',
          ],
          promptTemplate: 'featuring {{value}}',
        },
      ],
    },
    {
      id: 'rpg-musical',
      name: '음악 설정',
      icon: '🎵',
      order: 2,
      fields: [
        {
          id: 'bpm',
          label: 'BPM',
          type: 'range',
          value: 110,
          order: 0,
          min: 80,
          max: 140,
          step: 5,
          promptTemplate: '{{value}} BPM',
        },
        {
          id: 'scale',
          label: '스케일',
          type: 'select',
          value: 'major',
          order: 1,
          options: ['major', 'minor', 'harmonic-minor', 'pentatonic'],
          promptTemplate: 'in {{value}} scale',
        },
        {
          id: 'timeSignature',
          label: '시간 서명',
          type: 'select',
          value: '4/4',
          order: 2,
          options: ['2/4', '3/4', '4/4', '6/8'],
          promptTemplate: 'with {{value}} time signature',
        },
      ],
    },
    {
      id: 'rpg-effects',
      name: '이펙트',
      icon: '✨',
      order: 3,
      fields: [
        {
          id: 'effects',
          label: '이펙트',
          type: 'multiselect',
          value: ['reverb'],
          order: 0,
          options: ['reverb', 'echo', 'delay', 'chorus', 'ethereal'],
          promptTemplate: 'with {{value}} effects',
        },
        {
          id: 'additionalNotes',
          label: '추가 설명',
          type: 'textarea',
          value: '',
          order: 1,
          placeholder: '예: with cinematic quality, grand orchestration',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * FPS 게임 BGM 프리셋
 */
export const BUILTIN_FPS_PRESET: AudioPresetBuilderSchema = {
  id: 'builtin-bgm-fps',
  name: 'FPS 액션',
  description: '긴장감 넘치는 전자 음악',
  icon: '🎯',
  type: 'bgm',
  genre: 'fps',
  isBuiltIn: true,
  isReadOnly: true,
  groups: [
    {
      id: 'fps-mood',
      name: '분위기',
      icon: '🎭',
      order: 0,
      fields: [
        {
          id: 'mood',
          label: '무드',
          type: 'select',
          value: 'intense',
          order: 0,
          options: [
            'intense',
            'aggressive',
            'suspenseful',
            'high-energy',
            'dark',
            'adrenaline-fueled',
          ],
          promptTemplate: '{{value}} atmosphere',
        },
      ],
    },
    {
      id: 'fps-instruments',
      name: '음원',
      icon: '🎛️',
      order: 1,
      fields: [
        {
          id: 'instruments',
          label: '음원',
          type: 'multiselect',
          value: ['synth', 'drums'],
          order: 0,
          options: [
            'synth',
            'drums',
            'bass',
            'electric-guitar',
            'industrial-sounds',
            'distortion',
          ],
          promptTemplate: 'featuring {{value}}',
        },
      ],
    },
    {
      id: 'fps-musical',
      name: '음악 설정',
      icon: '🎵',
      order: 2,
      fields: [
        {
          id: 'bpm',
          label: 'BPM',
          type: 'range',
          value: 160,
          order: 0,
          min: 140,
          max: 180,
          step: 5,
          promptTemplate: '{{value}} BPM',
        },
        {
          id: 'scale',
          label: '스케일',
          type: 'select',
          value: 'minor',
          order: 1,
          options: ['major', 'minor', 'harmonic-minor', 'dorian'],
          promptTemplate: 'in {{value}} scale',
        },
      ],
    },
    {
      id: 'fps-effects',
      name: '이펙트',
      icon: '⚡',
      order: 3,
      fields: [
        {
          id: 'effects',
          label: '이펙트',
          type: 'multiselect',
          value: ['distortion', 'compression'],
          order: 0,
          options: ['distortion', 'compression', 'chorus', 'flanger', 'reverb'],
          promptTemplate: 'with {{value}} effects',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Puzzle 게임 BGM 프리셋
 */
export const BUILTIN_PUZZLE_PRESET: AudioPresetBuilderSchema = {
  id: 'builtin-bgm-puzzle',
  name: '퍼즐 게임',
  description: '집중력을 높이는 차분한 선율',
  icon: '🧩',
  type: 'bgm',
  genre: 'puzzle',
  isBuiltIn: true,
  isReadOnly: true,
  groups: [
    {
      id: 'puzzle-mood',
      name: '분위기',
      icon: '🎭',
      order: 0,
      fields: [
        {
          id: 'mood',
          label: '무드',
          type: 'select',
          value: 'calm',
          order: 0,
          options: [
            'calm',
            'meditative',
            'ambient',
            'whimsical',
            'focused',
            'ethereal',
          ],
          promptTemplate: '{{value}} atmosphere',
        },
      ],
    },
    {
      id: 'puzzle-instruments',
      name: '악기',
      icon: '🎼',
      order: 1,
      fields: [
        {
          id: 'instruments',
          label: '악기',
          type: 'multiselect',
          value: ['piano', 'ambient-pads'],
          order: 0,
          options: [
            'piano',
            'ambient-pads',
            'bells',
            'xylophone',
            'strings',
            'flute',
          ],
          promptTemplate: 'featuring {{value}}',
        },
      ],
    },
    {
      id: 'puzzle-musical',
      name: '음악 설정',
      icon: '🎵',
      order: 2,
      fields: [
        {
          id: 'bpm',
          label: 'BPM',
          type: 'range',
          value: 80,
          order: 0,
          min: 60,
          max: 100,
          step: 5,
          promptTemplate: '{{value}} BPM',
        },
        {
          id: 'structure',
          label: '구조',
          type: 'select',
          value: 'loopable',
          order: 1,
          options: ['loopable', 'progressive', 'cyclical', 'minimalist'],
          promptTemplate: 'with {{value}} structure',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Racing 게임 BGM 프리셋
 */
export const BUILTIN_RACING_PRESET: AudioPresetBuilderSchema = {
  id: 'builtin-bgm-racing',
  name: '레이싱 게임',
  description: '속도감 있는 에너제틱 사운드',
  icon: '🏎️',
  type: 'bgm',
  genre: 'racing',
  isBuiltIn: true,
  isReadOnly: true,
  groups: [
    {
      id: 'racing-mood',
      name: '분위기',
      icon: '🎭',
      order: 0,
      fields: [
        {
          id: 'mood',
          label: '무드',
          type: 'select',
          value: 'energetic',
          order: 0,
          options: [
            'energetic',
            'high-octane',
            'thrilling',
            'driving',
            'adrenaline',
            'powerful',
          ],
          promptTemplate: '{{value}} atmosphere',
        },
      ],
    },
    {
      id: 'racing-instruments',
      name: '음원',
      icon: '🎛️',
      order: 1,
      fields: [
        {
          id: 'instruments',
          label: '음원',
          type: 'multiselect',
          value: ['synth', 'electric-bass', 'drums'],
          order: 0,
          options: [
            'synth',
            'electric-bass',
            'drums',
            'electric-guitar',
            'horn-section',
            'percussion',
          ],
          promptTemplate: 'featuring {{value}}',
        },
      ],
    },
    {
      id: 'racing-musical',
      name: '음악 설정',
      icon: '🎵',
      order: 2,
      fields: [
        {
          id: 'bpm',
          label: 'BPM',
          type: 'range',
          value: 170,
          order: 0,
          min: 150,
          max: 200,
          step: 5,
          promptTemplate: '{{value}} BPM',
        },
        {
          id: 'beatEmphasis',
          label: '비트 강조',
          type: 'select',
          value: 'strong',
          order: 1,
          options: ['strong', 'moderate', 'subtle'],
          promptTemplate: 'with {{value}} beat emphasis',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Retro 게임 BGM 프리셋
 */
export const BUILTIN_RETRO_PRESET: AudioPresetBuilderSchema = {
  id: 'builtin-bgm-retro',
  name: '레트로 8비트',
  description: '향수를 자극하는 칩튠 사운드',
  icon: '👾',
  type: 'bgm',
  genre: 'retro',
  isBuiltIn: true,
  isReadOnly: true,
  groups: [
    {
      id: 'retro-mood',
      name: '분위기',
      icon: '🎭',
      order: 0,
      fields: [
        {
          id: 'mood',
          label: '무드',
          type: 'select',
          value: 'nostalgic',
          order: 0,
          options: [
            'nostalgic',
            'playful',
            'arcade',
            'chiptune',
            'cheerful',
            'retro-cool',
          ],
          promptTemplate: '{{value}} atmosphere',
        },
      ],
    },
    {
      id: 'retro-style',
      name: '스타일',
      icon: '🎨',
      order: 1,
      fields: [
        {
          id: 'bitDepth',
          label: '비트 깊이',
          type: 'select',
          value: '8-bit',
          order: 0,
          options: ['8-bit', '16-bit', 'lo-fi', 'chipmusic'],
          promptTemplate: '{{value}}',
        },
        {
          id: 'instruments',
          label: '악기',
          type: 'multiselect',
          value: ['square-wave', 'triangle-wave'],
          order: 1,
          options: [
            'square-wave',
            'triangle-wave',
            'pulse-wave',
            'noise',
            'midi-synth',
          ],
          promptTemplate: 'featuring {{value}}',
        },
      ],
    },
    {
      id: 'retro-musical',
      name: '음악 설정',
      icon: '🎵',
      order: 2,
      fields: [
        {
          id: 'bpm',
          label: 'BPM',
          type: 'range',
          value: 130,
          order: 0,
          min: 100,
          max: 160,
          step: 5,
          promptTemplate: '{{value}} BPM',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// SFX PRESETS (효과음)
// ============================================

/**
 * UI 사운드 프리셋
 */
export const BUILTIN_UI_SFX_PRESET: AudioPresetBuilderSchema = {
  id: 'builtin-sfx-ui',
  name: 'UI 사운드',
  description: '버튼, 메뉴, 알림 사운드',
  icon: '🔘',
  type: 'sfx',
  sfxCategory: 'ui',
  isBuiltIn: true,
  isReadOnly: true,
  groups: [
    {
      id: 'ui-type',
      name: '타입',
      icon: '📱',
      order: 0,
      fields: [
        {
          id: 'description',
          label: '효과음 설명',
          type: 'select',
          value: 'click',
          order: 0,
          options: [
            'click',
            'menu-open',
            'menu-close',
            'notification',
            'select',
          ],
          promptTemplate: '{{value}} sound effect',
        },
      ],
    },
    {
      id: 'ui-character',
      name: '특성',
      icon: '✨',
      order: 1,
      fields: [
        {
          id: 'mood',
          label: '특성',
          type: 'multiselect',
          value: ['crisp', 'clear'],
          order: 0,
          options: ['crisp', 'clear', 'friendly', 'satisfying', 'digital'],
          promptTemplate: '{{value}}',
        },
        {
          id: 'soundSource',
          label: '음원',
          type: 'select',
          value: 'synth',
          order: 1,
          options: ['synth', 'bells', 'beeps', 'chimes', 'digital'],
          promptTemplate: 'using {{value}}',
        },
      ],
    },
    {
      id: 'ui-technical',
      name: '기술 설정',
      icon: '⚙️',
      order: 2,
      fields: [
        {
          id: 'duration',
          label: '지속시간 (초)',
          type: 'range',
          value: 0.3,
          order: 0,
          min: 0.1,
          max: 1,
          step: 0.1,
          promptTemplate: '{{value}}',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// 모든 빌트인 프리셋 배열
// ============================================

export const ALL_BUILTIN_AUDIO_PRESETS: AudioPresetBuilderSchema[] = [
  // BGM Presets
  BUILTIN_RPG_PRESET,
  BUILTIN_FPS_PRESET,
  BUILTIN_PUZZLE_PRESET,
  BUILTIN_RACING_PRESET,
  BUILTIN_RETRO_PRESET,
  // SFX Presets
  BUILTIN_UI_SFX_PRESET,
];

/**
 * 타입별 빌트인 프리셋 가져오기
 */
export function getBuiltinAudioPresetsByType(
  type: 'bgm' | 'sfx'
): AudioPresetBuilderSchema[] {
  return ALL_BUILTIN_AUDIO_PRESETS.filter((preset) => preset.type === type);
}

/**
 * 장르별 빌트인 프리셋 가져오기
 */
export function getBuiltinPresetByGenre(
  genre: 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro'
): AudioPresetBuilderSchema | undefined {
  return ALL_BUILTIN_AUDIO_PRESETS.find((preset) => preset.genre === genre);
}

/**
 * ID로 빌트인 프리셋 찾기
 */
export function getBuiltinAudioPresetById(
  id: string
): AudioPresetBuilderSchema | undefined {
  return ALL_BUILTIN_AUDIO_PRESETS.find((preset) => preset.id === id);
}
