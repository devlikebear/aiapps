/**
 * 유연한 프리셋 빌더 스키마
 * 사용자가 완전히 새로운 프리셋 타입을 생성할 수 있는 확장 가능한 구조
 */

/**
 * 필드 타입
 */
export type PresetFieldType =
  | 'text' // 자유 텍스트 입력
  | 'number' // 숫자 입력
  | 'select' // 단일 선택 드롭다운
  | 'multiselect' // 다중 선택
  | 'slider' // 슬라이더 (min/max 범위)
  | 'textarea'; // 여러 줄 텍스트

/**
 * 단위 타입
 */
export type PresetFieldUnit =
  | 'px'
  | 'em'
  | 'rem'
  | '%'
  | 'm'
  | 'cm'
  | 'mm'
  | 'kg'
  | 'g'
  | 's'
  | 'ms';

/**
 * 프리셋 필드 정의
 */
export interface PresetField {
  id: string;
  label: string; // 사용자에게 표시되는 레이블
  type: PresetFieldType;
  value: string | number | string[]; // 현재 값
  order: number; // 정렬 순서

  // 선택 타입 옵션
  options?: string[]; // select, multiselect용

  // 숫자 타입 옵션
  min?: number;
  max?: number;
  step?: number;
  unit?: PresetFieldUnit; // 숫자 단위

  // 프롬프트 생성
  promptTemplate: string; // 예: "{{value}} shaped stone", "size: {{value}}{{unit}}"

  // 메타데이터
  placeholder?: string;
  helpText?: string; // 사용자 안내 텍스트
}

/**
 * 프리셋 그룹 정의
 */
export interface PresetGroup {
  id: string;
  name: string; // 그룹 이름 (예: "외형", "크기", "재질")
  icon?: string; // 그룹 아이콘 (이모지)
  order: number; // 정렬 순서
  fields: PresetField[];
  collapsed?: boolean; // UI에서 접힘 상태
}

/**
 * 프리셋 빌더 스키마
 */
export interface PresetBuilderSchema {
  id: string;
  name: string; // 프리셋 이름 (예: "캐릭터 프리셋", "돌 프리셋")
  description?: string;
  icon?: string; // 프리셋 아이콘 (이모지)
  groups: PresetGroup[];

  // 메타데이터
  isBuiltIn: boolean; // 빌트인 프리셋 여부
  usageType?: 'game' | 'web' | 'general'; // 사용 목적 분류
  createdAt: string;
  updatedAt: string;
}

/**
 * 프롬프트 템플릿 변수 치환
 */
export function interpolatePromptTemplate(
  template: string,
  value: string | number | string[],
  unit?: PresetFieldUnit
): string {
  let result = template;

  // {{value}} 치환
  if (Array.isArray(value)) {
    result = result.replace(/\{\{value\}\}/g, value.join(', '));
  } else {
    result = result.replace(/\{\{value\}\}/g, String(value));
  }

  // {{unit}} 치환
  if (unit) {
    result = result.replace(/\{\{unit\}\}/g, unit);
  } else {
    result = result.replace(/\{\{unit\}\}/g, '');
  }

  return result.trim();
}

/**
 * 프리셋 빌더에서 전체 프롬프트 생성
 */
export function buildPromptFromSchema(schema: PresetBuilderSchema): string {
  const prompts: string[] = [];

  // groups가 없으면 빈 문자열 반환
  if (!schema.groups || !Array.isArray(schema.groups)) {
    return '';
  }

  // 그룹을 order 순으로 정렬
  const sortedGroups = [...schema.groups].sort((a, b) => a.order - b.order);

  for (const group of sortedGroups) {
    // 필드를 order 순으로 정렬
    const sortedFields = [...group.fields].sort((a, b) => a.order - b.order);

    for (const field of sortedFields) {
      // 값이 비어있으면 스킵
      if (
        field.value === '' ||
        field.value === undefined ||
        field.value === null ||
        (Array.isArray(field.value) && field.value.length === 0)
      ) {
        continue;
      }

      const prompt = interpolatePromptTemplate(
        field.promptTemplate,
        field.value,
        field.unit
      );
      if (prompt) {
        prompts.push(prompt);
      }
    }
  }

  return prompts.join(', ');
}

/**
 * 빈 프리셋 빌더 스키마 생성
 */
export function createEmptyPresetSchema(name: string): PresetBuilderSchema {
  return {
    id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: '',
    icon: '🎨',
    groups: [],
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 빈 그룹 생성
 */
export function createEmptyGroup(name: string, order: number): PresetGroup {
  return {
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    icon: '📋',
    order,
    fields: [],
    collapsed: false,
  };
}

/**
 * 빈 필드 생성
 */
export function createEmptyField(
  label: string,
  type: PresetFieldType,
  order: number
): PresetField {
  const defaultValue = type === 'multiselect' ? [] : type === 'number' ? 0 : '';

  return {
    id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    type,
    value: defaultValue,
    order,
    promptTemplate: '{{value}}',
  };
}
