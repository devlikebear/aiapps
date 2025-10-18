/**
 * 오디오 프리셋 빌더 스키마
 * 오디오 프리셋의 구조를 정의하는 스키마
 */

/**
 * 필드 타입
 */
export type FieldType =
  | 'select'
  | 'range'
  | 'checkbox'
  | 'multiselect'
  | 'textarea';

/**
 * 프리셋 필드 인터페이스
 */
export interface PresetField {
  id: string;
  label: string;
  type: FieldType;
  value: string | number | string[] | boolean;
  order: number;

  // Select, Multiselect 옵션
  options?: (string | number)[];

  // Range 설정
  min?: number;
  max?: number;
  step?: number;

  // 프롬프트 템플릿
  promptTemplate?: string;

  // UI 힌트
  placeholder?: string;
  description?: string;
  required?: boolean;
}

/**
 * 프리셋 그룹 인터페이스
 */
export interface PresetGroup {
  id: string;
  name: string;
  icon?: string;
  order: number;
  fields: PresetField[];
}

/**
 * 오디오 프리셋 빌더 스키마
 */
export interface AudioPresetBuilderSchema {
  id: string;
  name: string;
  description: string;
  icon?: string;

  // 프리셋 타입
  type: 'bgm' | 'sfx';

  // 게임 장르 (BGM용)
  genre?: 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro';

  // SFX 카테고리
  sfxCategory?: 'ui' | 'environment' | 'impact' | 'magic' | 'voice';

  // 프리셋 그룹들
  groups: PresetGroup[];

  // 메타데이터
  isBuiltIn: boolean;
  isDefault?: boolean;
  isReadOnly?: boolean;

  // 타임스탬프
  createdAt: string;
  updatedAt: string;
}

/**
 * 프리셋 필드 값 맵
 */
export type PresetValues = Record<string, string | number | string[] | boolean>;

/**
 * 프리셋 검증 결과
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 프롬프트 생성 컨텍스트
 */
export interface PromptContext {
  preset: AudioPresetBuilderSchema;
  values: PresetValues;
}

/**
 * 프리셋 필드 생성 헬퍼
 */
export function createPresetField(
  overrides: Partial<PresetField>
): PresetField {
  return {
    id: overrides.id || '',
    label: overrides.label || '',
    type: overrides.type || 'select',
    value: overrides.value ?? '',
    order: overrides.order ?? 0,
    ...overrides,
  };
}

/**
 * 프리셋 그룹 생성 헬퍼
 */
export function createPresetGroup(
  overrides: Partial<PresetGroup>
): PresetGroup {
  return {
    id: overrides.id || '',
    name: overrides.name || '',
    order: overrides.order ?? 0,
    fields: overrides.fields || [],
    ...overrides,
  };
}

/**
 * 오디오 프리셋 빌더 스키마 생성 헬퍼
 */
export function createAudioPreset(
  overrides: Partial<AudioPresetBuilderSchema>
): AudioPresetBuilderSchema {
  const now = new Date().toISOString();
  return {
    id: overrides.id || '',
    name: overrides.name || '',
    description: overrides.description || '',
    type: overrides.type || 'bgm',
    groups: overrides.groups || [],
    isBuiltIn: overrides.isBuiltIn ?? false,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    ...overrides,
  };
}

/**
 * 프리셋 유효성 검사
 */
export function validatePresetValues(
  schema: AudioPresetBuilderSchema,
  values: PresetValues
): ValidationResult {
  const errors: Record<string, string> = {};

  schema.groups.forEach((group) => {
    group.fields.forEach((field) => {
      // 필수 필드 검사
      if (field.required) {
        const value = values[field.id];
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          errors[field.id] = `${field.label}은(는) 필수입니다`;
        }
      }

      // 범위 검사 (Range 타입)
      if (field.type === 'range' && typeof values[field.id] === 'number') {
        const value = values[field.id] as number;
        if (field.min !== undefined && value < field.min) {
          errors[field.id] =
            `${field.label}은(는) ${field.min} 이상이어야 합니다`;
        }
        if (field.max !== undefined && value > field.max) {
          errors[field.id] =
            `${field.label}은(는) ${field.max} 이하여야 합니다`;
        }
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 프리셋에서 필드 찾기
 */
export function findPresetField(
  schema: AudioPresetBuilderSchema,
  fieldId: string
): PresetField | undefined {
  for (const group of schema.groups) {
    const field = group.fields.find((f) => f.id === fieldId);
    if (field) {
      return field;
    }
  }
  return undefined;
}
