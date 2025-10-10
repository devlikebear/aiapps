// 캐릭터 프리셋 타입 및 데이터 정의

export type AssetType = 'character' | 'enemy' | 'npc';

export type Gender = 'male' | 'female' | 'neutral';

export type Race =
  | 'human'
  | 'elf'
  | 'dwarf'
  | 'orc'
  | 'undead'
  | 'robot'
  | 'beast';

export type CharacterClass =
  | 'warrior'
  | 'mage'
  | 'rogue'
  | 'archer'
  | 'cleric'
  | 'paladin'
  | 'none';

export type Age = 'child' | 'teen' | 'adult' | 'elder';

export type BodyType = 'slim' | 'normal' | 'muscular' | 'heavy';

export type HairStyle =
  | 'short'
  | 'long'
  | 'bald'
  | 'ponytail'
  | 'spiky'
  | 'braided';

export type SkinTone =
  | 'pale'
  | 'fair'
  | 'tan'
  | 'dark'
  | 'green'
  | 'blue'
  | 'gray';

export type WeaponType =
  | 'sword'
  | 'axe'
  | 'bow'
  | 'staff'
  | 'dagger'
  | 'spear'
  | 'none';

export type ArmorType =
  | 'leather'
  | 'chainmail'
  | 'plate'
  | 'robe'
  | 'cloth'
  | 'none';

export type Accessory =
  | 'helmet'
  | 'crown'
  | 'mask'
  | 'necklace'
  | 'ring'
  | 'earrings';

export type Stance =
  | 'idle'
  | 'walking'
  | 'running'
  | 'attacking'
  | 'jumping'
  | 'casting'
  | 'defending';

export type Direction = 'front' | 'back' | 'side' | '3/4';

export type Expression =
  | 'neutral'
  | 'angry'
  | 'happy'
  | 'sad'
  | 'surprised'
  | 'determined'
  | 'smiling';

export type PixelSize = '8-bit' | '16-bit' | '32-bit';

export type ColorPalette =
  | 'retro'
  | 'vibrant'
  | 'monochrome'
  | 'pastel'
  | 'neon'
  | 'earthy';

export type OutlineStyle = 'black' | 'colored' | 'none';

export interface CharacterAppearance {
  hairStyle: HairStyle;
  hairColor: string; // HEX color
  eyeColor: string; // HEX color
  skinTone: SkinTone;
}

export interface CharacterEquipment {
  weapon: WeaponType;
  armor: ArmorType;
  shield: boolean;
  cape: boolean;
  accessories: Accessory[];
}

export interface CharacterPose {
  stance: Stance;
  direction: Direction;
  expression: Expression;
}

export interface CharacterStyle {
  pixelSize: PixelSize;
  colorPalette: ColorPalette;
  outlineStyle: OutlineStyle;
}

export interface CharacterPreset {
  assetType: AssetType;

  // 기본 속성
  gender: Gender;
  race: Race;
  class: CharacterClass;
  age: Age;
  bodyType: BodyType;

  // 외형
  appearance: CharacterAppearance;

  // 장비
  equipment: CharacterEquipment;

  // 포즈/표정
  pose: CharacterPose;

  // 스타일 옵션
  style: CharacterStyle;
}

// 기본값
export const DEFAULT_CHARACTER_PRESET: CharacterPreset = {
  assetType: 'character',
  gender: 'neutral',
  race: 'human',
  class: 'warrior',
  age: 'adult',
  bodyType: 'normal',
  appearance: {
    hairStyle: 'short',
    hairColor: '#4A3929',
    eyeColor: '#2E5C8A',
    skinTone: 'fair',
  },
  equipment: {
    weapon: 'sword',
    armor: 'leather',
    shield: false,
    cape: false,
    accessories: [],
  },
  pose: {
    stance: 'idle',
    direction: 'front',
    expression: 'neutral',
  },
  style: {
    pixelSize: '16-bit',
    colorPalette: 'vibrant',
    outlineStyle: 'black',
  },
};

