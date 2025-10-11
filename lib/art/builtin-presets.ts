/**
 * 빌트인 프리셋 빌더 스키마
 * 사용 목적별로 제공되는 기본 프리셋
 */

import type { PresetBuilderSchema } from './preset-builder-schema';

// ============================================
// GAME ASSETS (게임 에셋)
// ============================================

/**
 * 캐릭터 프리셋
 */
export const BUILTIN_CHARACTER_PRESET: PresetBuilderSchema = {
  id: 'builtin-character',
  name: '캐릭터',
  description: '게임 캐릭터 생성용 프리셋',
  icon: '🧍',
  isBuiltIn: true,
  usageType: 'game',
  groups: [
    {
      id: 'char-basic',
      name: '기본 정보',
      icon: '👤',
      order: 0,
      fields: [
        {
          id: 'char-gender',
          label: '성별',
          type: 'select',
          value: 'male',
          order: 0,
          options: ['male', 'female', 'non-binary', 'other'],
          promptTemplate: '{{value}}',
        },
        {
          id: 'char-race',
          label: '종족',
          type: 'select',
          value: 'human',
          order: 1,
          options: ['human', 'elf', 'dwarf', 'orc', 'robot', 'monster'],
          promptTemplate: '{{value}}',
        },
        {
          id: 'char-class',
          label: '클래스',
          type: 'select',
          value: 'warrior',
          order: 2,
          options: ['warrior', 'mage', 'archer', 'rogue', 'healer', 'tank'],
          promptTemplate: '{{value}}',
        },
      ],
    },
    {
      id: 'char-appearance',
      name: '외형',
      icon: '✨',
      order: 1,
      fields: [
        {
          id: 'char-age',
          label: '나이',
          type: 'select',
          value: 'young adult',
          order: 0,
          options: [
            'child',
            'teenager',
            'young adult',
            'middle-aged',
            'elderly',
          ],
          promptTemplate: '{{value}}',
        },
        {
          id: 'char-hairstyle',
          label: '헤어스타일',
          type: 'select',
          value: 'short',
          order: 1,
          options: ['short', 'long', 'bald', 'ponytail', 'braided', 'spiky'],
          promptTemplate: '{{value}} hair',
        },
        {
          id: 'char-build',
          label: '체형',
          type: 'select',
          value: 'athletic',
          order: 2,
          options: ['slim', 'athletic', 'muscular', 'heavy', 'petite'],
          promptTemplate: '{{value}} build',
        },
      ],
    },
    {
      id: 'char-equipment',
      name: '장비',
      icon: '⚔️',
      order: 2,
      fields: [
        {
          id: 'char-armor',
          label: '갑옷',
          type: 'select',
          value: 'leather',
          order: 0,
          options: [
            'none',
            'cloth',
            'leather',
            'chainmail',
            'plate',
            'magical',
          ],
          promptTemplate: '{{value}} armor',
        },
        {
          id: 'char-weapon',
          label: '무기',
          type: 'select',
          value: 'sword',
          order: 1,
          options: ['sword', 'axe', 'bow', 'staff', 'dagger', 'hammer', 'gun'],
          promptTemplate: 'wielding {{value}}',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 아이템 프리셋
 */
export const BUILTIN_ITEM_PRESET: PresetBuilderSchema = {
  id: 'builtin-item',
  name: '아이템',
  description: '게임 아이템/장비 생성용 프리셋',
  icon: '⚔️',
  isBuiltIn: true,
  usageType: 'game',
  groups: [
    {
      id: 'item-basic',
      name: '기본 정보',
      icon: '📦',
      order: 0,
      fields: [
        {
          id: 'item-type',
          label: '아이템 타입',
          type: 'select',
          value: 'weapon',
          order: 0,
          options: [
            'weapon',
            'armor',
            'accessory',
            'consumable',
            'tool',
            'material',
          ],
          promptTemplate: '{{value}}',
        },
        {
          id: 'item-rarity',
          label: '희귀도',
          type: 'select',
          value: 'common',
          order: 1,
          options: [
            'common',
            'uncommon',
            'rare',
            'epic',
            'legendary',
            'mythic',
          ],
          promptTemplate: '{{value}} quality',
        },
      ],
    },
    {
      id: 'item-appearance',
      name: '외형',
      icon: '✨',
      order: 1,
      fields: [
        {
          id: 'item-material',
          label: '재질',
          type: 'select',
          value: 'iron',
          order: 0,
          options: [
            'wood',
            'iron',
            'steel',
            'gold',
            'silver',
            'crystal',
            'bone',
            'magical',
          ],
          promptTemplate: 'made of {{value}}',
        },
        {
          id: 'item-style',
          label: '스타일',
          type: 'select',
          value: 'medieval',
          order: 1,
          options: [
            'medieval',
            'futuristic',
            'steampunk',
            'fantasy',
            'cyberpunk',
            'tribal',
          ],
          promptTemplate: '{{value}} style',
        },
        {
          id: 'item-condition',
          label: '상태',
          type: 'select',
          value: 'pristine',
          order: 2,
          options: [
            'pristine',
            'worn',
            'damaged',
            'rusted',
            'enchanted',
            'cursed',
          ],
          promptTemplate: '{{value}} condition',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 환경 프리셋
 */
export const BUILTIN_ENVIRONMENT_PRESET: PresetBuilderSchema = {
  id: 'builtin-environment',
  name: '환경',
  description: '게임 배경/장소 생성용 프리셋',
  icon: '🏞️',
  isBuiltIn: true,
  usageType: 'game',
  groups: [
    {
      id: 'env-location',
      name: '장소',
      icon: '📍',
      order: 0,
      fields: [
        {
          id: 'env-biome',
          label: '생물군계',
          type: 'select',
          value: 'forest',
          order: 0,
          options: [
            'forest',
            'desert',
            'mountain',
            'ocean',
            'cave',
            'city',
            'dungeon',
            'space',
          ],
          promptTemplate: '{{value}}',
        },
        {
          id: 'env-structure',
          label: '구조물',
          type: 'select',
          value: 'none',
          order: 1,
          options: [
            'none',
            'castle',
            'village',
            'ruins',
            'temple',
            'tower',
            'bridge',
          ],
          promptTemplate: 'with {{value}}',
        },
      ],
    },
    {
      id: 'env-atmosphere',
      name: '분위기',
      icon: '🌤️',
      order: 1,
      fields: [
        {
          id: 'env-time',
          label: '시간대',
          type: 'select',
          value: 'day',
          order: 0,
          options: ['dawn', 'day', 'dusk', 'night', 'twilight'],
          promptTemplate: '{{value}} time',
        },
        {
          id: 'env-weather',
          label: '날씨',
          type: 'select',
          value: 'clear',
          order: 1,
          options: ['clear', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'],
          promptTemplate: '{{value}} weather',
        },
        {
          id: 'env-mood',
          label: '분위기',
          type: 'select',
          value: 'peaceful',
          order: 2,
          options: [
            'peaceful',
            'mysterious',
            'ominous',
            'magical',
            'desolate',
            'vibrant',
          ],
          promptTemplate: '{{value}} atmosphere',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// WEB CONTENT (웹 콘텐츠)
// ============================================

/**
 * 히어로 섹션 프리셋
 */
export const BUILTIN_HERO_PRESET: PresetBuilderSchema = {
  id: 'builtin-hero',
  name: '히어로 섹션',
  description: '웹사이트 히어로 섹션 이미지 생성용',
  icon: '🎯',
  isBuiltIn: true,
  usageType: 'web',
  groups: [
    {
      id: 'hero-theme',
      name: '주제',
      icon: '🎨',
      order: 0,
      fields: [
        {
          id: 'hero-industry',
          label: '산업 분야',
          type: 'select',
          value: 'technology',
          order: 0,
          options: [
            'technology',
            'finance',
            'healthcare',
            'education',
            'retail',
            'travel',
            'food',
          ],
          promptTemplate: '{{value}} industry',
        },
        {
          id: 'hero-mood',
          label: '분위기',
          type: 'select',
          value: 'professional',
          order: 1,
          options: [
            'professional',
            'creative',
            'friendly',
            'modern',
            'luxury',
            'energetic',
          ],
          promptTemplate: '{{value}} mood',
        },
      ],
    },
    {
      id: 'hero-composition',
      name: '구성',
      icon: '📐',
      order: 1,
      fields: [
        {
          id: 'hero-focus',
          label: '주요 요소',
          type: 'select',
          value: 'product',
          order: 0,
          options: [
            'product',
            'person',
            'workspace',
            'cityscape',
            'nature',
            'abstract',
          ],
          promptTemplate: 'featuring {{value}}',
        },
        {
          id: 'hero-layout',
          label: '레이아웃',
          type: 'select',
          value: 'centered',
          order: 1,
          options: [
            'centered',
            'left-aligned',
            'right-aligned',
            'split-screen',
          ],
          promptTemplate: '{{value}} composition',
        },
        {
          id: 'hero-depth',
          label: '피사계 심도',
          type: 'select',
          value: 'medium',
          order: 2,
          options: ['shallow', 'medium', 'deep'],
          promptTemplate: '{{value}} depth of field',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 배너 프리셋
 */
export const BUILTIN_BANNER_PRESET: PresetBuilderSchema = {
  id: 'builtin-banner',
  name: '배너',
  description: '웹 배너 광고 이미지 생성용',
  icon: '🏷️',
  isBuiltIn: true,
  usageType: 'web',
  groups: [
    {
      id: 'banner-type',
      name: '배너 타입',
      icon: '📱',
      order: 0,
      fields: [
        {
          id: 'banner-format',
          label: '형식',
          type: 'select',
          value: 'horizontal',
          order: 0,
          options: ['horizontal', 'vertical', 'square', 'wide'],
          promptTemplate: '{{value}} format',
        },
        {
          id: 'banner-purpose',
          label: '목적',
          type: 'select',
          value: 'promotion',
          order: 1,
          options: ['promotion', 'announcement', 'sale', 'event', 'newsletter'],
          promptTemplate: '{{value}} banner',
        },
      ],
    },
    {
      id: 'banner-style',
      name: '스타일',
      icon: '🎨',
      order: 1,
      fields: [
        {
          id: 'banner-color-scheme',
          label: '색상 스킴',
          type: 'select',
          value: 'vibrant',
          order: 0,
          options: ['vibrant', 'pastel', 'monochrome', 'gradient', 'neon'],
          promptTemplate: '{{value}} colors',
        },
        {
          id: 'banner-visual-style',
          label: '비주얼 스타일',
          type: 'select',
          value: 'modern',
          order: 1,
          options: ['modern', 'retro', 'minimal', 'bold', 'playful', 'elegant'],
          promptTemplate: '{{value}} style',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 아이콘 프리셋
 */
export const BUILTIN_ICON_PRESET: PresetBuilderSchema = {
  id: 'builtin-icon',
  name: '아이콘',
  description: '웹/앱 아이콘 생성용',
  icon: '🔷',
  isBuiltIn: true,
  usageType: 'web',
  groups: [
    {
      id: 'icon-type',
      name: '아이콘 타입',
      icon: '📦',
      order: 0,
      fields: [
        {
          id: 'icon-category',
          label: '카테고리',
          type: 'select',
          value: 'ui',
          order: 0,
          options: [
            'ui',
            'social',
            'navigation',
            'media',
            'communication',
            'business',
          ],
          promptTemplate: '{{value}} icon',
        },
        {
          id: 'icon-subject',
          label: '주제',
          type: 'text',
          value: 'settings',
          order: 1,
          promptTemplate: '{{value}}',
          placeholder: 'e.g., settings, home, search',
        },
      ],
    },
    {
      id: 'icon-design',
      name: '디자인',
      icon: '✏️',
      order: 1,
      fields: [
        {
          id: 'icon-style',
          label: '스타일',
          type: 'select',
          value: 'outline',
          order: 0,
          options: ['outline', 'filled', 'duotone', 'flat', '3d', 'gradient'],
          promptTemplate: '{{value}} style',
        },
        {
          id: 'icon-complexity',
          label: '복잡도',
          type: 'select',
          value: 'simple',
          order: 1,
          options: ['simple', 'detailed', 'minimal'],
          promptTemplate: '{{value}} design',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 일러스트레이션 프리셋
 */
export const BUILTIN_ILLUSTRATION_PRESET: PresetBuilderSchema = {
  id: 'builtin-illustration',
  name: '일러스트',
  description: '웹 일러스트레이션 생성용',
  icon: '🎨',
  isBuiltIn: true,
  usageType: 'web',
  groups: [
    {
      id: 'illust-subject',
      name: '주제',
      icon: '🖼️',
      order: 0,
      fields: [
        {
          id: 'illust-scene',
          label: '장면',
          type: 'select',
          value: 'people',
          order: 0,
          options: [
            'people',
            'workspace',
            'teamwork',
            'success',
            'concept',
            'process',
          ],
          promptTemplate: '{{value}}',
        },
        {
          id: 'illust-context',
          label: '맥락',
          type: 'text',
          value: '',
          order: 1,
          promptTemplate: '{{value}}',
          placeholder: 'e.g., remote working, collaboration',
        },
      ],
    },
    {
      id: 'illust-style',
      name: '스타일',
      icon: '🎭',
      order: 1,
      fields: [
        {
          id: 'illust-art-style',
          label: '아트 스타일',
          type: 'select',
          value: 'flat',
          order: 0,
          options: [
            'flat',
            'isometric',
            'hand-drawn',
            'geometric',
            'abstract',
            'cartoon',
          ],
          promptTemplate: '{{value}} illustration',
        },
        {
          id: 'illust-color-palette',
          label: '색상 팔레트',
          type: 'select',
          value: 'bright',
          order: 1,
          options: ['bright', 'pastel', 'muted', 'monochrome', 'gradient'],
          promptTemplate: '{{value}} colors',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// GENERAL PURPOSE (일반 용도)
// ============================================

/**
 * 인물 사진 프리셋
 */
export const BUILTIN_PORTRAIT_PRESET: PresetBuilderSchema = {
  id: 'builtin-portrait',
  name: '인물 사진',
  description: '인물 사진 생성용',
  icon: '👤',
  isBuiltIn: true,
  usageType: 'general',
  groups: [
    {
      id: 'portrait-subject',
      name: '피사체',
      icon: '🧑',
      order: 0,
      fields: [
        {
          id: 'portrait-type',
          label: '사진 타입',
          type: 'select',
          value: 'headshot',
          order: 0,
          options: [
            'headshot',
            'half-body',
            'full-body',
            'close-up',
            'environmental',
          ],
          promptTemplate: '{{value}} portrait',
        },
        {
          id: 'portrait-subject-type',
          label: '인물',
          type: 'select',
          value: 'adult',
          order: 1,
          options: ['adult', 'child', 'elderly', 'professional', 'casual'],
          promptTemplate: '{{value}}',
        },
        {
          id: 'portrait-expression',
          label: '표정',
          type: 'select',
          value: 'smiling',
          order: 2,
          options: [
            'smiling',
            'serious',
            'laughing',
            'thoughtful',
            'confident',
            'friendly',
          ],
          promptTemplate: '{{value}} expression',
        },
      ],
    },
    {
      id: 'portrait-technical',
      name: '기술적 설정',
      icon: '📸',
      order: 1,
      fields: [
        {
          id: 'portrait-lighting',
          label: '조명',
          type: 'select',
          value: 'natural',
          order: 0,
          options: [
            'natural',
            'studio',
            'dramatic',
            'soft',
            'backlit',
            'golden-hour',
          ],
          promptTemplate: '{{value}} lighting',
        },
        {
          id: 'portrait-background',
          label: '배경',
          type: 'select',
          value: 'blurred',
          order: 1,
          options: [
            'blurred',
            'solid-color',
            'outdoor',
            'indoor',
            'textured',
            'white',
          ],
          promptTemplate: '{{value}} background',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 풍경 사진 프리셋
 */
export const BUILTIN_LANDSCAPE_PRESET: PresetBuilderSchema = {
  id: 'builtin-landscape',
  name: '풍경 사진',
  description: '풍경/자연 사진 생성용',
  icon: '🏔️',
  isBuiltIn: true,
  usageType: 'general',
  groups: [
    {
      id: 'landscape-location',
      name: '장소',
      icon: '🗺️',
      order: 0,
      fields: [
        {
          id: 'landscape-terrain',
          label: '지형',
          type: 'select',
          value: 'mountain',
          order: 0,
          options: [
            'mountain',
            'beach',
            'forest',
            'desert',
            'lake',
            'city',
            'rural',
          ],
          promptTemplate: '{{value}}',
        },
        {
          id: 'landscape-season',
          label: '계절',
          type: 'select',
          value: 'summer',
          order: 1,
          options: ['spring', 'summer', 'autumn', 'winter'],
          promptTemplate: '{{value}} season',
        },
      ],
    },
    {
      id: 'landscape-atmosphere',
      name: '분위기',
      icon: '🌅',
      order: 1,
      fields: [
        {
          id: 'landscape-time',
          label: '시간',
          type: 'select',
          value: 'daytime',
          order: 0,
          options: [
            'sunrise',
            'daytime',
            'sunset',
            'golden-hour',
            'blue-hour',
            'night',
          ],
          promptTemplate: '{{value}}',
        },
        {
          id: 'landscape-weather',
          label: '날씨',
          type: 'select',
          value: 'clear',
          order: 1,
          options: ['clear', 'cloudy', 'misty', 'rainy', 'stormy', 'snowy'],
          promptTemplate: '{{value}} weather',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 제품 사진 프리셋
 */
export const BUILTIN_PRODUCT_PRESET: PresetBuilderSchema = {
  id: 'builtin-product',
  name: '제품 사진',
  description: '상품/제품 사진 생성용',
  icon: '📦',
  isBuiltIn: true,
  usageType: 'general',
  groups: [
    {
      id: 'product-type',
      name: '제품 정보',
      icon: '🏷️',
      order: 0,
      fields: [
        {
          id: 'product-category',
          label: '카테고리',
          type: 'select',
          value: 'electronics',
          order: 0,
          options: [
            'electronics',
            'fashion',
            'food',
            'cosmetics',
            'furniture',
            'accessories',
          ],
          promptTemplate: '{{value}} product',
        },
        {
          id: 'product-style',
          label: '스타일',
          type: 'select',
          value: 'modern',
          order: 1,
          options: [
            'modern',
            'vintage',
            'minimalist',
            'luxury',
            'rustic',
            'industrial',
          ],
          promptTemplate: '{{value}} style',
        },
      ],
    },
    {
      id: 'product-presentation',
      name: '연출',
      icon: '📸',
      order: 1,
      fields: [
        {
          id: 'product-angle',
          label: '각도',
          type: 'select',
          value: 'front',
          order: 0,
          options: ['front', 'side', '45-degree', 'top-down', 'detail'],
          promptTemplate: '{{value}} view',
        },
        {
          id: 'product-background',
          label: '배경',
          type: 'select',
          value: 'white',
          order: 1,
          options: [
            'white',
            'black',
            'gradient',
            'lifestyle',
            'textured',
            'transparent',
          ],
          promptTemplate: '{{value}} background',
        },
        {
          id: 'product-lighting',
          label: '조명',
          type: 'select',
          value: 'studio',
          order: 2,
          options: [
            'studio',
            'natural',
            'dramatic',
            'soft',
            'high-key',
            'low-key',
          ],
          promptTemplate: '{{value}} lighting',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 추상 예술 프리셋
 */
export const BUILTIN_ABSTRACT_PRESET: PresetBuilderSchema = {
  id: 'builtin-abstract',
  name: '추상 예술',
  description: '추상적 아트워크 생성용',
  icon: '🌀',
  isBuiltIn: true,
  usageType: 'general',
  groups: [
    {
      id: 'abstract-composition',
      name: '구성',
      icon: '🎨',
      order: 0,
      fields: [
        {
          id: 'abstract-form',
          label: '형태',
          type: 'select',
          value: 'geometric',
          order: 0,
          options: [
            'geometric',
            'organic',
            'fluid',
            'fractal',
            'minimal',
            'chaotic',
          ],
          promptTemplate: '{{value}} forms',
        },
        {
          id: 'abstract-pattern',
          label: '패턴',
          type: 'select',
          value: 'repeating',
          order: 1,
          options: ['repeating', 'random', 'symmetrical', 'flowing', 'layered'],
          promptTemplate: '{{value}} pattern',
        },
      ],
    },
    {
      id: 'abstract-visual',
      name: '비주얼',
      icon: '✨',
      order: 1,
      fields: [
        {
          id: 'abstract-color-scheme',
          label: '색상 스킴',
          type: 'select',
          value: 'vibrant',
          order: 0,
          options: [
            'vibrant',
            'monochrome',
            'pastel',
            'neon',
            'earth-tones',
            'gradient',
          ],
          promptTemplate: '{{value}} color scheme',
        },
        {
          id: 'abstract-texture',
          label: '질감',
          type: 'select',
          value: 'smooth',
          order: 1,
          options: [
            'smooth',
            'rough',
            'glossy',
            'matte',
            'metallic',
            'transparent',
          ],
          promptTemplate: '{{value}} texture',
        },
        {
          id: 'abstract-mood',
          label: '분위기',
          type: 'select',
          value: 'energetic',
          order: 2,
          options: [
            'energetic',
            'calm',
            'mysterious',
            'playful',
            'dramatic',
            'serene',
          ],
          promptTemplate: '{{value}} mood',
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

export const ALL_BUILTIN_PRESETS: PresetBuilderSchema[] = [
  // Game Assets
  BUILTIN_CHARACTER_PRESET,
  BUILTIN_ITEM_PRESET,
  BUILTIN_ENVIRONMENT_PRESET,
  // Web Content
  BUILTIN_HERO_PRESET,
  BUILTIN_BANNER_PRESET,
  BUILTIN_ICON_PRESET,
  BUILTIN_ILLUSTRATION_PRESET,
  // General Purpose
  BUILTIN_PORTRAIT_PRESET,
  BUILTIN_LANDSCAPE_PRESET,
  BUILTIN_PRODUCT_PRESET,
  BUILTIN_ABSTRACT_PRESET,
];

/**
 * 사용 목적별 빌트인 프리셋 가져오기
 */
export function getBuiltinPresetsByUsageType(
  usageType: 'game' | 'web' | 'general'
): PresetBuilderSchema[] {
  return ALL_BUILTIN_PRESETS.filter((preset) => preset.usageType === usageType);
}

/**
 * ID로 빌트인 프리셋 찾기
 */
export function getBuiltinPresetById(
  id: string
): PresetBuilderSchema | undefined {
  return ALL_BUILTIN_PRESETS.find((preset) => preset.id === id);
}
