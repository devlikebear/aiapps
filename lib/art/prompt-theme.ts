/**
 * 프롬프트 테마 시스템
 * 사용 목적별 아트 스타일 및 프리셋 빌더 설정을 테마로 관리
 */

import type { ArtStyle, UsageType } from './types';
import type { PresetBuilderSchema } from './preset-builder-schema';

/**
 * 프롬프트 테마 인터페이스
 */
export interface PromptTheme {
  id: string;
  name: string;
  usageType: UsageType;
  description: string;
  icon?: string;

  // 사용 가능한 아트 스타일 목록
  artStyles: Array<{
    value: ArtStyle;
    label: string;
    description: string;
    example?: string;
  }>;

  // 프리셋 빌더 스키마 배열 (유연한 구조)
  presetBuilders: PresetBuilderSchema[];

  // 메타데이터
  isDefault: boolean;
  isReadOnly: boolean; // 기본 테마는 수정 불가
  createdAt: string;
  updatedAt: string;
}

/**
 * 테마 생성 입력
 */
export interface CreateThemeInput {
  name: string;
  usageType: UsageType;
  description: string;
  artStyles: PromptTheme['artStyles'];
  presetBuilders: PromptTheme['presetBuilders'];
}

/**
 * 테마 업데이트 입력
 */
export interface UpdateThemeInput {
  name?: string;
  description?: string;
  artStyles?: PromptTheme['artStyles'];
  presetBuilders?: PromptTheme['presetBuilders'];
}
