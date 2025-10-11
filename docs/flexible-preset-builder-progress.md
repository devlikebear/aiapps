# Flexible Preset Builder System - Progress Report

**Branch**: `feature/63-flexible-preset-builder`
**Issue**: #63
**Status**: 🚧 In Progress (Foundation Complete, Integration Needed)

## 완료된 작업 ✅

### 1. 핵심 아키텍처 (`lib/art/preset-builder-schema.ts`)
- ✅ `PresetBuilderSchema` 타입 정의
- ✅ `PresetGroup` 및 `PresetField` 구조
- ✅ 6가지 필드 타입 지원
  - `text`, `number`, `select`, `multiselect`, `slider`, `textarea`
- ✅ 11개 단위 타입 지원
  - `px`, `em`, `rem`, `%`, `m`, `cm`, `mm`, `kg`, `g`, `s`, `ms`
- ✅ 프롬프트 템플릿 시스템
  - `{{value}}` 및 `{{unit}}` 변수 치환
  - `interpolatePromptTemplate()` 함수
  - `buildPromptFromSchema()` 함수
- ✅ 헬퍼 함수들
  - `createEmptyPresetSchema()`
  - `createEmptyGroup()`
  - `createEmptyField()`

### 2. 빌트인 프리셋 (총 11개) (`lib/art/builtin-presets.ts`)

#### 게임 에셋 (3개)
- ✅ **캐릭터 프리셋** (`BUILTIN_CHARACTER_PRESET`)
  - 기본 정보: 성별, 종족, 클래스
  - 외형: 나이, 헤어스타일, 체형
  - 장비: 갑옷, 무기

- ✅ **아이템 프리셋** (`BUILTIN_ITEM_PRESET`)
  - 기본 정보: 아이템 타입, 희귀도
  - 외형: 재질, 스타일, 상태

- ✅ **환경 프리셋** (`BUILTIN_ENVIRONMENT_PRESET`)
  - 장소: 생물군계, 구조물
  - 분위기: 시간대, 날씨, 분위기

#### 웹 콘텐츠 (4개)
- ✅ **히어로 섹션** (`BUILTIN_HERO_PRESET`)
  - 주제: 산업 분야, 분위기
  - 구성: 주요 요소, 레이아웃, 피사계 심도

- ✅ **배너** (`BUILTIN_BANNER_PRESET`)
  - 배너 타입: 형식, 목적
  - 스타일: 색상 스킴, 비주얼 스타일

- ✅ **아이콘** (`BUILTIN_ICON_PRESET`)
  - 아이콘 타입: 카테고리, 주제
  - 디자인: 스타일, 복잡도

- ✅ **일러스트** (`BUILTIN_ILLUSTRATION_PRESET`)
  - 주제: 장면, 맥락
  - 스타일: 아트 스타일, 색상 팔레트

#### 일반 용도 (4개)
- ✅ **인물 사진** (`BUILTIN_PORTRAIT_PRESET`)
  - 피사체: 사진 타입, 인물, 표정
  - 기술적 설정: 조명, 배경

- ✅ **풍경 사진** (`BUILTIN_LANDSCAPE_PRESET`)
  - 장소: 지형, 계절
  - 분위기: 시간, 날씨

- ✅ **제품 사진** (`BUILTIN_PRODUCT_PRESET`)
  - 제품 정보: 카테고리, 스타일
  - 연출: 각도, 배경, 조명

- ✅ **추상 예술** (`BUILTIN_ABSTRACT_PRESET`)
  - 구성: 형태, 패턴
  - 비주얼: 색상 스킴, 질감, 분위기

### 3. UI 컴포넌트

#### PresetBuilderEditor (`components/art/PresetBuilderEditor.tsx`)
- ✅ 프리셋 스키마 편집 UI
- ✅ 그룹 추가/삭제/수정
- ✅ 필드 추가/삭제/수정
- ✅ 필드 타입 선택
- ✅ 프롬프트 템플릿 편집
- ✅ 실시간 프롬프트 미리보기
- ✅ 확장/축소 가능한 그룹
- 🚧 드래그 앤 드롭 (UI만 있음, 기능 미구현)

#### DynamicPresetForm (`components/art/DynamicPresetForm.tsx`)
- ✅ PresetBuilderSchema 기반 동적 폼 생성
- ✅ 모든 필드 타입 렌더링
  - text, number (단위 포함), slider, select, multiselect, textarea
- ✅ 실시간 값 업데이트
- ✅ 그룹별 확장/축소

