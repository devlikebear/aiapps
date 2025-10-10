# AI 아트 생성기 기능 보완 프로젝트

## 📋 프로젝트 개요

AI 아트 생성기의 사용성 및 품질 향상을 위한 3가지 핵심 기능 추가:
1. **게임/웹 타입 선택** - 사용 목적에 맞는 최적화된 설정 제공
2. **레퍼런스 이미지 업로드** - AI 인풋으로 사용하여 일관성 및 품질 향상
3. **프리셋 프롬프트 조합기** - 게임 캐릭터 커스텀 방식의 직관적 인터페이스

---

## 🎯 기능 1: 게임/웹 타입 선택

### 목적
사용 목적에 따라 최적화된 프리셋과 설정을 제공하여 초보자도 쉽게 고품질 결과물 생성

### UI/UX 설계

#### 위치
- 페이지 최상단 (타이틀 바로 아래)
- 모든 다른 설정보다 우선 표시

#### 디자인
```
┌─────────────────────────────────────────────────────────┐
│ 🎨 AI 아트 생성기                                         │
│ 2D 게임 아트를 AI로 생성하세요                             │
├─────────────────────────────────────────────────────────┤
│ 📱 사용 목적 선택                                         │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│ │  🎮 게임  │  │  🌐 웹    │  │  🎨 일반  │              │
│ └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

### 타입별 프리셋

#### 🎮 게임 타입
```typescript
{
  type: 'game',
  name: '게임 에셋',
  description: '게임 개발에 최적화된 설정',
  defaults: {
    format: 'png',           // 투명도 지원
    resolution: '512x512',   // 타일/스프라이트 친화적
    aspectRatio: '1:1',      // 정사각형 (범용성)
    quality: 'high',         // 재사용성 고려
    colorProfile: 'sRGB',
  },
  optimizations: {
    transparency: true,      // 투명 배경 지원
    tileability: true,       // 타일링 가능 패턴
    spriteReady: true,       // 스프라이트 시트 준비
  },
  presets: [
    'pixel-art',
    'character-design',
    'environment',
    'ui-icons'
  ]
}
```

#### 🌐 웹 타입
```typescript
{
  type: 'web',
  name: '웹 콘텐츠',
  description: '웹사이트/앱 UI에 최적화된 설정',
  defaults: {
    format: 'webp',          // 웹 최적화
    resolution: '1920x1080', // 일반적인 웹 해상도
    aspectRatio: '16:9',     // 와이드스크린
    quality: 'standard',     // 로딩 속도 고려
    colorProfile: 'sRGB',
  },
  optimizations: {
    fileSize: 'optimized',   // 파일 크기 최적화
    responsive: true,        // 반응형 대응
    retina: true,            // 레티나 디스플레이 지원
  },
  presets: [
    'concept-art',
    'character-design',
    'ui-icons'
  ]
}
```

#### 🎨 일반 타입
```typescript
{
  type: 'general',
  name: '일반 용도',
  description: '자유로운 창작을 위한 기본 설정',
  defaults: {
    format: 'png',
    resolution: '1024x1024',
    aspectRatio: '1:1',
    quality: 'standard',
    colorProfile: 'sRGB',
  },
  optimizations: {},
  presets: [
    'pixel-art',
    'concept-art',
    'character-design',
    'environment',
    'ui-icons'
  ]
}
```

### 타입 데이터 구조

```typescript
// lib/art/types.ts 추가
export type UsageType = 'game' | 'web' | 'general';

export interface UsageTypePreset {
  type: UsageType;
  name: string;
  description: string;
  icon: string;
  defaults: {
    format: ImageFormat;
    resolution: ResolutionPreset;
    aspectRatio: AspectRatio;
    quality: QualityPreset;
    colorProfile: 'sRGB' | 'Adobe RGB';
  };
  optimizations: {
    transparency?: boolean;
    tileability?: boolean;
    spriteReady?: boolean;
    fileSize?: 'optimized' | 'standard';
    responsive?: boolean;
    retina?: boolean;
  };
  availableStyles: ArtStyle[];
}

