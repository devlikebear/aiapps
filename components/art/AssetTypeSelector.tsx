'use client';

interface AssetTypeSelectorProps {
  value: 'character' | 'item' | 'environment';
  onChange: (type: 'character' | 'item' | 'environment') => void;
  disabled?: boolean;
}

const ASSET_TYPES = [
  {
    type: 'character' as const,
    icon: '👤',
    label: '캐릭터',
    description: '플레이어, 적, NPC',
  },
  {
    type: 'item' as const,
    icon: '⚔️',
    label: '아이템',
    description: '무기, 갑옷, 포션, 보물',
  },
  {
    type: 'environment' as const,
    icon: '🌲',
    label: '배경/환경',
    description: '맵, 타일셋, 배경',
  },
];

export function AssetTypeSelector({
  value,
  onChange,
  disabled = false,
}: AssetTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">에셋 타입</label>
      <div className="grid grid-cols-3 gap-3">
        {ASSET_TYPES.map((assetType) => {
          const isSelected = value === assetType.type;
          return (
            <button
              key={assetType.type}
              type="button"
              onClick={() => onChange(assetType.type)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">{assetType.icon}</div>
                <div className="font-medium">{assetType.label}</div>
                <div className="text-xs text-gray-400">
                  {assetType.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
