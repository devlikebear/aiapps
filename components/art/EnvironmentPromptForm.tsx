'use client';

import type { EnvironmentPreset } from '@/lib/art/presets/environment';
import {
  DEFAULT_ENVIRONMENT_PRESET,
  ENVIRONMENT_TYPE_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  WEATHER_OPTIONS,
  PERSPECTIVE_OPTIONS,
  MOOD_OPTIONS,
  type EnvironmentType,
  type TimeOfDay,
  type Weather,
  type Perspective,
  type Mood,
} from '@/lib/art/presets/environment';

interface EnvironmentPromptFormProps {
  value: EnvironmentPreset;
  onChange: (preset: EnvironmentPreset) => void;
}

export function EnvironmentPromptForm({
  value,
  onChange,
}: EnvironmentPromptFormProps) {
  const handleChange = (updates: Partial<EnvironmentPreset>) => {
    onChange({ ...value, ...updates });
  };

  const handleLayersChange = (
    updates: Partial<EnvironmentPreset['layers']>
  ) => {
    onChange({
      ...value,
      layers: { ...value.layers, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. 배경 타입 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
        <h3 className="text-sm font-medium text-purple-400">1️⃣ 배경 타입</h3>
        <div>
          <label className="block text-xs text-gray-400 mb-2">에셋 종류</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange({ assetType: 'background' })}
              className={`
                px-4 py-2 rounded-lg border transition-all
                ${
                  value.assetType === 'background'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }
              `}
            >
              배경 (Background)
            </button>
            <button
              type="button"
              onClick={() => handleChange({ assetType: 'tileset' })}
              className={`
                px-4 py-2 rounded-lg border transition-all
                ${
                  value.assetType === 'tileset'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }
              `}
            >
              타일셋 (Tileset)
            </button>
          </div>
        </div>

        {/* 환경 타입 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">환경</label>
          <select
            value={value.environment}
            onChange={(e) =>
              handleChange({ environment: e.target.value as EnvironmentType })
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {(Object.keys(ENVIRONMENT_TYPE_OPTIONS) as EnvironmentType[]).map(
              (env) => (
                <option key={env} value={env}>
                  {ENVIRONMENT_TYPE_OPTIONS[env]}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* 2. 시간 및 날씨 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">2️⃣ 시간 및 날씨</h3>

        {/* 시간대 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">시간대</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(TIME_OF_DAY_OPTIONS) as TimeOfDay[]).map((time) => {
              const isSelected = value.timeOfDay === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleChange({ timeOfDay: time })}
                  className={`
                    px-3 py-2 rounded text-sm transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {TIME_OF_DAY_OPTIONS[time]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 날씨 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">날씨</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(WEATHER_OPTIONS) as Weather[]).map((weather) => {
              const isSelected = value.weather === weather;
              return (
                <button
                  key={weather}
                  type="button"
                  onClick={() => handleChange({ weather })}
                  className={`
                    px-3 py-2 rounded text-sm transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {WEATHER_OPTIONS[weather]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 분위기 및 관점 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">
          3️⃣ 분위기 및 관점
        </h3>

        {/* 분위기 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">분위기</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(MOOD_OPTIONS) as Mood[]).map((mood) => {
              const isSelected = value.mood === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => handleChange({ mood })}
                  className={`
                    px-3 py-2 rounded text-sm transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {MOOD_OPTIONS[mood]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 퍼스펙티브 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">관점</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PERSPECTIVE_OPTIONS) as Perspective[]).map(
              (perspective) => {
                const isSelected = value.perspective === perspective;
                return (
                  <button
                    key={perspective}
                    type="button"
                    onClick={() => handleChange({ perspective })}
                    className={`
                      px-3 py-2 rounded text-sm transition-all
                      ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }
                    `}
                  >
                    {PERSPECTIVE_OPTIONS[perspective]}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* 4. 레이어 설정 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">4️⃣ 레이어 설정</h3>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.layers.foreground}
              onChange={(e) =>
                handleLayersChange({ foreground: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">전경 (Foreground)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.layers.midground}
              onChange={(e) =>
                handleLayersChange({ midground: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">중경 (Midground)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.layers.background}
              onChange={(e) =>
                handleLayersChange({ background: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">배경 (Background)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.layers.parallax}
              onChange={(e) =>
                handleLayersChange({ parallax: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">시차 효과 (Parallax)</span>
          </label>
        </div>
      </div>

      {/* 5. 타일링 및 색상 */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-purple-400">
          5️⃣ 타일링 및 색상
        </h3>

        {/* 타일링 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.tileability}
            onChange={(e) => handleChange({ tileability: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">타일링 가능 (Tileable)</span>
        </label>

        {/* 색상 (선택적) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              주 색상 (선택)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.dominantColor || '#4A7C59'}
                onChange={(e) =>
                  handleChange({ dominantColor: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value.dominantColor || ''}
                onChange={(e) =>
                  handleChange({ dominantColor: e.target.value })
                }
                placeholder="#4A7C59"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              강조 색상 (선택)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.accentColor || '#87CEEB'}
                onChange={(e) => handleChange({ accentColor: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value.accentColor || ''}
                onChange={(e) => handleChange({ accentColor: e.target.value })}
                placeholder="#87CEEB"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