export const USAGE_TYPE_PRESETS: Record<UsageType, UsageTypePreset> = {
  // ... 위 프리셋 내용
};
```

---

## 🖼️ 기능 2: 레퍼런스 이미지 업로드

### 목적
- 스타일 일관성 유지
- 캐릭터/객체 일관성 확보
- 색상 팔레트 참조
- 구도/레이아웃 가이드

### UI/UX 설계

#### 위치
프롬프트 입력 영역 바로 위 또는 옆

#### 디자인
```
┌─────────────────────────────────────────────────────────┐
│ 📎 레퍼런스 이미지 (선택사항)                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  ┌────────┐  ┌────────┐  ┌────────┐                │ │
│ │  │        │  │        │  │        │                │ │
│ │  │  이미지1│  │  이미지2│  │   +    │                │ │
│ │  │        │  │        │  │  추가  │                │ │
│ │  └────────┘  └────────┘  └────────┘                │ │
│ │                                                     │ │
│ │  ⚙️ 레퍼런스 활용 방식                               │ │
│ │  ○ 스타일 참조   ○ 구도 참조   ○ 색상 팔레트         │ │
│ │  ○ 캐릭터 일관성 ○ 객체 참조                         │ │
│ │                                                     │ │
│ │  🎚️ 영향력: ▓▓▓▓▓▓▓▓░░ 80%                         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 레퍼런스 이미지 처리

#### 업로드 제한
```typescript
const REFERENCE_IMAGE_CONSTRAINTS = {
  maxFiles: 3,              // 최대 3개
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
  minDimension: 256,        // 최소 256px
  maxDimension: 2048,       // 최대 2048px
};
```

#### 활용 방식 옵션
```typescript
export type ReferenceUsage =
  | 'style'           // 스타일 참조 (색감, 질감, 아트스타일)
  | 'composition'     // 구도 참조 (레이아웃, 위치)
  | 'color-palette'   // 색상 팔레트 추출
  | 'character'       // 캐릭터 일관성 (같은 캐릭터 생성)
  | 'object'          // 객체 참조 (특정 아이템/요소)
  | 'combined';       // 복합 활용

export interface ReferenceImageConfig {
  images: Array<{
    id: string;
    file: File;
    preview: string;       // Base64 미리보기
    usage: ReferenceUsage;
  }>;
  influence: number;       // 0-100 (영향력)
  blendMode?: 'weak' | 'medium' | 'strong';
}
```

### 컴포넌트 구조

```typescript
// components/art/ReferenceImageUploader.tsx
interface ReferenceImageUploaderProps {
  maxImages?: number;
  onImagesChange: (config: ReferenceImageConfig) => void;
  disabled?: boolean;
}

export function ReferenceImageUploader({ ... }: ReferenceImageUploaderProps) {
  const [images, setImages] = useState<ReferenceImageConfig['images']>([]);
  const [influence, setInfluence] = useState(70);
  const [selectedUsage, setSelectedUsage] = useState<ReferenceUsage>('style');

  // 이미지 업로드 핸들러
  const handleImageUpload = async (files: FileList) => {
    // 파일 검증
    // 리사이징 (필요시)
    // Base64 변환
    // 미리보기 생성
  };

  // 이미지 제거 핸들러
  const handleImageRemove = (id: string) => { ... };

  // 활용 방식 변경
  const handleUsageChange = (id: string, usage: ReferenceUsage) => { ... };

  return (
    <div className="reference-uploader">
      {/* 업로드된 이미지 미리보기 */}
      <ImageGrid images={images} onRemove={handleImageRemove} />

      {/* 업로드 버튼 */}
      <UploadButton onUpload={handleImageUpload} disabled={disabled} />

      {/* 활용 방식 선택 */}
      <UsageSelector value={selectedUsage} onChange={setSelectedUsage} />

      {/* 영향력 슬라이더 */}
      <InfluenceSlider value={influence} onChange={setInfluence} />
    </div>
  );
}
```

### API 통합

```typescript
// lib/art/types.ts 수정
export interface ArtGenerateRequest {
  // ... 기존 필드

  // 레퍼런스 이미지 (추가)
  referenceImages?: {
    images: string[];           // Base64 배열
    usage: ReferenceUsage;
    influence: number;          // 0-100
  };
}
```

---

## 🎮 기능 3: 프리셋 프롬프트 조합기

### 목적
게임 캐릭터 커스터마이징 방식의 직관적 UI로 고품질 프롬프트 자동 생성

