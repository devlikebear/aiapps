'use client';

import { useState, useEffect } from 'react';
import { Palette, ChevronDown, Plus, Settings } from 'lucide-react';
import type { PromptTheme } from '@/lib/art/prompt-theme';
import {
  getThemesByUsageType,
  initializeDefaultThemes,
} from '@/lib/art/theme-storage';
import type { UsageType } from '@/lib/art/types';

interface ThemeSelectorProps {
  usageType: UsageType;
  selectedThemeId?: string;
  onThemeChange: (theme: PromptTheme) => void;
  onManageThemes?: () => void;
}

export function ThemeSelector({
  usageType,
  selectedThemeId,
  onThemeChange,
  onManageThemes,
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<PromptTheme[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<PromptTheme | null>(null);

  // 테마 로드
  useEffect(() => {
    loadThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageType]);

  const loadThemes = async () => {
    try {
      // 기본 테마 초기화
      await initializeDefaultThemes();

      // 사용 목적별 테마 로드
      const loadedThemes = await getThemesByUsageType(usageType);
      setThemes(loadedThemes);

      // 선택된 테마 설정
      if (selectedThemeId) {
        const theme = loadedThemes.find((t) => t.id === selectedThemeId);
        if (theme) {
          setSelectedTheme(theme);
        }
      } else {
        // 기본 테마 선택
        const defaultTheme = loadedThemes.find((t) => t.isDefault);
        if (defaultTheme) {
          setSelectedTheme(defaultTheme);
          onThemeChange(defaultTheme);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load themes:', error);
    }
  };

  const handleThemeSelect = (theme: PromptTheme) => {
    setSelectedTheme(theme);
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-purple-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">
              {selectedTheme?.name || '테마 선택'}
            </div>
            <div className="text-xs text-gray-400">
              {selectedTheme?.description || '프롬프트 테마를 선택하세요'}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Theme List */}
          <div className="p-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${
                  selectedTheme?.id === theme.id
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'hover:bg-gray-700'
                }`}
              >
                <div className="text-2xl">{theme.icon || '🎨'}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white">
                      {theme.name}
                    </div>
                    {theme.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">
                        기본
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {theme.description}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {theme.artStyles.slice(0, 3).map((style) => (
                      <span
                        key={style.value}
                        className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                      >
                        {style.label}
                      </span>
                    ))}
                    {theme.artStyles.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-400 text-xs">
                        +{theme.artStyles.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {themes.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">사용 가능한 테마가 없습니다</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-700 p-2">
            {onManageThemes && (
              <button
                onClick={() => {
                  onManageThemes();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300"
              >
                <Settings className="w-4 h-4" />
                테마 관리
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300"
            >
              <Plus className="w-4 h-4" />새 테마 만들기
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
