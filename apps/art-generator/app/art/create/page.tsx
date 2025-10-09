'use client';

import { useState, useMemo } from 'react';
import { useImageStore } from '../../../stores/image-store';
import {
  ART_STYLES,
  ART_TYPES,
  MOODS,
  IMAGE_FORMATS,
  type ImagePrompt,
} from '../../../lib/schemas/image';
import { estimateGenerationCost } from '../../../lib/utils/token-estimator';

export default function CreatePage() {
  const { status, error, generatedImage, tokenCost, generateImage, saveToLibrary, reset } =
    useImageStore();

  const [prompt, setPrompt] = useState<ImagePrompt>({
    prompt: '',
    negativePrompt: '',
    style: undefined,
    artType: undefined,
    mood: undefined,
    width: 1024,
    height: 1024,
    format: 'png',
    seed: undefined,
  });

  const [tags, setTags] = useState<string>('');

  // Estimate cost
  const estimatedCost = useMemo(() => estimateGenerationCost(prompt), [prompt]);

  const handleGenerate = async () => {
    if (!prompt.prompt.trim()) {
      alert('프롬프트를 입력해주세요');
      return;
    }

    await generateImage(prompt);
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    await saveToLibrary({
      imageData: generatedImage,
      prompt: prompt.prompt,
      style: prompt.style,
      artType: prompt.artType,
      mood: prompt.mood,
      width: prompt.width,
      height: prompt.height,
      format: prompt.format,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      tokenCost,
    });

    alert('라이브러리에 저장되었습니다');
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `art-${Date.now()}.${prompt.format}`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          AI 게임 아트 생성
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">
                프롬프트 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={prompt.prompt}
                onChange={(e) => setPrompt({ ...prompt, prompt: e.target.value })}
                placeholder="생성하고 싶은 이미지를 자세히 설명해주세요..."
                className="w-full h-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {prompt.prompt.length}/2000
              </div>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">네거티브 프롬프트 (선택)</label>
              <textarea
                value={prompt.negativePrompt}
                onChange={(e) => setPrompt({ ...prompt, negativePrompt: e.target.value })}
                placeholder="피하고 싶은 요소를 설명해주세요..."
                className="w-full h-20 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium mb-2">스타일</label>
              <select
                value={prompt.style || ''}
                onChange={(e) => setPrompt({ ...prompt, style: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택하지 않음</option>
                {ART_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Art Type */}
            <div>
              <label className="block text-sm font-medium mb-2">아트 타입</label>
              <select
                value={prompt.artType || ''}
                onChange={(e) => setPrompt({ ...prompt, artType: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택하지 않음</option>
                {ART_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium mb-2">무드</label>
              <select
                value={prompt.mood || ''}
                onChange={(e) => setPrompt({ ...prompt, mood: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택하지 않음</option>
                {MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">너비 (px)</label>
                <input
                  type="number"
                  value={prompt.width}
                  onChange={(e) => setPrompt({ ...prompt, width: parseInt(e.target.value) })}
                  min={256}
                  max={2048}
                  step={64}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">높이 (px)</label>
                <input
                  type="number"
                  value={prompt.height}
                  onChange={(e) => setPrompt({ ...prompt, height: parseInt(e.target.value) })}
                  min={256}
                  max={2048}
                  step={64}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium mb-2">포맷</label>
              <select
                value={prompt.format}
                onChange={(e) => setPrompt({ ...prompt, format: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {IMAGE_FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Seed */}
            <div>
              <label className="block text-sm font-medium mb-2">시드 (선택)</label>
              <input
                type="number"
                value={prompt.seed || ''}
                onChange={(e) =>
                  setPrompt({
                    ...prompt,
                    seed: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                min={0}
                max={2147483647}
                placeholder="랜덤"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Token Cost */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">예상 토큰 비용</span>
                <span className="text-lg font-bold text-purple-600">{estimatedCost} tokens</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={status !== 'idle' || !prompt.prompt.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {status === 'generating' ? '생성 중...' : '이미지 생성'}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                초기화
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">미리보기</h2>

            {generatedImage ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-full object-contain"
                  />
                </div>

                {tokenCost && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">실제 토큰 사용량</span>
                      <span className="text-lg font-bold text-green-600">{tokenCost} tokens</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="예: character, hero, fantasy"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    라이브러리에 저장
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    다운로드
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                {status === 'generating' ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p>이미지 생성 중...</p>
                  </div>
                ) : (
                  <p>생성된 이미지가 여기에 표시됩니다</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