### UI/UX 설계 개념

현재의 단순 텍스트 입력 → **단계별 선택 시스템**으로 전환

```
┌─────────────────────────────────────────────────────────┐
│ 🎨 프롬프트 빌더                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1️⃣ 에셋 타입 선택                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │  캐릭터 │ │   적   │ │ 아이템  │ │  배경  │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                          │
│  2️⃣ 캐릭터 세부 설정                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 성별:   ○ 남성  ● 여성  ○ 중성                   │   │
│  │ 종족:   [Human ▼]                                │   │
│  │ 직업:   [Warrior ▼]                              │   │
│  │ 연령:   ▓▓▓▓░░░░░░ 청년                         │   │
│  │ 체형:   ○ 마른  ● 보통  ○ 건장                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  3️⃣ 외형 커스터마이징                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 헤어스타일: [Long ▼]                             │   │
│  │ 헤어 컬러: [#FF5733] 🎨                          │   │
│  │ 눈 색상:   [#4A90E2] 🎨                          │   │
│  │ 피부톤:    [Fair ▼]                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  4️⃣ 장비 및 액세서리                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 무기:   [Sword ▼]                                │   │
│  │ 갑옷:   [Plate Armor ▼]                          │   │
│  │ 망토:   ☑ 있음  [Red Cape]                       │   │
│  │ 장신구: ☑ 목걸이  ☑ 반지  ☐ 왕관                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  5️⃣ 포즈 및 표정                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 포즈:   [Idle ▼]  👀 프리뷰                       │   │
│  │ 표정:   [Neutral ▼]                              │   │
│  │ 각도:   ○ 정면  ● 3/4  ○ 측면  ○ 후면            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  📝 생성된 프롬프트 (수정 가능)                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ A young adult female human warrior with long    │   │
│  │ red hair and blue eyes, fair skin, wearing      │   │
│  │ plate armor and red cape, holding a sword,      │   │
│  │ 3/4 view, neutral expression, idle pose         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [ 🔀 프롬프트 재생성 ]  [ ✨ AI 개선 제안 받기 ]         │
└─────────────────────────────────────────────────────────┘
```

### 아트 스타일별 프리셋 구조

#### 1. 픽셀 아트 (Pixel Art)

##### 캐릭터 프리셋
```typescript
export interface PixelArtCharacterPreset {
  assetType: 'character' | 'enemy' | 'npc';

  // 기본 속성
  gender: 'male' | 'female' | 'neutral';
  race: 'human' | 'elf' | 'dwarf' | 'orc' | 'undead' | 'robot';
  class: 'warrior' | 'mage' | 'rogue' | 'archer' | 'cleric' | 'paladin';
  age: 'child' | 'teen' | 'adult' | 'elder';
  bodyType: 'slim' | 'normal' | 'muscular' | 'heavy';

  // 외형
  appearance: {
    hairStyle: 'short' | 'long' | 'bald' | 'ponytail' | 'spiky';
    hairColor: string;  // HEX
    eyeColor: string;   // HEX
    skinTone: 'pale' | 'fair' | 'tan' | 'dark' | 'green' | 'blue';
  };

  // 장비
  equipment: {
    weapon: 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'none';
    armor: 'leather' | 'chainmail' | 'plate' | 'robe' | 'none';
    shield: boolean;
    cape: boolean;
    accessories: Array<'helmet' | 'crown' | 'mask' | 'necklace' | 'ring'>;
  };

  // 포즈/애니메이션
  pose: {
    stance: 'idle' | 'walking' | 'attacking' | 'jumping' | 'casting';
    direction: 'front' | 'back' | 'side' | '3/4';
    expression: 'neutral' | 'angry' | 'happy' | 'sad' | 'surprised';
  };

  // 스타일 옵션
  style: {
    pixelSize: '8-bit' | '16-bit' | '32-bit';
    colorPalette: 'retro' | 'vibrant' | 'monochrome' | 'pastel';
    outlineStyle: 'black' | 'colored' | 'none';
  };
}
```

