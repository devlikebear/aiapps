// PromptBuilder: 프리셋을 자연어 프롬프트로 변환하는 유틸리티 클래스

import type { CharacterPreset } from './presets/character';
import type { ItemPreset } from './presets/item';
import type { EnvironmentPreset } from './presets/environment';
import {
  GENDER_OPTIONS,
  RACE_OPTIONS,
  CLASS_OPTIONS,
  AGE_OPTIONS,
  BODY_TYPE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  SKIN_TONE_OPTIONS,
  WEAPON_OPTIONS,
  ARMOR_OPTIONS,
  ACCESSORY_OPTIONS,
  STANCE_OPTIONS,
  DIRECTION_OPTIONS,
  EXPRESSION_OPTIONS,
  PIXEL_SIZE_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  OUTLINE_STYLE_OPTIONS,
} from './presets/character';
import {
  ITEM_CATEGORY_OPTIONS,
  ITEM_WEAPON_TYPE_OPTIONS,
  ITEM_ARMOR_TYPE_OPTIONS,
  POTION_TYPE_OPTIONS,
  TREASURE_TYPE_OPTIONS,
  FOOD_TYPE_OPTIONS,
  ITEM_RARITY_OPTIONS,
  ITEM_VIEW_OPTIONS,
  ITEM_SIZE_OPTIONS,
} from './presets/item';
import {
  ENVIRONMENT_TYPE_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  WEATHER_OPTIONS,
  PERSPECTIVE_OPTIONS,
  MOOD_OPTIONS,
} from './presets/environment';

export type PromptPreset = CharacterPreset | ItemPreset | EnvironmentPreset;

export class PromptBuilder {
  /**
   * 캐릭터 프리셋을 프롬프트로 변환
   */
  static buildCharacterPrompt(preset: CharacterPreset): string {
    const parts: string[] = [];

    // 1. 픽셀 아트 스타일
    const pixelStyle = PIXEL_SIZE_OPTIONS[preset.style.pixelSize];
    const colorPalette = COLOR_PALETTE_OPTIONS[preset.style.colorPalette];
    parts.push(`${pixelStyle} pixel art`);

    // 2. 기본 속성
    const age = AGE_OPTIONS[preset.age];
    const gender = GENDER_OPTIONS[preset.gender];
    const race = RACE_OPTIONS[preset.race];
    const characterClass = CLASS_OPTIONS[preset.class];
    const bodyType = BODY_TYPE_OPTIONS[preset.bodyType];

    let characterDesc = `${age} ${gender} ${race}`;
    if (preset.class !== 'none') {
      characterDesc += ` ${characterClass}`;
    }
    characterDesc += ` with ${bodyType} body type`;
    parts.push(characterDesc);

    // 4. 외형
    const hairStyle = HAIR_STYLE_OPTIONS[preset.appearance.hairStyle];
    const skinTone = SKIN_TONE_OPTIONS[preset.appearance.skinTone];
    parts.push(
      `${hairStyle}, ${preset.appearance.hairColor} hair color, ${preset.appearance.eyeColor} eyes, ${skinTone} skin`
    );

    // 5. 장비
    const equipmentParts: string[] = [];
    if (preset.equipment.weapon !== 'none') {
      const weapon = WEAPON_OPTIONS[preset.equipment.weapon];
      equipmentParts.push(`holding ${weapon}`);
    }
    if (preset.equipment.armor !== 'none') {
      const armor = ARMOR_OPTIONS[preset.equipment.armor];
      equipmentParts.push(`wearing ${armor}`);
    }
    if (preset.equipment.shield) {
      equipmentParts.push('with shield');
    }
    if (preset.equipment.cape) {
      equipmentParts.push('with cape');
    }
    if (preset.equipment.accessories.length > 0) {
      const accessories = preset.equipment.accessories
        .map((acc) => ACCESSORY_OPTIONS[acc])
        .join(', ');
      equipmentParts.push(`wearing ${accessories}`);
    }
    if (equipmentParts.length > 0) {
      parts.push(equipmentParts.join(', '));
    }

    // 6. 포즈/표정
    const stance = STANCE_OPTIONS[preset.pose.stance];
    const direction = DIRECTION_OPTIONS[preset.pose.direction];
    const expression = EXPRESSION_OPTIONS[preset.pose.expression];
    parts.push(`${stance} pose, ${direction} view, ${expression} expression`);

    // 7. 스타일 옵션
    const styleParts: string[] = [];
    styleParts.push(`${colorPalette} color palette`);
    if (preset.style.outlineStyle !== 'none') {
      const outline = OUTLINE_STYLE_OPTIONS[preset.style.outlineStyle];
      styleParts.push(`${outline} outline`);
    }
    parts.push(styleParts.join(', '));

    // 8. 최종 조합
    return parts.join(', ');
  }

