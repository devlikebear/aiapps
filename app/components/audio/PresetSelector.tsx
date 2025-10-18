'use client';

import { useState } from 'react';
import type { AudioPresetBuilderSchema } from '@/lib/audio/preset-builder-schema';
import { getBuiltinAudioPresetsByType } from '@/lib/audio/builtin-presets';
import { Music, Zap } from 'lucide-react';

interface PresetSelectorProps {
  onPresetSelect: (preset: AudioPresetBuilderSchema) => void;
  selectedPreset?: AudioPresetBuilderSchema;
}

export default function PresetSelector({
  onPresetSelect,
  selectedPreset,
}: PresetSelectorProps) {
  const [selectedType, setSelectedType] = useState<'bgm' | 'sfx'>('bgm');

  // 현재 타입에 해당하는 프리셋들
  const presets = getBuiltinAudioPresetsByType(selectedType);

  return (
    <div className="space-y-4">
      {/* 타입 탭 */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedType('bgm')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'bgm'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Music className="w-4 h-4" />
          배경음악
        </button>
        <button
          onClick={() => setSelectedType('sfx')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'sfx'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          효과음
        </button>
      </div>

      {/* 프리셋 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`p-4 rounded-lg text-left transition-all border-2 ${
              selectedPreset?.id === preset.id
                ? 'bg-gray-700 border-purple-500 shadow-lg shadow-purple-500/30'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
            }`}
          >
            {/* 프리셋 아이콘 */}
            {preset.icon && <div className="text-3xl mb-2">{preset.icon}</div>}

            {/* 프리셋 이름 */}
            <h3 className="font-semibold text-white mb-1">{preset.name}</h3>

            {/* 프리셋 설명 */}
            <p className="text-xs text-gray-400 line-clamp-2">
              {preset.description}
            </p>

            {/* 장르/카테고리 표시 */}
            {preset.genre && (
              <div className="mt-3 inline-block">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                  {preset.genre.toUpperCase()}
                </span>
              </div>
            )}

            {preset.sfxCategory && (
              <div className="mt-3 inline-block">
                <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                  {preset.sfxCategory.toUpperCase()}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 선택된 프리셋 정보 */}
      {selectedPreset && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-white">
                선택된 프리셋: {selectedPreset.name}
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                {selectedPreset.description}
              </p>
              <div className="mt-3 flex gap-2">
                {selectedPreset.genre && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {selectedPreset.genre}
                  </span>
                )}
                {selectedPreset.type && (
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                    {selectedPreset.type === 'bgm' ? 'BGM' : 'SFX'}
                  </span>
                )}
              </div>
            </div>
            {selectedPreset.icon && (
              <div className="text-4xl">{selectedPreset.icon}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
