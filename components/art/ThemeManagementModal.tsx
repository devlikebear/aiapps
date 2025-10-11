'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PromptTheme } from '@/lib/art/prompt-theme';
import type { UsageType, ArtStyle } from '@/lib/art/types';
import { PresetBuilderEditor } from './PresetBuilderEditor';
import type { PresetBuilderSchema } from '@/lib/art/preset-builder-schema';
import { createEmptyPresetSchema } from '@/lib/art/preset-builder-schema';
import {
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  duplicateTheme,
  initializeDefaultThemes,
} from '@/lib/art/theme-storage';
import { ART_STYLE_PRESETS } from '@/lib/art/types';

interface ThemeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeCreated?: (theme: PromptTheme) => void;
}

export function ThemeManagementModal({
  isOpen,
  onClose,
  onThemeCreated,
}: ThemeManagementModalProps) {
  const [themes, setThemes] = useState<PromptTheme[]>([]);
  const [editingTheme, setEditingTheme] = useState<PromptTheme | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 새 테마 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    usageType: 'game' as UsageType,
    description: '',
    icon: '🎨',
    selectedStyles: [] as ArtStyle[],
  });

  // 프리셋 빌더 상태 - 유연한 배열 구조
  const [presetBuilders, setPresetBuilders] = useState<PresetBuilderSchema[]>(
    []
  );

  // 편집 중인 프리셋 인덱스
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      loadThemes();
    }
  }, [isOpen]);

  const loadThemes = async () => {
    try {
      await initializeDefaultThemes();
      const allThemes = await getAllThemes();
      setThemes(allThemes);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load themes:', error);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTheme(null);
    setFormData({
      name: '',
      usageType: 'game',
      description: '',
      icon: '🎨',
      selectedStyles: [],
    });
    // 프리셋 빌더 초기화
    setPresetBuilders([]);
    setEditingPresetIndex(null);
  };

  const handleEdit = (theme: PromptTheme) => {
    if (theme.isReadOnly) {
      alert('기본 테마는 수정할 수 없습니다');
      return;
    }
    setEditingTheme(theme);
    setIsCreating(false);
    setFormData({
      name: theme.name,
      usageType: theme.usageType,
      description: theme.description,
      icon: theme.icon || '🎨',
      selectedStyles: theme.artStyles.map((s) => s.value),
    });
    // 기존 테마의 프리셋 빌더 로드
    setPresetBuilders(theme.presetBuilders);
    setEditingPresetIndex(null);
  };

  const handleDuplicate = async (theme: PromptTheme) => {
    try {
      const duplicated = await duplicateTheme(theme.id);
      await loadThemes();
      alert(`✅ "${theme.name}" 테마가 복제되었습니다`);
      if (onThemeCreated) {
        onThemeCreated(duplicated);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to duplicate theme:', error);
      alert('❌ 테마 복제에 실패했습니다');
    }
  };

  const handleDelete = async (theme: PromptTheme) => {
    if (theme.isReadOnly) {
      alert('기본 테마는 삭제할 수 없습니다');
      return;
    }

    if (!confirm(`"${theme.name}" 테마를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteTheme(theme.id);
      await loadThemes();
      alert('✅ 테마가 삭제되었습니다');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete theme:', error);
      alert('❌ 테마 삭제에 실패했습니다');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('테마 이름을 입력하세요');
      return;
    }

    if (formData.selectedStyles.length === 0) {
      alert('최소 1개 이상의 아트 스타일을 선택하세요');
      return;
    }

    try {
      const artStyles = formData.selectedStyles.map((style) => {
        const preset = ART_STYLE_PRESETS[style];
        return {
          value: style,
          label: preset.name,
          description: preset.description,
          example: preset.examples[0],
        };
      });

      if (editingTheme) {
        // Update existing theme
        const updated = await updateTheme(editingTheme.id, {
          name: formData.name,
          description: formData.description,
          artStyles,
          presetBuilders,
        });
        await loadThemes();
        alert('✅ 테마가 수정되었습니다');
        if (onThemeCreated) {
          onThemeCreated(updated);
        }
      } else {
        // Create new theme
        const newTheme = await createTheme({
          name: formData.name,
          usageType: formData.usageType,
          description: formData.description,
          artStyles,
          presetBuilders,
        });
        await loadThemes();
        alert('✅ 새 테마가 생성되었습니다');
        if (onThemeCreated) {
          onThemeCreated(newTheme);
        }
      }

      setIsCreating(false);
      setEditingTheme(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save theme:', error);
      alert('❌ 테마 저장에 실패했습니다');
    }
  };

  const handleStyleToggle = (style: ArtStyle) => {
    setFormData((prev) => ({
      ...prev,
      selectedStyles: prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter((s) => s !== style)
        : [...prev.selectedStyles, style],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">테마 관리</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isCreating && !editingTheme ? (
            // Theme List
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">
                  총 {themes.length}개의 테마가 있습니다
                </p>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />새 테마 만들기
                </button>
              </div>

              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{theme.icon || '🎨'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">
                              {theme.name}
                            </h3>
                            {theme.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">
                                기본
                              </span>
                            )}
                            {theme.isReadOnly && (
                              <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded">
                                읽기 전용
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {theme.artStyles.map((style) => (
                          <span
                            key={style.value}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {style.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {!theme.isReadOnly && (
                        <button
                          onClick={() => handleEdit(theme)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(theme)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="복제"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {!theme.isReadOnly && (
                        <button
                          onClick={() => handleDelete(theme)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {themes.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>테마가 없습니다</p>
                  <button
                    onClick={handleCreateNew}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                  >
                    첫 테마 만들기
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Theme Editor
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingTheme ? '테마 수정' : '새 테마 만들기'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTheme(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  취소
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  테마 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="예: 레트로 게임 스타일"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Usage Type */}
              {!editingTheme && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    사용 목적 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.usageType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usageType: e.target.value as UsageType,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="game">🎮 게임 에셋</option>
                    <option value="web">🌐 웹 콘텐츠</option>
                    <option value="general">✨ 일반 용도</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    테마 생성 후 사용 목적은 변경할 수 없습니다
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="이 테마에 대한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  아이콘 (이모지)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="🎨"
                  maxLength={2}
                  className="w-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl"
                />
              </div>

              {/* Art Styles */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  아트 스타일 <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(ART_STYLE_PRESETS).map(([key, preset]) => {
                    const isSelected = formData.selectedStyles.includes(
                      key as ArtStyle
                    );
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleStyleToggle(key as ArtStyle)}
                        className={`
                          p-3 rounded-lg border transition-all text-left
                          ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-500'
                              : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{preset.icon}</span>
                          <span className="text-sm font-medium">
                            {preset.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  선택된 스타일: {formData.selectedStyles.length}개
                </p>
              </div>

              {/* Preset Builders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium">프리셋 빌더 설정</h4>
                    <p className="text-sm text-gray-400">
                      테마에서 사용할 프리셋을 추가하고 커스터마이즈하세요
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newPreset = createEmptyPresetSchema(
                        `프리셋 ${presetBuilders.length + 1}`
                      );
                      setPresetBuilders([...presetBuilders, newPreset]);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />새 프리셋
                  </button>
                </div>

                {presetBuilders.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-lg text-center">
                    <p className="text-gray-400 mb-3">아직 프리셋이 없습니다</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newPreset =
                          createEmptyPresetSchema('첫 번째 프리셋');
                        setPresetBuilders([newPreset]);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                    >
                      첫 프리셋 만들기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {presetBuilders.map((preset, index) => (
                      <div
                        key={preset.id}
                        className="border border-gray-700 rounded-lg overflow-hidden"
                      >
                        <div className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPresetIndex(
                                editingPresetIndex === index ? null : index
                              )
                            }
                            className="flex-1 flex items-center gap-2 text-left hover:text-purple-400 transition-colors"
                          >
                            <span className="font-medium">
                              {preset.icon || '📦'} {preset.name}
                            </span>
                            {editingPresetIndex === index ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPresetBuilders(
                                presetBuilders.filter((_, i) => i !== index)
                              );
                              if (editingPresetIndex === index) {
                                setEditingPresetIndex(null);
                              }
                            }}
                            className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors ml-2"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {editingPresetIndex === index && (
                          <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                            <PresetBuilderEditor
                              value={preset}
                              onChange={(updated) => {
                                const newPresets = [...presetBuilders];
                                newPresets[index] = updated;
                                setPresetBuilders(newPresets);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTheme(null);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingTheme ? '수정 완료' : '테마 생성'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
