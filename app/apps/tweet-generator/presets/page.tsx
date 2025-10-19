'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Settings, Star, Plus } from 'lucide-react';
import type { TweetPreset } from '@/lib/tweet/types';
import { DEFAULT_PRESETS, LENGTH_DESCRIPTIONS } from '@/lib/tweet/types';
import { getAllPresets, savePreset, deletePreset } from '@/lib/tweet/storage';

export default function PresetsPage() {
  const [presets, setPresets] = useState<TweetPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [useCustomTone, setUseCustomTone] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: 'casual' as const,
    length: 'medium' as const,
    hashtags: true,
    emoji: true,
    mode: 'standard' as const,
    customToneDescription: '',
  });

  // 프리셋 로드
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setIsLoading(true);
      const savedPresets = await getAllPresets();
      const defaultPresets = Object.values(DEFAULT_PRESETS);

      // 저장된 프리셋이 없으면 기본 프리셋으로 초기화
      if (savedPresets.length === 0) {
        for (const preset of defaultPresets) {
          await savePreset(preset);
        }
        setPresets(defaultPresets);
      } else {
        setPresets(savedPresets);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('프리셋 이름을 입력해주세요');
      return;
    }

    try {
      const newPreset: TweetPreset = {
        id: `preset-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await savePreset(newPreset);
      setPresets((prev) => [newPreset, ...prev]);
      setShowForm(false);
      setUseCustomTone(false);
      setFormData({
        name: '',
        description: '',
        tone: 'casual',
        length: 'medium',
        hashtags: true,
        emoji: true,
        mode: 'standard',
        customToneDescription: '',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving preset:', error);
      alert('프리셋 저장에 실패했습니다');
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (!confirm('이 프리셋을 삭제하시겠습니까?')) return;

    try {
      await deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting preset:', error);
      alert('삭제에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/apps/tweet-generator"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">프리셋 관리</h1>
              <p className="text-gray-400">
                자주 사용하는 설정을 프리셋으로 저장하세요
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />새 프리셋
          </button>
        </div>

        {/* 새 프리셋 폼 */}
        {showForm && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
            <form onSubmit={handleSavePreset} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="프리셋 이름"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="설명"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    기본 톤
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tone: e.target.value as typeof formData.tone,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="casual">캐주얼</option>
                    <option value="professional">비즈니스</option>
                    <option value="humorous">유머</option>
                    <option value="inspirational">영감</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomTone}
                      onChange={(e) => setUseCustomTone(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>커스텀 톤 사용</span>
                  </label>
                  {useCustomTone ? (
                    <textarea
                      value={formData.customToneDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customToneDescription: e.target.value,
                        })
                      }
                      placeholder="예: 친근하면서도 신뢰감 있고, 신나는 어조로 새로운 제품의 혁신성을 강조..."
                      className="w-full bg-gray-700 border border-sky-500/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      rows={3}
                    />
                  ) : (
                    <div className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-3 py-2 text-gray-500 text-xs h-20 flex items-center justify-center">
                      기본 톤을 사용합니다
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">길이</label>
                <select
                  value={formData.length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      length: e.target.value as typeof formData.length,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="short">짧음 (140자)</option>
                  <option value="medium">중간 (200자)</option>
                  <option value="long">긴 (280자)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hashtags}
                    onChange={(e) =>
                      setFormData({ ...formData, hashtags: e.target.checked })
                    }
                  />
                  <span className="text-white text-sm">해시태그 포함</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.checked })
                    }
                  />
                  <span className="text-white text-sm">이모지 포함</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  프리셋 저장
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 프리셋 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">로드 중...</p>
          </div>
        ) : presets.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">프리셋이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {preset.name}
                      </h3>
                      {preset.isDefault && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {preset.description}
                    </p>
                  </div>
                  {!preset.isDefault && (
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* 설정 정보 */}
                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="text-gray-500">톤:</span>{' '}
                    {preset.tone.charAt(0).toUpperCase() + preset.tone.slice(1)}
                  </p>
                  <p>
                    <span className="text-gray-500">길이:</span>{' '}
                    {LENGTH_DESCRIPTIONS[preset.length].desc}
                  </p>
                  <p>
                    <span className="text-gray-500">옵션:</span>{' '}
                    {preset.hashtags ? '해시태그' : ''}
                    {preset.hashtags && preset.emoji ? ', ' : ''}
                    {preset.emoji ? '이모지' : ''}
                  </p>
                </div>

                {/* 사용 버튼 */}
                <Link
                  href={`/apps/tweet-generator/create?preset=${preset.id}`}
                  className="mt-4 w-full block text-center bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 px-4 py-2 rounded-lg font-medium transition-all border border-sky-500/50"
                >
                  이 프리셋 사용하기
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
