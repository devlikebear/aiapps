/**
 * 기본 프롬프트 테마 데이터
 */

import type { PromptTheme } from './prompt-theme';
import type { ArtStyle } from './types';
import {
  BUILTIN_CHARACTER_PRESET,
  BUILTIN_ITEM_PRESET,
  BUILTIN_ENVIRONMENT_PRESET,
  BUILTIN_HERO_PRESET,
  BUILTIN_BANNER_PRESET,
  BUILTIN_ICON_PRESET,
  BUILTIN_ILLUSTRATION_PRESET,
  BUILTIN_PORTRAIT_PRESET,
  BUILTIN_LANDSCAPE_PRESET,
  BUILTIN_PRODUCT_PRESET,
  BUILTIN_ABSTRACT_PRESET,
} from './builtin-presets';

/**
 * 게임 에셋 테마
 */
export const GAME_ASSET_THEME: PromptTheme = {
  id: 'theme-game-asset',
  name: '게임 에셋',
  usageType: 'game',
  description: '게임 개발용 캐릭터, 아이템, 환경 에셋 생성에 최적화',
  icon: '🎮',

  artStyles: [
    {
      value: 'pixel-art' as ArtStyle,
      label: '픽셀 아트',
      description: '레트로 게임 스타일의 픽셀 기반 아트',
      example: '8-bit, 16-bit, retro game style',
    },
    {
      value: 'concept-art' as ArtStyle,
      label: '컨셉 아트',
      description: '게임 개발용 컨셉 디자인',
      example: 'concept art, game design, detailed illustration',
    },
    {
      value: 'character-design' as ArtStyle,
      label: '캐릭터 디자인',
      description: '캐릭터 중심의 상세한 디자인',
      example: 'character sheet, turnaround, concept design',
    },
    {
      value: 'environment' as ArtStyle,
      label: '환경/배경',
      description: '게임 배경 및 환경 디자인',
      example: 'game environment, background art, level design',
    },
    {
      value: 'ui-icons' as ArtStyle,
      label: 'UI/아이콘',
      description: '게임 UI 요소 및 아이콘',
      example: 'game UI, icons, buttons, HUD elements',
    },
  ],

  presetBuilders: [
    BUILTIN_CHARACTER_PRESET,
    BUILTIN_ITEM_PRESET,
    BUILTIN_ENVIRONMENT_PRESET,
  ],

  isDefault: true,
  isReadOnly: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 웹 콘텐츠 테마
 */
export const WEB_CONTENT_THEME: PromptTheme = {
  id: 'theme-web-content',
  name: '웹 콘텐츠',
  usageType: 'web',
  description: '웹사이트, 블로그, SNS용 이미지 생성에 최적화',
  icon: '🌐',

  artStyles: [
    {
      value: 'concept-art' as ArtStyle,
      label: '일러스트',
      description: '웹용 일러스트레이션',
      example: 'digital illustration, web design, modern style',
    },
    {
      value: 'character-design' as ArtStyle,
      label: '사실적',
      description: '사진 같은 리얼리스틱 스타일',
      example: 'photorealistic, realistic, high detail',
    },
    {
      value: 'ui-icons' as ArtStyle,
      label: '미니멀',
      description: '심플하고 깔끔한 미니멀 디자인',
      example: 'minimal design, clean, simple, flat design',
    },
    {
      value: 'environment' as ArtStyle,
      label: '추상',
      description: '추상적이고 아티스틱한 스타일',
      example: 'abstract art, artistic, creative design',
    },
  ],

  presetBuilders: [
    BUILTIN_HERO_PRESET,
    BUILTIN_BANNER_PRESET,
    BUILTIN_ICON_PRESET,
    BUILTIN_ILLUSTRATION_PRESET,
  ],

  isDefault: true,
  isReadOnly: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 일반 용도 테마
 */
export const GENERAL_PURPOSE_THEME: PromptTheme = {
  id: 'theme-general',
  name: '일반 용도',
  usageType: 'general',
  description: '다양한 목적으로 사용 가능한 범용 이미지 생성',
  icon: '✨',

  artStyles: [
    {
      value: 'concept-art' as ArtStyle,
      label: '아트워크',
      description: '일반적인 디지털 아트워크',
      example: 'digital art, artwork, illustration',
    },
    {
      value: 'character-design' as ArtStyle,
      label: '사진',
      description: '사진 스타일의 이미지',
      example: 'photography, photo style, realistic',
    },
    {
      value: 'pixel-art' as ArtStyle,
      label: '픽셀 아트',
      description: '픽셀 아트 스타일',
      example: 'pixel art, 8-bit, retro style',
    },
    {
      value: 'ui-icons' as ArtStyle,
      label: '그래픽 디자인',
      description: '그래픽 디자인 요소',
      example: 'graphic design, vector art, modern',
    },
    {
      value: 'environment' as ArtStyle,
      label: '풍경/장면',
      description: '풍경 및 장면 이미지',
      example: 'landscape, scenery, atmospheric',
    },
  ],

  presetBuilders: [
    BUILTIN_PORTRAIT_PRESET,
    BUILTIN_LANDSCAPE_PRESET,
    BUILTIN_PRODUCT_PRESET,
    BUILTIN_ABSTRACT_PRESET,
  ],

  isDefault: true,
  isReadOnly: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 모든 기본 테마
 */
export const DEFAULT_THEMES: PromptTheme[] = [
  GAME_ASSET_THEME,
  WEB_CONTENT_THEME,
  GENERAL_PURPOSE_THEME,
];

/**
 * 사용 목적별 기본 테마 가져오기
 */
export function getDefaultThemeByUsageType(
  usageType: 'game' | 'web' | 'general'
): PromptTheme {
  return DEFAULT_THEMES.find((theme) => theme.usageType === usageType)!;
}