// 선택 옵션 라벨 매핑
export const ASSET_TYPE_OPTIONS: Record<AssetType, string> = {
  character: '플레이어 캐릭터',
  enemy: '적/몬스터',
  npc: 'NPC',
};

export const GENDER_OPTIONS: Record<Gender, string> = {
  male: '남성',
  female: '여성',
  neutral: '중성',
};

export const RACE_OPTIONS: Record<Race, string> = {
  human: '인간',
  elf: '엘프',
  dwarf: '드워프',
  orc: '오크',
  undead: '언데드',
  robot: '로봇',
  beast: '수인',
};

export const CLASS_OPTIONS: Record<CharacterClass, string> = {
  warrior: '전사',
  mage: '마법사',
  rogue: '도적',
  archer: '궁수',
  cleric: '성직자',
  paladin: '팔라딘',
  none: '없음',
};

export const AGE_OPTIONS: Record<Age, string> = {
  child: '어린이',
  teen: '청소년',
  adult: '성인',
  elder: '노인',
};

export const BODY_TYPE_OPTIONS: Record<BodyType, string> = {
  slim: '마른',
  normal: '보통',
  muscular: '근육질',
  heavy: '건장한',
};

export const HAIR_STYLE_OPTIONS: Record<HairStyle, string> = {
  short: '짧은 머리',
  long: '긴 머리',
  bald: '대머리',
  ponytail: '포니테일',
  spiky: '뾰족한',
  braided: '땋은 머리',
};

export const SKIN_TONE_OPTIONS: Record<SkinTone, string> = {
  pale: '창백한',
  fair: '밝은',
  tan: '황갈색',
  dark: '어두운',
  green: '녹색',
  blue: '파란색',
  gray: '회색',
};

export const WEAPON_OPTIONS: Record<WeaponType, string> = {
  sword: '검',
  axe: '도끼',
  bow: '활',
  staff: '지팡이',
  dagger: '단검',
  spear: '창',
  none: '없음',
};

export const ARMOR_OPTIONS: Record<ArmorType, string> = {
  leather: '가죽 갑옷',
  chainmail: '체인메일',
  plate: '판금 갑옷',
  robe: '로브',
  cloth: '천 옷',
  none: '없음',
};

export const ACCESSORY_OPTIONS: Record<Accessory, string> = {
  helmet: '투구',
  crown: '왕관',
  mask: '가면',
  necklace: '목걸이',
  ring: '반지',
  earrings: '귀걸이',
};

export const STANCE_OPTIONS: Record<Stance, string> = {
  idle: '대기',
  walking: '걷기',
  running: '달리기',
  attacking: '공격',
  jumping: '점프',
  casting: '시전',
  defending: '방어',
};

export const DIRECTION_OPTIONS: Record<Direction, string> = {
  front: '정면',
  back: '후면',
  side: '측면',
  '3/4': '3/4 뷰',
};

export const EXPRESSION_OPTIONS: Record<Expression, string> = {
  neutral: '무표정',
  angry: '화남',
  happy: '행복',
  sad: '슬픔',
  surprised: '놀람',
  determined: '단호함',
  smiling: '웃음',
};

export const PIXEL_SIZE_OPTIONS: Record<PixelSize, string> = {
  '8-bit': '8비트 (작은 픽셀)',
  '16-bit': '16비트 (중간 픽셀)',
  '32-bit': '32비트 (큰 픽셀)',
};

export const COLOR_PALETTE_OPTIONS: Record<ColorPalette, string> = {
  retro: '레트로',
  vibrant: '생생한',
  monochrome: '흑백',
  pastel: '파스텔',
  neon: '네온',
  earthy: '자연색',
};

export const OUTLINE_STYLE_OPTIONS: Record<OutlineStyle, string> = {
  black: '검은색',
  colored: '색상 있음',
  none: '없음',
};
