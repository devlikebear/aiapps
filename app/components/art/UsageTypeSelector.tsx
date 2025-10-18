'use client';

import { USAGE_TYPE_PRESETS, type UsageType } from '@/lib/art/types';

interface UsageTypeSelectorProps {
  value: UsageType;
  onChange: (type: UsageType) => void;
  disabled?: boolean;
}

export function UsageTypeSelector({
  value,
  onChange,
  disabled = false,
}: UsageTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">📱 사용 목적 선택</label>

      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(USAGE_TYPE_PRESETS) as UsageType[]).map((type) => {
          const preset = USAGE_TYPE_PRESETS[type];
          const isSelected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl">{preset.icon}</span>
                <span className="font-medium text-sm">{preset.name}</span>
                <span className="text-xs text-gray-400 line-clamp-2">
                  {preset.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 타입 정보 */}
      <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="flex items-start gap-3">
          <span className="text-xl">{USAGE_TYPE_PRESETS[value].icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-1">
              {USAGE_TYPE_PRESETS[value].name}
            </div>
            <div className="text-xs text-gray-400">
              {USAGE_TYPE_PRESETS[value].description}
            </div>

            {/* 최적화 정보 */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(USAGE_TYPE_PRESETS[value].optimizations).map(
                ([key, enabled]) => {
                  if (!enabled) return null;

                  const labels: Record<string, string> = {
                    transparency: '투명도',
                    tileability: '타일링',
                    spriteReady: '스프라이트',
                    fileSize: '파일 최적화',
                    responsive: '반응형',
                    retina: '레티나',
                  };

                  return (
                    <span
                      key={key}
                      className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs"
                    >
                      {labels[key] || key}
                    </span>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
