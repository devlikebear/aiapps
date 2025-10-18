'use client';

import type { CharacterPreset } from '@/lib/art/presets/character';
import {
  ASSET_TYPE_OPTIONS,
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
  type AssetType,
  type Gender,
  type Race,
  type CharacterClass,
  type Age,
  type BodyType,
  type HairStyle,
  type SkinTone,
  type WeaponType,
  type ArmorType,
  type Accessory,
  type Stance,
  type Direction,
  type Expression,
  type PixelSize,
  type ColorPalette,
  type OutlineStyle,
} from '@/lib/art/presets/character';

interface CharacterPromptFormProps {
  value: CharacterPreset;
  onChange: (preset: CharacterPreset) => void;
}

export function CharacterPromptForm({
  value,
  onChange,
}: CharacterPromptFormProps) {
  const handleChange = (updates: Partial<CharacterPreset>) => {
    onChange({ ...value, ...updates });
  };

  const handleAppearanceChange = (
    updates: Partial<CharacterPreset['appearance']>
  ) => {
    onChange({
      ...value,
      appearance: { ...value.appearance, ...updates },
    });
  };

  const handleEquipmentChange = (
    updates: Partial<CharacterPreset['equipment']>
  ) => {
    onChange({
      ...value,
      equipment: { ...value.equipment, ...updates },
    });
  };

  const handlePoseChange = (updates: Partial<CharacterPreset['pose']>) => {
    onChange({
      ...value,
      pose: { ...value.pose, ...updates },
    });
  };

  const handleStyleChange = (updates: Partial<CharacterPreset['style']>) => {
    onChange({
      ...value,
      style: { ...value.style, ...updates },
    });
  };

  const handleAccessoryToggle = (accessory: Accessory) => {
    const current = value.equipment.accessories;
    const newAccessories = current.includes(accessory)
      ? current.filter((a) => a !== accessory)
      : [...current, accessory];

    handleEquipmentChange({ accessories: newAccessories });
  };

  return (
    <div className="space-y-6">
      {/* 1. 캐릭터 타입 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
        <h3 className="text-sm font-medium text-purple-400">1️⃣ 캐릭터 타입</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(ASSET_TYPE_OPTIONS) as AssetType[]).map((type) => {
            const isSelected = value.assetType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleChange({ assetType: type })}
                className={`
                  px-4 py-2 rounded-lg border transition-all
                  ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {ASSET_TYPE_OPTIONS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 기본 속성 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">2️⃣ 기본 속성</h3>

        {/* 성별 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">성별</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(GENDER_OPTIONS) as Gender[]).map((gender) => {
              const isSelected = value.gender === gender;
              return (
                <button
                  key={gender}
                  type="button"
                  onClick={() => handleChange({ gender })}
                  className={`
                    px-3 py-2 rounded text-sm transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {GENDER_OPTIONS[gender]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 종족 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">종족</label>
          <select
            value={value.race}
            onChange={(e) => handleChange({ race: e.target.value as Race })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(RACE_OPTIONS) as Race[]).map((race) => (
              <option key={race} value={race}>
                {RACE_OPTIONS[race]}
              </option>
            ))}
          </select>
        </div>

        {/* 직업 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">직업</label>
          <select
            value={value.class}
            onChange={(e) =>
              handleChange({ class: e.target.value as CharacterClass })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(CLASS_OPTIONS) as CharacterClass[]).map((cls) => (
              <option key={cls} value={cls}>
                {CLASS_OPTIONS[cls]}
              </option>
            ))}
          </select>
        </div>

        {/* 연령 & 체형 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">연령</label>
            <select
              value={value.age}
              onChange={(e) => handleChange({ age: e.target.value as Age })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(AGE_OPTIONS) as Age[]).map((age) => (
                <option key={age} value={age}>
                  {AGE_OPTIONS[age]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">체형</label>
            <select
              value={value.bodyType}
              onChange={(e) =>
                handleChange({ bodyType: e.target.value as BodyType })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {(Object.keys(BODY_TYPE_OPTIONS) as BodyType[]).map(
                (bodyType) => (
                  <option key={bodyType} value={bodyType}>
                    {BODY_TYPE_OPTIONS[bodyType]}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 3. 외형 커스터마이징 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">
          3️⃣ 외형 커스터마이징
        </h3>

        {/* 헤어스타일 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">헤어스타일</label>
          <select
            value={value.appearance.hairStyle}
            onChange={(e) =>
              handleAppearanceChange({ hairStyle: e.target.value as HairStyle })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(HAIR_STYLE_OPTIONS) as HairStyle[]).map((style) => (
              <option key={style} value={style}>
                {HAIR_STYLE_OPTIONS[style]}
              </option>
            ))}
          </select>
        </div>

        {/* 헤어 컬러 & 눈 색상 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              헤어 컬러
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.appearance.hairColor}
                onChange={(e) =>
                  handleAppearanceChange({ hairColor: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value.appearance.hairColor}
                onChange={(e) =>
                  handleAppearanceChange({ hairColor: e.target.value })
                }
                placeholder="#4A3929"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">눈 색상</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.appearance.eyeColor}
                onChange={(e) =>
                  handleAppearanceChange({ eyeColor: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value.appearance.eyeColor}
                onChange={(e) =>
                  handleAppearanceChange({ eyeColor: e.target.value })
                }
                placeholder="#2E5C8A"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 피부톤 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">피부톤</label>
          <select
            value={value.appearance.skinTone}
            onChange={(e) =>
              handleAppearanceChange({ skinTone: e.target.value as SkinTone })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(SKIN_TONE_OPTIONS) as SkinTone[]).map((tone) => (
              <option key={tone} value={tone}>
                {SKIN_TONE_OPTIONS[tone]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. 장비 및 액세서리 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">
          4️⃣ 장비 및 액세서리
        </h3>

        {/* 무기 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">무기</label>
          <select
            value={value.equipment.weapon}
            onChange={(e) =>
              handleEquipmentChange({ weapon: e.target.value as WeaponType })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(WEAPON_OPTIONS) as WeaponType[]).map((weapon) => (
              <option key={weapon} value={weapon}>
                {WEAPON_OPTIONS[weapon]}
              </option>
            ))}
          </select>
        </div>

        {/* 갑옷 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">갑옷</label>
          <select
            value={value.equipment.armor}
            onChange={(e) =>
              handleEquipmentChange({ armor: e.target.value as ArmorType })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(ARMOR_OPTIONS) as ArmorType[]).map((armor) => (
              <option key={armor} value={armor}>
                {ARMOR_OPTIONS[armor]}
              </option>
            ))}
          </select>
        </div>

        {/* 방패 & 망토 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.equipment.shield}
              onChange={(e) =>
                handleEquipmentChange({ shield: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">방패 착용</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.equipment.cape}
              onChange={(e) =>
                handleEquipmentChange({ cape: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">망토 착용</span>
          </label>
        </div>

        {/* 장신구 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">장신구</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ACCESSORY_OPTIONS) as Accessory[]).map(
              (accessory) => {
                const isSelected =
                  value.equipment.accessories.includes(accessory);
                return (
                  <button
                    key={accessory}
                    type="button"
                    onClick={() => handleAccessoryToggle(accessory)}
                    className={`
                      px-3 py-2 rounded text-xs transition-all
                      ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }
                    `}
                  >
                    {ACCESSORY_OPTIONS[accessory]}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* 5. 포즈 및 표정 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">5️⃣ 포즈 및 표정</h3>

        {/* 자세 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">자세</label>
          <select
            value={value.pose.stance}
            onChange={(e) =>
              handlePoseChange({ stance: e.target.value as Stance })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(STANCE_OPTIONS) as Stance[]).map((stance) => (
              <option key={stance} value={stance}>
                {STANCE_OPTIONS[stance]}
              </option>
            ))}
          </select>
        </div>

        {/* 방향 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">방향</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(DIRECTION_OPTIONS) as Direction[]).map(
              (direction) => {
                const isSelected = value.pose.direction === direction;
                return (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => handlePoseChange({ direction })}
                    className={`
                      px-3 py-2 rounded text-sm transition-all
                      ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }
                    `}
                  >
                    {DIRECTION_OPTIONS[direction]}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* 표정 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">표정</label>
          <select
            value={value.pose.expression}
            onChange={(e) =>
              handlePoseChange({ expression: e.target.value as Expression })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(EXPRESSION_OPTIONS) as Expression[]).map(
              (expression) => (
                <option key={expression} value={expression}>
                  {EXPRESSION_OPTIONS[expression]}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* 6. 스타일 옵션 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">6️⃣ 스타일</h3>

        {/* 픽셀 크기 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">픽셀 크기</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PIXEL_SIZE_OPTIONS) as PixelSize[]).map((size) => {
              const isSelected = value.style.pixelSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleStyleChange({ pixelSize: size })}
                  className={`
                    px-3 py-2 rounded text-sm transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {PIXEL_SIZE_OPTIONS[size]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 색상 팔레트 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            색상 팔레트
          </label>
          <select
            value={value.style.colorPalette}
            onChange={(e) =>
              handleStyleChange({
                colorPalette: e.target.value as ColorPalette,
              })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(COLOR_PALETTE_OPTIONS) as ColorPalette[]).map(
              (palette) => (
                <option key={palette} value={palette}>
                  {COLOR_PALETTE_OPTIONS[palette]}
                </option>
              )
            )}
          </select>
        </div>

        {/* 외곽선 스타일 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            외곽선 스타일
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(OUTLINE_STYLE_OPTIONS) as OutlineStyle[]).map(
              (outline) => {
                const isSelected = value.style.outlineStyle === outline;
                return (
                  <button
                    key={outline}
                    type="button"
                    onClick={() => handleStyleChange({ outlineStyle: outline })}
                    className={`
                      px-3 py-2 rounded text-sm transition-all
                      ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }
                    `}
                  >
                    {OUTLINE_STYLE_OPTIONS[outline]}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