##### 아이템 프리셋
```typescript
export interface PixelArtItemPreset {
  assetType: 'item';

  category: 'weapon' | 'armor' | 'potion' | 'treasure' | 'food' | 'misc';

  // 무기
  weaponType?: 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'spear';
  weaponTier?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  // 포션/소비품
  potionType?: 'health' | 'mana' | 'stamina' | 'buff' | 'poison';

  // 보물
  treasureType?: 'gold' | 'gem' | 'artifact' | 'chest' | 'key';

  // 시각적 속성
  visual: {
    rarity: 'common' | 'rare' | 'legendary';  // 반짝임 효과
    enchanted: boolean;                        // 마법 효과
    glowing: boolean;                          // 발광 효과
  };

  // 표현
  view: 'icon' | 'sprite' | 'detailed';
  size: 'small' | 'medium' | 'large';
}
```

##### 배경/환경 프리셋
```typescript
export interface PixelArtEnvironmentPreset {
  assetType: 'background' | 'tileset';

  environment: 'forest' | 'dungeon' | 'cave' | 'castle' | 'town' | 'desert';

  // 시간/날씨
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather: 'clear' | 'rain' | 'snow' | 'fog' | 'storm';

  // 레이어
  layers: {
    foreground: boolean;
    midground: boolean;
    background: boolean;
    parallax: boolean;  // 시차 효과
  };

  // 스타일
  perspective: 'side-scroll' | 'top-down' | 'isometric';
  tileability: boolean;  // 타일링 가능 여부

  // 분위기
  mood: 'peaceful' | 'mysterious' | 'dangerous' | 'magical';
}
```

#### 2. 컨셉 아트 (Concept Art)

```typescript
export interface ConceptArtPreset {
  assetType: 'character' | 'creature' | 'vehicle' | 'building' | 'weapon';

  // 기본
  theme: 'fantasy' | 'sci-fi' | 'modern' | 'post-apocalyptic' | 'steampunk';
  complexity: 'simple' | 'moderate' | 'detailed' | 'highly-detailed';

  // 시각 스타일
  renderStyle: 'sketch' | 'painting' | 'digital' | 'watercolor';
  lineWork: 'clean' | 'rough' | 'none';
  shading: 'flat' | 'cel-shaded' | 'realistic' | 'dramatic';

  // 뷰
  views: Array<'front' | 'back' | 'side' | '3/4' | 'top' | 'detail'>;
  includeAnnotations: boolean;  // 치수/설명 포함

  // 색상
  colorScheme: 'monochrome' | 'limited' | 'full-color';
  palette?: string[];  // HEX 배열
}
```

#### 3. UI/아이콘

```typescript
export interface UIIconPreset {
  assetType: 'icon';

  // 아이콘 타입
  iconType: 'action' | 'status' | 'item' | 'navigation' | 'social';

  // 스타일
  style: 'flat' | 'gradient' | 'skeuomorphic' | 'line' | '3d';
  shape: 'circle' | 'square' | 'rounded-square' | 'hexagon' | 'custom';

  // 색상
  colorScheme: 'monochrome' | 'duotone' | 'colorful';
  primaryColor?: string;
  secondaryColor?: string;

  // 옵션
  shadow: boolean;
  glow: boolean;
  badge: boolean;  // 뱃지 (알림 등)

  // 크기/해상도
  sizes: Array<'16x16' | '32x32' | '64x64' | '128x128' | '256x256'>;
}
```

### 프롬프트 생성 엔진