### 4. 타입 시스템 업데이트

#### PromptTheme (`lib/art/prompt-theme.ts`)
- ✅ `presetBuilders` 타입 변경
  ```typescript
  // Before
  presetBuilders: {
    character?: CharacterPreset;
    item?: ItemPreset;
    environment?: EnvironmentPreset;
  }

  // After
  presetBuilders: PresetBuilderSchema[]
  ```

#### 기본 테마 (`lib/art/default-themes.ts`)
- ✅ 게임 에셋 테마: 캐릭터, 아이템, 환경 프리셋
- ✅ 웹 콘텐츠 테마: 히어로, 배너, 아이콘, 일러스트 프리셋
- ✅ 일반 용도 테마: 인물, 풍경, 제품, 추상 프리셋

---

## 남은 작업 🚧

### 1. 기존 코드 통합 (최우선)

#### `app/apps/art-generator/create/page.tsx`
**문제**: 하드코딩된 프리셋 참조
```typescript
// ❌ 현재 (오류 발생)
if (theme.presetBuilders.character) {
  setCharacterPreset(theme.presetBuilders.character);
}

// ✅ 수정 필요
// 1. 프리셋 빌더 선택 UI 추가
// 2. 선택된 프리셋 스키마를 상태로 관리
// 3. buildPromptFromSchema() 사용하여 프롬프트 생성
```

**필요한 변경사항**:
1. `currentPresetSchema` 상태 추가
2. 프리셋 선택 드롭다운 추가 (테마의 presetBuilders 배열에서 선택)
3. `DynamicPresetForm` 컴포넌트 사용
4. 기존 `CharacterPromptForm`, `ItemPromptForm`, `EnvironmentPromptForm` 제거 또는 deprecated 처리
5. `buildPromptFromSchema()` 사용하여 프롬프트 생성

#### `components/art/ThemeManagementModal.tsx`
**문제**: 하드코딩된 프리셋 구조
```typescript
// ❌ 현재 (오류 발생)
const presetBuilders = {
  character: characterPreset,
  item: itemPreset,
  environment: environmentPreset,
};

// ✅ 수정 필요
// 1. 프리셋 빌더 배열로 관리
// 2. PresetBuilderEditor 사용하여 편집
```

**필요한 변경사항**:
1. `presetBuilders` 상태를 배열로 변경
2. 프리셋 추가/삭제 UI
3. 각 프리셋에 `PresetBuilderEditor` 사용
4. 기존 프리셋 폼 제거

### 2. 프리셋 선택 UI

**위치**: `app/apps/art-generator/create/page.tsx`
**요구사항**:
- 현재 테마의 `presetBuilders` 배열에서 프리셋 선택
- 드롭다운 또는 탭 형태
- 선택한 프리셋에 따라 `DynamicPresetForm` 렌더링

**예시 UI**:
```typescript
<div>
  <label>프리셋 타입</label>
  <select value={selectedPresetId} onChange={handlePresetSelect}>
    {currentTheme.presetBuilders.map(preset => (
      <option key={preset.id} value={preset.id}>
        {preset.icon} {preset.name}
      </option>
    ))}
  </select>
</div>

<DynamicPresetForm
  schema={selectedPreset}
  onChange={setSelectedPreset}
/>
```

### 3. 프롬프트 생성 로직 업데이트

**현재**: 하드코딩된 `PromptBuilder.buildPrompt(preset)`
**변경**: `buildPromptFromSchema(presetSchema)`

```typescript
// Before
const generatedPrompt = PromptBuilder.buildPrompt(characterPreset);

// After
const generatedPrompt = buildPromptFromSchema(selectedPresetSchema);
```

### 4. 테스트

#### 기본 기능 테스트
- [ ] 각 테마에서 프리셋 선택 가능
- [ ] 프리셋 필드 값 입력
- [ ] 프롬프트 자동 생성 확인
- [ ] 이미지 생성 테스트

#### 빌트인 프리셋 테스트
- [ ] 게임 에셋 (3개)
- [ ] 웹 콘텐츠 (4개)
- [ ] 일반 용도 (4개)

#### 커스텀 프리셋 테스트
- [ ] 테마 생성 시 프리셋 추가
- [ ] 프리셋 편집 (PresetBuilderEditor)
- [ ] 그룹/필드 추가/삭제
- [ ] 저장 및 로드

### 5. 마이그레이션

