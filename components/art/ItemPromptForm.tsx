'use client';

import type { ItemPreset } from '@/lib/art/presets/item';
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
  type ItemCategory,
  type ItemWeaponType,
  type ItemArmorType,
  type PotionType,
  type TreasureType,
  type FoodType,
  type ItemRarity,
  type ItemView,
  type ItemSize,
} from '@/lib/art/presets/item';

interface ItemPromptFormProps {
  value: ItemPreset;
  onChange: (preset: ItemPreset) => void;
}

export function ItemPromptForm({ value, onChange }: ItemPromptFormProps) {
  const handleChange = (updates: Partial<ItemPreset>) => {
    onChange({ ...value, ...updates });
  };

  const handleVisualChange = (updates: Partial<ItemPreset['visual']>) => {
    onChange({
      ...value,
      visual: { ...value.visual, ...updates },
    });
  };

  const handleCategoryChange = (category: ItemCategory) => {
    // 카테고리 변경 시 관련 타입 초기화
    const updates: Partial<ItemPreset> = {
      category,
      weaponType: undefined,
      armorType: undefined,
      potionType: undefined,
      treasureType: undefined,
      foodType: undefined,
    };

    // 카테고리별 기본값 설정
    if (category === 'weapon') {
      updates.weaponType = 'sword';
    } else if (category === 'armor') {
      updates.armorType = 'helmet';
    } else if (category === 'potion') {
      updates.potionType = 'health';
    } else if (category === 'treasure') {
      updates.treasureType = 'gold';
    } else if (category === 'food') {
      updates.foodType = 'meat';
    }

    handleChange(updates);
  };

  return (
    <div className="space-y-6">
      {/* 1. 아이템 카테고리 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
        <h3 className="text-sm font-medium text-purple-400">
          1️⃣ 아이템 카테고리
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(ITEM_CATEGORY_OPTIONS) as ItemCategory[]).map(
            (category) => {
              const isSelected = value.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all
                    ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  {ITEM_CATEGORY_OPTIONS[category]}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 2. 세부 타입 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
        <h3 className="text-sm font-medium text-purple-400">2️⃣ 세부 타입</h3>

        {value.category === 'weapon' && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              무기 종류
            </label>
            <select
              value={value.weaponType}
              onChange={(e) =>
                handleChange({ weaponType: e.target.value as ItemWeaponType })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(ITEM_WEAPON_TYPE_OPTIONS) as ItemWeaponType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {ITEM_WEAPON_TYPE_OPTIONS[type]}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {value.category === 'armor' && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              방어구 종류
            </label>
            <select
              value={value.armorType}
              onChange={(e) =>
                handleChange({ armorType: e.target.value as ItemArmorType })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(ITEM_ARMOR_TYPE_OPTIONS) as ItemArmorType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {ITEM_ARMOR_TYPE_OPTIONS[type]}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {value.category === 'potion' && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              포션 종류
            </label>
            <select
              value={value.potionType}
              onChange={(e) =>
                handleChange({ potionType: e.target.value as PotionType })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(POTION_TYPE_OPTIONS) as PotionType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {POTION_TYPE_OPTIONS[type]}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {value.category === 'treasure' && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              보물 종류
            </label>
            <select
              value={value.treasureType}
              onChange={(e) =>
                handleChange({ treasureType: e.target.value as TreasureType })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(TREASURE_TYPE_OPTIONS) as TreasureType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {TREASURE_TYPE_OPTIONS[type]}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {value.category === 'food' && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              음식 종류
            </label>
            <select
              value={value.foodType}
              onChange={(e) =>
                handleChange({ foodType: e.target.value as FoodType })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(FOOD_TYPE_OPTIONS) as FoodType[]).map((type) => (
                <option key={type} value={type}>
                  {FOOD_TYPE_OPTIONS[type]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. 등급 및 시각 효과 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">
          3️⃣ 등급 및 시각 효과
        </h3>

        {/* 등급 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            아이템 등급
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(ITEM_RARITY_OPTIONS) as ItemRarity[]).map(
              (rarity) => {
                const isSelected = value.visual.rarity === rarity;
                return (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => handleVisualChange({ rarity })}
                    className={`
                      px-3 py-2 rounded text-xs transition-all
                      ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }
                    `}
                  >
                    {ITEM_RARITY_OPTIONS[rarity]}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* 시각 효과 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">시각 효과</label>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.visual.enchanted}
                onChange={(e) =>
                  handleVisualChange({ enchanted: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">마법 효과</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.visual.glowing}
                onChange={(e) =>
                  handleVisualChange({ glowing: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">발광 효과</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.visual.sparkles}
                onChange={(e) =>
                  handleVisualChange({ sparkles: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">반짝임</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. 표현 스타일 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">4️⃣ 표현 스타일</h3>

        {/* 뷰 타입 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">뷰 타입</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ITEM_VIEW_OPTIONS) as ItemView[]).map((view) => {
              const isSelected = value.view === view;
              return (
                <button
                  key={view}
                  type="button"
                  onClick={() => handleChange({ view })}
                  className={`
                    px-3 py-2 rounded text-xs transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {ITEM_VIEW_OPTIONS[view]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 사이즈 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">사이즈</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ITEM_SIZE_OPTIONS) as ItemSize[]).map((size) => {
              const isSelected = value.size === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleChange({ size })}
                  className={`
                    px-3 py-2 rounded text-xs transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {ITEM_SIZE_OPTIONS[size]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 색상 (선택적) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              주 색상 (선택)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.primaryColor || '#888888'}
                onChange={(e) => handleChange({ primaryColor: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value.primaryColor || ''}
                onChange={(e) => handleChange({ primaryColor: e.target.value })}
                placeholder="#888888"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              보조 색상 (선택)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.secondaryColor || '#444444'}
                onChange={(e) =>
                  handleChange({ secondaryColor: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value.secondaryColor || ''}
                onChange={(e) =>
                  handleChange({ secondaryColor: e.target.value })
                }
                placeholder="#444444"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