```typescript
// lib/art/prompt-builder.ts

export class PromptBuilder {
  private preset: PresetConfig;
  private customizations: Map<string, any>;

  constructor(style: ArtStyle) {
    this.preset = getPresetForStyle(style);
    this.customizations = new Map();
  }

  // 프리셋 값 설정
  set(key: string, value: any): this {
    this.customizations.set(key, value);
    return this;
  }

  // 프롬프트 생성
  build(): string {
    const parts: string[] = [];

    // 스타일 프리픽스
    parts.push(this.buildStylePrefix());

    // 에셋 타입별 로직
    switch (this.preset.assetType) {
      case 'character':
        parts.push(this.buildCharacterPrompt());
        break;
      case 'item':
        parts.push(this.buildItemPrompt());
        break;
      case 'background':
        parts.push(this.buildEnvironmentPrompt());
        break;
    }

    // 품질 서픽스
    parts.push(this.buildQualitySuffix());

    return parts.filter(Boolean).join(', ');
  }

  private buildCharacterPrompt(): string {
    const char = this.customizations;
    const parts: string[] = [];

    // 기본 설명
    const age = char.get('age') || 'adult';
    const gender = char.get('gender') || 'neutral';
    const race = char.get('race') || 'human';
    const classType = char.get('class') || 'warrior';

    parts.push(`a ${age} ${gender} ${race} ${classType}`);

    // 외형
    const hairStyle = char.get('hairStyle');
    const hairColor = char.get('hairColor');
    if (hairStyle && hairColor) {
      parts.push(`with ${hairStyle} ${hairColor} hair`);
    }

    // 장비
    const weapon = char.get('weapon');
    const armor = char.get('armor');
    if (armor) {
      parts.push(`wearing ${armor}`);
    }
    if (weapon) {
      parts.push(`holding a ${weapon}`);
    }

    // 포즈
    const pose = char.get('pose') || 'idle';
    const direction = char.get('direction') || 'front';
    parts.push(`${pose} pose, ${direction} view`);

    return parts.join(', ');
  }

  private buildItemPrompt(): string {
    const item = this.customizations;
    const parts: string[] = [];

    const category = item.get('category');
    const rarity = item.get('rarity') || 'common';

    parts.push(`${rarity} ${category}`);

    if (item.get('enchanted')) {
      parts.push('with magical glow');
    }

    const view = item.get('view') || 'icon';
    parts.push(`${view} view`);

    return parts.join(', ');
  }

  private buildEnvironmentPrompt(): string {
    const env = this.customizations;
    const parts: string[] = [];

    const environment = env.get('environment') || 'forest';
    const timeOfDay = env.get('timeOfDay') || 'day';
    const weather = env.get('weather') || 'clear';

    parts.push(`${environment} environment`);
    parts.push(`${timeOfDay} time`);

    if (weather !== 'clear') {
      parts.push(`${weather} weather`);
    }

    const perspective = env.get('perspective') || 'side-scroll';
    parts.push(`${perspective} perspective`);

    return parts.join(', ');
  }

  private buildStylePrefix(): string {
    const style = this.preset.style;
    const pixelSize = this.customizations.get('pixelSize') || '16-bit';

    if (style === 'pixel-art') {
      return `${pixelSize} pixel art`;
    }

    return ART_STYLE_PRESETS[style].promptTemplate.split('{subject}')[0];
  }

  private buildQualitySuffix(): string {
    const quality = this.customizations.get('quality') || 'high';
    const suffixes = {
      high: 'high quality, detailed, professional',
      standard: 'good quality, clean',
      draft: 'draft quality'
    };
    return suffixes[quality as keyof typeof suffixes];
  }

  // AI 개선 제안
  async getAISuggestions(): Promise<string[]> {
    // Gemini API를 사용하여 현재 프롬프트 개선 제안
    const currentPrompt = this.build();
    // ... AI 호출 로직
    return [];
  }
}
```

### 컴포넌트 구조

```typescript
// components/art/PromptBuilder/index.tsx
interface PromptBuilderProps {
  style: ArtStyle;
  onPromptChange: (prompt: string) => void;
}

export function PromptBuilder({ style, onPromptChange }: PromptBuilderProps) {
  const [assetType, setAssetType] = useState<'character' | 'item' | 'background'>('character');
  const [preset, setPreset] = useState<PresetConfig>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const promptBuilder = useMemo(
    () => new PromptBuilder(style),
    [style]
  );

  // 프리셋 변경 시 프롬프트 재생성
  useEffect(() => {
    Object.entries(preset).forEach(([key, value]) => {
      promptBuilder.set(key, value);
    });

    const newPrompt = promptBuilder.build();
    setGeneratedPrompt(newPrompt);
    onPromptChange(newPrompt);
  }, [preset, style, promptBuilder, onPromptChange]);

  return (
    <div className="prompt-builder">
      {/* Step 1: 에셋 타입 선택 */}
      <AssetTypeSelector value={assetType} onChange={setAssetType} />

      {/* Step 2-5: 에셋 타입별 커스터마이징 */}
      {assetType === 'character' && (
        <CharacterCustomizer preset={preset} onChange={setPreset} />
      )}
      {assetType === 'item' && (
        <ItemCustomizer preset={preset} onChange={setPreset} />
      )}
      {assetType === 'background' && (
        <EnvironmentCustomizer preset={preset} onChange={setPreset} />
      )}

      {/* 생성된 프롬프트 미리보기 */}
      <PromptPreview
        prompt={generatedPrompt}
        onEdit={setGeneratedPrompt}
      />

      {/* AI 개선 제안 */}
      <AISuggestionButton builder={promptBuilder} />
    </div>
  );
}
```

