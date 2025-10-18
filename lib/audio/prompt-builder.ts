/**
 * 오디오 프롬프트 빌더
 * 프리셋 데이터를 자연어 프롬프트로 변환
 */

import type {
  AudioPresetBuilderSchema,
  PresetValues,
} from './preset-builder-schema';

/**
 * 프리셋 값들을 자연어 프롬프트로 변환
 */
export class AudioPromptBuilder {
  /**
   * BGM 프롬프트 생성
   */
  static buildBGMPrompt(
    preset: AudioPresetBuilderSchema,
    values: PresetValues
  ): string {
    if (preset.type !== 'bgm') {
      throw new Error('Invalid preset type: expected BGM');
    }

    const parts: string[] = [];

    // 장르별 기본 소개
    const genreIntro = this.getGenreIntro(preset.genre);
    if (genreIntro) {
      parts.push(genreIntro);
    }

    // 무드
    const mood = values['mood'] || values['mood'];
    if (mood) {
      parts.push(`with ${mood} atmosphere`);
    }

    // 악기
    const instruments = values['instruments'];
    if (instruments) {
      if (Array.isArray(instruments) && instruments.length > 0) {
        parts.push(`featuring ${instruments.join(', ')}`);
      } else if (typeof instruments === 'string') {
        parts.push(`featuring ${instruments}`);
      }
    }

    // 구조
    const structure = values['structure'];
    if (structure) {
      parts.push(`with ${structure} structure`);
    }

    // 스케일/키
    const scale = values['scale'];
    if (scale && scale !== 'none') {
      parts.push(`in ${scale}`);
    }

    // BPM (범위 또는 값)
    const bpm = values['bpm'];
    if (bpm) {
      parts.push(`${bpm} BPM`);
    }

    // 시간 서명
    const timeSignature = values['timeSignature'];
    if (timeSignature) {
      parts.push(`with ${timeSignature} time signature`);
    }

    // 이펙트
    const effects = values['effects'];
    if (effects) {
      if (Array.isArray(effects) && effects.length > 0) {
        parts.push(`with ${effects.join(' and ')} effects`);
      } else if (typeof effects === 'string') {
        parts.push(`with ${effects} effect`);
      }
    }

    // 추가 설명
    const additionalNotes = values['additionalNotes'];
    if (additionalNotes && additionalNotes !== '') {
      parts.push(additionalNotes as string);
    }

    return parts.join(', ');
  }

  /**
   * SFX 프롬프트 생성
   */
  static buildSFXPrompt(
    preset: AudioPresetBuilderSchema,
    values: PresetValues
  ): string {
    if (preset.type !== 'sfx') {
      throw new Error('Invalid preset type: expected SFX');
    }

    const parts: string[] = [];

    // 카테고리별 기본 소개
    const categoryIntro = this.getSFXCategoryIntro(preset.sfxCategory);
    if (categoryIntro) {
      parts.push(categoryIntro);
    }

    // 구체적 설명
    const description = values['description'];
    if (description) {
      parts.push(description as string);
    }

    // 무드/특성/성격
    const mood = values['mood'];
    if (mood) {
      if (Array.isArray(mood) && mood.length > 0) {
        parts.push(`with ${mood.join(' and ')} character`);
      } else if (typeof mood === 'string') {
        parts.push(`with ${mood} character`);
      }
    }

    // 악기/음원
    const soundSource = values['soundSource'];
    if (soundSource) {
      parts.push(`using ${soundSource as string}`);
    }

    // 지속시간
    const duration = values['duration'];
    if (duration) {
      parts.push(`${duration} seconds in length`);
    }

    // 인텐시티 (강도)
    const intensity = values['intensity'];
    if (intensity && typeof intensity === 'number') {
      const intensityLabel =
        intensity < 0.3 ? 'subtle' : intensity < 0.7 ? 'moderate' : 'intense';
      parts.push(`${intensityLabel} intensity`);
    }

    // 이펙트
    const effects = values['effects'];
    if (effects) {
      if (Array.isArray(effects) && effects.length > 0) {
        parts.push(`with ${effects.join(', ')} effects`);
      } else if (typeof effects === 'string') {
        parts.push(`with ${effects} effect`);
      }
    }

    return parts.join(', ');
  }

  /**
   * 프리셋 타입에 따라 자동으로 프롬프트 생성
   */
  static buildPrompt(
    preset: AudioPresetBuilderSchema,
    values: PresetValues
  ): string {
    if (preset.type === 'bgm') {
      return this.buildBGMPrompt(preset, values);
    } else if (preset.type === 'sfx') {
      return this.buildSFXPrompt(preset, values);
    } else {
      throw new Error(`Unknown preset type: ${preset.type}`);
    }
  }

  /**
   * 게임 장르별 기본 소개
   */
  private static getGenreIntro(
    genre?: 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro'
  ): string {
    switch (genre) {
      case 'rpg':
        return 'Epic orchestral fantasy game music';
      case 'fps':
        return 'Intense electronic action game music';
      case 'puzzle':
        return 'Calm ambient puzzle game music';
      case 'racing':
        return 'Energetic racing game music';
      case 'retro':
        return '8-bit chiptune retro game music';
      default:
        return 'Game background music';
    }
  }

  /**
   * SFX 카테고리별 기본 소개
   */
  private static getSFXCategoryIntro(
    category?: 'ui' | 'environment' | 'impact' | 'magic' | 'voice'
  ): string {
    switch (category) {
      case 'ui':
        return 'User interface click and notification sound effect';
      case 'environment':
        return 'Natural ambient environmental sound';
      case 'impact':
        return 'Heavy impact collision or explosion sound effect';
      case 'magic':
        return 'Magical spell cast and enchantment sound effect';
      case 'voice':
        return 'Character voice and vocal sound effect';
      default:
        return 'Sound effect';
    }
  }

  /**
   * 여러 부분 프롬프트를 결합
   */
  static combinePromptParts(...parts: string[]): string {
    return parts.filter((part) => part && part.trim().length > 0).join(', ');
  }

  /**
   * 프롬프트에서 필드 템플릿 치환
   */
  static applyTemplate(
    template: string,
    values: Record<string, unknown>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      if (result.includes(placeholder)) {
        result = result.replace(
          new RegExp(placeholder, 'g'),
          String(value || '')
        );
      }
    }
    return result;
  }

  /**
   * 프롬프트 길이 분석
   */
  static analyzePromptLength(prompt: string): {
    characterCount: number;
    wordCount: number;
    estimatedTokens: number;
  } {
    const characterCount = prompt.length;
    const wordCount = prompt.split(/\s+/).length;
    // 대략적인 토큰 추정 (평균 4 characters per token)
    const estimatedTokens = Math.ceil(characterCount / 4);

    return {
      characterCount,
      wordCount,
      estimatedTokens,
    };
  }
}