  /**
   * 아이템 프리셋을 프롬프트로 변환
   */
  static buildItemPrompt(preset: ItemPreset): string {
    const parts: string[] = [];

    // 1. 픽셀 아트 (기본)
    parts.push('pixel art');

    // 2. 등급
    const rarity = ITEM_RARITY_OPTIONS[preset.visual.rarity];
    parts.push(`${rarity} grade`);

    // 3. 카테고리 및 타입
    const category = ITEM_CATEGORY_OPTIONS[preset.category];
    let itemType = category;

    if (preset.category === 'weapon' && preset.weaponType) {
      itemType = ITEM_WEAPON_TYPE_OPTIONS[preset.weaponType];
    } else if (preset.category === 'armor' && preset.armorType) {
      itemType = ITEM_ARMOR_TYPE_OPTIONS[preset.armorType];
    } else if (preset.category === 'potion' && preset.potionType) {
      itemType = POTION_TYPE_OPTIONS[preset.potionType];
    } else if (preset.category === 'treasure' && preset.treasureType) {
      itemType = TREASURE_TYPE_OPTIONS[preset.treasureType];
    } else if (preset.category === 'food' && preset.foodType) {
      itemType = FOOD_TYPE_OPTIONS[preset.foodType];
    }

    parts.push(itemType);

    // 4. 시각 효과
    const effects: string[] = [];
    if (preset.visual.enchanted) {
      effects.push('magical effect');
    }
    if (preset.visual.glowing) {
      effects.push('glowing');
    }
    if (preset.visual.sparkles) {
      effects.push('with sparkles');
    }
    if (effects.length > 0) {
      parts.push(effects.join(', '));
    }

    // 5. 뷰 및 사이즈
    const view = ITEM_VIEW_OPTIONS[preset.view];
    const size = ITEM_SIZE_OPTIONS[preset.size];
    parts.push(`${view}, ${size}`);

    // 6. 색상 (선택적)
    if (preset.primaryColor) {
      parts.push(`primary color ${preset.primaryColor}`);
    }
    if (preset.secondaryColor) {
      parts.push(`secondary color ${preset.secondaryColor}`);
    }

    // 7. 최종 조합
    return parts.join(', ');
  }

  /**
   * 환경/배경 프리셋을 프롬프트로 변환
   */
  static buildEnvironmentPrompt(preset: EnvironmentPreset): string {
    const parts: string[] = [];

    // 1. 픽셀 아트 (기본)
    parts.push('pixel art');

    // 2. 환경 타입
    const environment = ENVIRONMENT_TYPE_OPTIONS[preset.environment];
    parts.push(`${environment} background`);

    // 3. 시간/날씨
    const timeOfDay = TIME_OF_DAY_OPTIONS[preset.timeOfDay];
    const weather = WEATHER_OPTIONS[preset.weather];
    parts.push(`${timeOfDay}, ${weather} weather`);

    // 4. 분위기
    const mood = MOOD_OPTIONS[preset.mood];
    parts.push(`${mood} mood`);

    // 5. 퍼스펙티브
    const perspective = PERSPECTIVE_OPTIONS[preset.perspective];
    parts.push(`${perspective} perspective`);

    // 6. 레이어
    const layerInfo: string[] = [];
    if (preset.layers.foreground) layerInfo.push('foreground');
    if (preset.layers.midground) layerInfo.push('midground');
    if (preset.layers.background) layerInfo.push('background');
    if (preset.layers.parallax) layerInfo.push('with parallax effect');
    if (layerInfo.length > 0) {
      parts.push(`layers: ${layerInfo.join(', ')}`);
    }

    // 7. 타일링
    if (preset.tileability) {
      parts.push('tileable');
    }

    // 8. 색상 (선택적)
    if (preset.dominantColor) {
      parts.push(`dominant color ${preset.dominantColor}`);
    }
    if (preset.accentColor) {
      parts.push(`accent color ${preset.accentColor}`);
    }

    // 9. 최종 조합
    return parts.join(', ');
  }

  /**
   * 프리셋 타입에 따라 자동으로 적절한 프롬프트 빌더 호출
   */
  static buildPrompt(preset: PromptPreset): string {
    if ('gender' in preset) {
      // CharacterPreset
      return this.buildCharacterPrompt(preset);
    } else if ('category' in preset) {
      // ItemPreset
      return this.buildItemPrompt(preset);
    } else {
      // EnvironmentPreset
      return this.buildEnvironmentPrompt(preset);
    }
  }
}