### 하위 컴포넌트

#### CharacterCustomizer
```typescript
// components/art/PromptBuilder/CharacterCustomizer.tsx
export function CharacterCustomizer({ preset, onChange }: CustomizerProps) {
  return (
    <div className="space-y-6">
      {/* 기본 속성 */}
      <Section title="기본 속성">
        <RadioGroup
          label="성별"
          options={GENDER_OPTIONS}
          value={preset.gender}
          onChange={(v) => onChange({ ...preset, gender: v })}
        />
        <Select
          label="종족"
          options={RACE_OPTIONS}
          value={preset.race}
          onChange={(v) => onChange({ ...preset, race: v })}
        />
        <Select
          label="직업"
          options={CLASS_OPTIONS}
          value={preset.class}
          onChange={(v) => onChange({ ...preset, class: v })}
        />
      </Section>

      {/* 외형 */}
      <Section title="외형">
        <Select
          label="헤어스타일"
          options={HAIR_STYLE_OPTIONS}
          value={preset.hairStyle}
          onChange={(v) => onChange({ ...preset, hairStyle: v })}
        />
        <ColorPicker
          label="헤어 컬러"
          value={preset.hairColor}
          onChange={(v) => onChange({ ...preset, hairColor: v })}
        />
        {/* ... */}
      </Section>

      {/* 장비 */}
      <Section title="장비">
        <Select
          label="무기"
          options={WEAPON_OPTIONS}
          value={preset.weapon}
          onChange={(v) => onChange({ ...preset, weapon: v })}
        />
        {/* ... */}
      </Section>

      {/* 포즈 */}
      <Section title="포즈 및 표정">
        <Select
          label="포즈"
          options={POSE_OPTIONS}
          value={preset.pose}
          onChange={(v) => onChange({ ...preset, pose: v })}
          preview={true}  // 포즈 아이콘 미리보기
        />
        {/* ... */}
      </Section>
    </div>
  );
}
```

### 프리셋 데이터

```typescript
// lib/art/preset-options.ts

export const GENDER_OPTIONS = [
  { value: 'male', label: '남성', icon: '♂️' },
  { value: 'female', label: '여성', icon: '♀️' },
  { value: 'neutral', label: '중성', icon: '⚥' },
];

export const RACE_OPTIONS = [
  { value: 'human', label: '인간', description: '균형잡힌 기본 종족' },
  { value: 'elf', label: '엘프', description: '날렵하고 우아한' },
  { value: 'dwarf', label: '드워프', description: '건장하고 작은' },
  { value: 'orc', label: '오크', description: '강인하고 거친' },
  { value: 'undead', label: '언데드', description: '죽음의 기운' },
  { value: 'robot', label: '로봇', description: '기계적인' },
];

export const CLASS_OPTIONS = [
  { value: 'warrior', label: '전사', icon: '⚔️' },
  { value: 'mage', label: '마법사', icon: '🔮' },
  { value: 'rogue', label: '도적', icon: '🗡️' },
  { value: 'archer', label: '궁수', icon: '🏹' },
  { value: 'cleric', label: '성직자', icon: '✝️' },
  { value: 'paladin', label: '팔라딘', icon: '🛡️' },
];

export const WEAPON_OPTIONS = [
  { value: 'sword', label: '검', icon: '🗡️' },
  { value: 'axe', label: '도끼', icon: '🪓' },
  { value: 'bow', label: '활', icon: '🏹' },
  { value: 'staff', label: '지팡이', icon: '🔮' },
  { value: 'dagger', label: '단검', icon: '🔪' },
  { value: 'spear', label: '창', icon: '🔱' },
  { value: 'none', label: '없음', icon: '❌' },
];

export const POSE_OPTIONS = [
  {
    value: 'idle',
    label: '대기',
    description: '가만히 서있는 자세',
    preview: '🧍'
  },
  {
    value: 'walking',
    label: '걷기',
    description: '걷는 동작',
    preview: '🚶'
  },
  {
    value: 'attacking',
    label: '공격',
    description: '무기를 휘두르는 동작',
    preview: '⚔️'
  },
  {
    value: 'jumping',
    label: '점프',
    description: '점프하는 동작',
    preview: '🤸'
  },
  {
    value: 'casting',
    label: '시전',
    description: '마법을 시전하는 동작',
    preview: '🧙'
  },
];

// ... 더 많은 옵션들
```

