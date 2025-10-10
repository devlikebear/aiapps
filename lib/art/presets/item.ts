// 아이템 프리셋 타입 및 데이터 정의

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'potion'
  | 'treasure'
  | 'food'
  | 'misc';

export type ItemWeaponType =
  | 'sword'
  | 'axe'
  | 'bow'
  | 'staff'
  | 'dagger'
  | 'spear'
  | 'hammer';

export type ItemArmorType = 'helmet' | 'chest' | 'gloves' | 'boots' | 'shield';

export type PotionType = 'health' | 'mana' | 'stamina' | 'buff' | 'poison';

export type TreasureType =
  | 'gold'
  | 'gem'
  | 'artifact'
  | 'chest'
  | 'key'
  | 'scroll';

export type FoodType =
  | 'meat'
  | 'bread'
  | 'fruit'
  | 'vegetable'
  | 'drink'
  | 'potion';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemView = 'icon' | 'sprite' | 'detailed';

export type ItemSize = 'small' | 'medium' | 'large';

export interface ItemVisual {
  rarity: ItemRarity;
  enchanted: boolean; // 마법 효과
  glowing: boolean; // 발광 효과
  sparkles: boolean; // 반짝임 효과
}

export interface ItemPreset {
  assetType: 'item';

  category: ItemCategory;

  // 카테고리별 세부 타입
  weaponType?: ItemWeaponType;
  armorType?: ItemArmorType;
  potionType?: PotionType;
  treasureType?: TreasureType;
  foodType?: FoodType;

  // 시각적 속성
  visual: ItemVisual;

  // 표현
  view: ItemView;
  size: ItemSize;

  // 색상 (선택적)
  primaryColor?: string;
  secondaryColor?: string;
}

// 기본값
export const DEFAULT_ITEM_PRESET: ItemPreset = {
  assetType: 'item',
  category: 'weapon',
  weaponType: 'sword',
  visual: {
    rarity: 'common',
    enchanted: false,
    glowing: false,
    sparkles: false,
  },
  view: 'icon',
  size: 'medium',
  primaryColor: '#888888',
  secondaryColor: '#444444',
};

// 선택 옵션 라벨 매핑
export const ITEM_CATEGORY_OPTIONS: Record<ItemCategory, string> = {
  weapon: '무기',
  armor: '방어구',
  potion: '포션',
  treasure: '보물',
  food: '음식',
  misc: '기타',
};

export const ITEM_WEAPON_TYPE_OPTIONS: Record<ItemWeaponType, string> = {
  sword: '검',
  axe: '도끼',
  bow: '활',
  staff: '지팡이',
  dagger: '단검',
  spear: '창',
  hammer: '망치',
};

export const ITEM_ARMOR_TYPE_OPTIONS: Record<ItemArmorType, string> = {
  helmet: '투구',
  chest: '갑옷',
  gloves: '장갑',
  boots: '부츠',
  shield: '방패',
};

export const POTION_TYPE_OPTIONS: Record<PotionType, string> = {
  health: '체력 회복',
  mana: '마나 회복',
  stamina: '스태미나 회복',
  buff: '버프',
  poison: '독',
};

export const TREASURE_TYPE_OPTIONS: Record<TreasureType, string> = {
  gold: '금화',
  gem: '보석',
  artifact: '아티팩트',
  chest: '상자',
  key: '열쇠',
  scroll: '두루마리',
};

export const FOOD_TYPE_OPTIONS: Record<FoodType, string> = {
  meat: '고기',
  bread: '빵',
  fruit: '과일',
  vegetable: '채소',
  drink: '음료',
  potion: '물약',
};

export const ITEM_RARITY_OPTIONS: Record<ItemRarity, string> = {
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
};

export const ITEM_VIEW_OPTIONS: Record<ItemView, string> = {
  icon: '아이콘 (UI용)',
  sprite: '스프라이트 (월드용)',
  detailed: '상세 (일러스트)',
};

export const ITEM_SIZE_OPTIONS: Record<ItemSize, string> = {
  small: '작음 (16x16~32x32)',
  medium: '중간 (64x64)',
  large: '큼 (128x128)',
};

// 등급별 기본 색상
export const RARITY_COLOR_MAP: Record<ItemRarity, string> = {
  common: '#9D9D9D', // 회색
  uncommon: '#1EFF00', // 초록색
  rare: '#0070DD', // 파란색
  epic: '#A335EE', // 보라색
  legendary: '#FF8000', // 주황색
};