**기존 테마 호환성**:
- 기존 테마는 이전 구조 (`{ character, item, environment }`)
- 새 구조는 배열 (`PresetBuilderSchema[]`)
- IndexedDB에서 로드 시 자동 변환 필요

**마이그레이션 전략**:
```typescript
// theme-storage.ts에 추가
function migrateOldPresetStructure(theme: any): PromptTheme {
  if (!Array.isArray(theme.presetBuilders)) {
    // 이전 구조 감지
    const presets: PresetBuilderSchema[] = [];
    if (theme.presetBuilders.character) {
      // 이전 CharacterPreset → 새 PresetBuilderSchema 변환
      presets.push(convertCharacterPreset(theme.presetBuilders.character));
    }
    // ... item, environment도 동일하게 변환
    theme.presetBuilders = presets;
  }
  return theme;
}
```

### 6. Deprecated 처리

**제거할 파일** (사용자에게 확인 필요):
- `lib/art/presets/character.ts`
- `lib/art/presets/item.ts`
- `lib/art/presets/environment.ts`
- `lib/art/prompt-builder.ts`
- `components/art/CharacterPromptForm.tsx`
- `components/art/ItemPromptForm.tsx`
- `components/art/EnvironmentPromptForm.tsx`

---

## 다음 세션 작업 순서

### Step 1: 타입 에러 해결
1. `app/apps/art-generator/create/page.tsx` 수정
   - 프리셋 빌더 상태를 배열로 변경
   - 프리셋 선택 UI 추가
   - `DynamicPresetForm` 통합

2. `components/art/ThemeManagementModal.tsx` 수정
   - 프리셋 빌더 배열 관리
   - `PresetBuilderEditor` 통합

### Step 2: UI 통합
1. 프리셋 선택 드롭다운 구현
2. 동적 프리셋 폼 연결
3. 프롬프트 생성 버튼 업데이트

### Step 3: 테스트
1. 각 빌트인 프리셋 테스트
2. 커스텀 프리셋 생성/편집 테스트
3. 이미지 생성 플로우 테스트

### Step 4: PR 생성 및 병합
1. 최종 검증 (lint, type-check, test)
2. PR 생성
3. 병합 후 main으로 복귀

---

## 참고 자료

### 핵심 함수
```typescript
// 프롬프트 생성
buildPromptFromSchema(schema: PresetBuilderSchema): string

// 변수 치환
interpolatePromptTemplate(template: string, value: string | number | string[], unit?: PresetFieldUnit): string

// 빈 스키마 생성
createEmptyPresetSchema(name: string): PresetBuilderSchema
createEmptyGroup(name: string, order: number): PresetGroup
createEmptyField(label: string, type: PresetFieldType, order: number): PresetField
```

### 사용 예시
```typescript
// 1. 프리셋 선택
const selectedPreset = theme.presetBuilders[0];

// 2. 사용자 입력 (DynamicPresetForm이 자동 처리)
<DynamicPresetForm
  schema={selectedPreset}
  onChange={setSelectedPreset}
/>

// 3. 프롬프트 생성
const prompt = buildPromptFromSchema(selectedPreset);
// 결과: "male, human, warrior, young adult, short hair, athletic build, leather armor, wielding sword"

// 4. 이미지 생성
await generateImage({ prompt, style, ... });
```

---

## 커밋 이력

### Commit 1: Foundation
```
feat(art): flexible preset builder schema with 11 built-in presets

- Core architecture and type system
- 11 built-in presets (3 game + 4 web + 4 general)
- PresetBuilderEditor and DynamicPresetForm UI
- Update PromptTheme to use PresetBuilderSchema[]
```

**Files Changed**:
- `lib/art/preset-builder-schema.ts` (new, 201 lines)
- `lib/art/builtin-presets.ts` (new, 900+ lines)
- `components/art/PresetBuilderEditor.tsx` (new, 450+ lines)
- `components/art/DynamicPresetForm.tsx` (new, 170+ lines)
- `lib/art/prompt-theme.ts` (modified)
- `lib/art/default-themes.ts` (modified)

**Total**: +2079 lines, -27 lines

---

## 노트

- 이 작업은 대규모 리팩토링이며 기존 코드와의 호환성을 유지하면서 진행해야 함
- 사용자가 이미 생성한 테마가 있을 수 있으므로 마이그레이션 로직 필수
- 모든 빌트인 프리셋은 실제 사용 사례를 고려하여 설계됨
- 드래그 앤 드롭 기능은 추후 구현 예정 (현재는 order 필드로 순서 관리)