---

## 📐 UI 레이아웃 통합

### 최종 페이지 구조

```
┌─────────────────────────────────────────────────────────┐
│ 🎨 AI 아트 생성기                                         │
│ 2D 게임 아트를 AI로 생성하세요                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📱 사용 목적 선택                                         │
│ [🎮 게임]  [🌐 웹]  [🎨 일반]                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🎨 아트 스타일                                           │
│ [픽셀 아트 ▼]                                           │
│ 레트로 게임 스타일의 픽셀 아트                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📎 레퍼런스 이미지 (선택사항)                              │
│ [이미지1] [이미지2] [+ 추가]                             │
│ 활용 방식: ○ 스타일 ● 캐릭터 일관성                       │
│ 영향력: ▓▓▓▓▓▓▓▓░░ 80%                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🎮 프롬프트 빌더                                          │
│                                                          │
│ 1️⃣ 에셋 타입: [캐릭터] [적] [아이템] [배경]             │
│                                                          │
│ 2️⃣ 캐릭터 설정                                           │
│    성별: ● 여성   종족: [Elf ▼]   직업: [Mage ▼]       │
│                                                          │
│ 3️⃣ 외형                                                  │
│    헤어: [Long ▼] [#8B4513🎨]   눈: [#4169E1🎨]        │
│                                                          │
│ 4️⃣ 장비                                                  │
│    무기: [Staff ▼]   갑옷: [Robe ▼]                     │
│                                                          │
│ 5️⃣ 포즈                                                  │
│    [Casting ▼] [3/4 View] [Neutral ▼]                  │
│                                                          │
│ 📝 생성된 프롬프트                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ A young adult female elf mage with long brown       │ │
│ │ hair and blue eyes, wearing blue robe, holding a    │ │
│ │ magical staff, casting pose, 3/4 view, neutral      │ │
│ │ expression, 16-bit pixel art style                  │ │
│ └─────────────────────────────────────────────────────┘ │
│ [🔀 재생성] [✨ AI 개선 제안]                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚙️ 생성 옵션                                             │
│ 해상도: [512×512 ▼]   품질: [고품질 ▼]                  │
│ 생성 개수: ▓▓▓░░ 3개                                     │
│ 시드: [42]                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [ 🎨 작업 큐에 추가하기 ]                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ 구현 순서

### Phase 1: 기본 구조 (1-2일)
- [ ] `UsageType` 타입 및 프리셋 정의
- [ ] 사용 목적 선택 UI 컴포넌트 구현
- [ ] 타입 선택에 따른 기본값 자동 설정

### Phase 2: 레퍼런스 이미지 (2-3일)
- [ ] 이미지 업로드 컴포넌트 구현
- [ ] 파일 검증 및 리사이징 로직
- [ ] 레퍼런스 활용 방식 선택 UI
- [ ] API 통합 (referenceImages 파라미터)

### Phase 3: 프롬프트 빌더 - 기반 (3-4일)
- [ ] PromptBuilder 클래스 구현
- [ ] 픽셀 아트 프리셋 정의
- [ ] 에셋 타입 선택 UI
- [ ] 기본 프롬프트 생성 로직

### Phase 4: 프롬프트 빌더 - 캐릭터 (3-4일)
- [ ] CharacterCustomizer 컴포넌트
- [ ] 모든 커스터마이징 옵션 UI
- [ ] 실시간 프롬프트 업데이트
- [ ] 프롬프트 수동 편집 기능

### Phase 5: 프롬프트 빌더 - 아이템/배경 (2-3일)
- [ ] ItemCustomizer 컴포넌트
- [ ] EnvironmentCustomizer 컴포넌트
- [ ] 각 에셋 타입별 프리셋 데이터

### Phase 6: 다른 아트 스타일 확장 (3-4일)
- [ ] 컨셉 아트 프리셋
- [ ] 캐릭터 디자인 프리셋
- [ ] UI/아이콘 프리셋
- [ ] 스타일별 커스터마이저 UI 조정

### Phase 7: AI 개선 기능 (2-3일)
- [ ] AI 프롬프트 개선 제안 API
- [ ] 제안 받기 UI/UX
- [ ] 제안 적용 기능

### Phase 8: 테스트 및 최적화 (2-3일)
- [ ] E2E 테스트 작성
- [ ] 성능 최적화
- [ ] UX 개선 (로딩 상태, 에러 처리)
- [ ] 모바일 반응형 대응

### Phase 9: 문서화 및 배포 (1-2일)
- [ ] 사용자 가이드 작성
- [ ] API 문서 업데이트
- [ ] Vercel 배포 및 테스트

**총 예상 기간: 19-28일 (약 3-4주)**

---

## 📊 기대 효과

### 1. 사용성 향상
- **초보자 진입장벽 감소**: 복잡한 프롬프트 작성 불필요
- **직관적 UI**: 게임 캐릭터 커스터마이징 방식의 친숙한 UX
- **빠른 프로토타이핑**: 사전 정의된 프리셋으로 신속한 에셋 생성

### 2. 품질 향상
- **일관성 확보**: 레퍼런스 이미지로 시리즈물 제작 가능
- **최적화된 결과**: 목적별 (게임/웹) 최적 설정 자동 적용
- **전문가 수준**: 체계적인 프롬프트 구조로 고품질 출력

### 3. 생산성 향상
- **시간 절약**: 프롬프트 작성 시간 90% 단축 (예상)
- **재사용성**: 프리셋 저장/불러오기로 반복 작업 효율화
- **배치 생성**: 일관된 설정으로 여러 에셋 동시 생성

### 4. 사용자 확대
- **게임 개발자**: 신속한 프로토타입 에셋 제작
- **웹 디자이너**: 맞춤형 일러스트 및 UI 요소
- **창작자**: 아이디어 시각화 도구

---

## 🔧 기술 스택 추가 요구사항

### 추가 라이브러리
```json
{
  "dependencies": {
    "react-dropzone": "^14.2.3",        // 이미지 드래그&드롭
    "react-color": "^2.19.3",           // 컬러 피커
    "browser-image-compression": "^2.0.2"  // 클라이언트 이미지 압축
  }
}
```

### Gemini API 확장
- **이미지 입력 지원**: referenceImage 파라미터 활용
- **프롬프트 개선**: Gemini Text API로 프롬프트 최적화
- **배치 처리**: 효율적인 다중 이미지 생성

---

## 📝 참고 사항

### 제약사항
1. **레퍼런스 이미지 크기**: 최대 10MB, 최대 3개
2. **프롬프트 길이**: Gemini API 제한 고려 (최대 2048자 권장)
3. **브라우저 호환성**: 최신 Chrome, Firefox, Safari, Edge

### 향후 확장 가능성
1. **프리셋 저장/공유**: 커뮤니티 프리셋 마켓플레이스
2. **배리에이션**: 하나의 프리셋으로 여러 버전 생성
3. **애니메이션**: 스프라이트 시트 자동 생성
4. **스타일 믹싱**: 여러 스타일 조합

---

## ✅ 완료 기준

### 기능 완료 기준
- [ ] 3가지 사용 목적 (게임/웹/일반) 선택 가능
- [ ] 레퍼런스 이미지 최대 3개 업로드 및 활용 방식 설정
- [ ] 픽셀 아트 스타일의 캐릭터 프리셋 완벽 구현
- [ ] 생성된 프롬프트 자동 생성 및 수동 편집 가능
- [ ] AI 프롬프트 개선 제안 기능 작동
- [ ] 모바일 반응형 UI 완벽 지원
- [ ] E2E 테스트 커버리지 ≥70%

### 품질 기준
- [ ] 프롬프트 빌더 사용 시 프롬프트 작성 시간 90% 단축
- [ ] 레퍼런스 이미지 사용 시 일관성 80% 이상 확보
- [ ] 페이지 로딩 속도 LCP <2.5초
- [ ] 접근성 WCAG 2.1 AA 준수

---

**작성일**: 2025년 1월 (예상)
**작성자**: AI Apps Team
**버전**: 1.0
