'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useArtStore } from '@/lib/stores/art-store';
import {
  ART_STYLE_PRESETS,
  RESOLUTION_PRESETS,
  QUALITY_PRESETS,
  type ArtStyle,
  type ResolutionPreset,
  type QualityPreset,
  type ArtGenerateRequest,
} from '@/lib/art/types';
import { estimateGenerationCost } from '@/lib/art/utils';
import { getApiKey } from '@/lib/api-key/storage';
import ImageGrid from '@/components/art/ImageGrid';

export default function CreateArtPage() {
  const {
    selectedStyle,
    isGenerating,
    generationProgress,
    error,
    startGeneration,
    setError,
    addGeneratedImages,
  } = useArtStore();

  // Form state
  const [style, setStyle] = useState<ArtStyle>(selectedStyle || 'pixel-art');
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<ResolutionPreset>('512x512');
  const [quality, setQuality] = useState<QualityPreset>('standard');
  const [seed, setSeed] = useState<string>('');
  const [batchSize, setBatchSize] = useState(1);

  // Update style when store changes
  useEffect(() => {
    if (selectedStyle) {
      setStyle(selectedStyle);
    }
  }, [selectedStyle]);

  // Get preset info
  const preset = ART_STYLE_PRESETS[style];
  const resolutionInfo = RESOLUTION_PRESETS[resolution];
  const qualityInfo = QUALITY_PRESETS[quality];

  // Calculate cost
  const estimatedCost = estimateGenerationCost(resolution, batchSize, quality);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    // Check API key
    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      setError(
        'API 키가 설정되지 않았습니다. 헤더의 🔑 버튼을 클릭하여 API 키를 등록해주세요.'
      );
      return;
    }

    startGeneration();

    try {
      const request: ArtGenerateRequest = {
        style,
        prompt,
        resolution,
        quality,
        batchSize,
        ...(seed && { seed: parseInt(seed, 10) }),
      };

      const response = await fetch('/api/art/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 생성에 실패했습니다');
      }

      const data = await response.json();
      addGeneratedImages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '이미지 생성 중 오류가 발생했습니다'
      );
    }
  };

  return (
    <main className="min-h-screen relative z-10">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-20 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/apps/art-generator"
            className="inline-block text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            ← 뒤로 가기
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 glow-text-purple">
            아트 생성
          </h1>
          <p className="text-xl text-gray-300">
            프롬프트를 입력하고 AI 이미지를 생성하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Style Selection */}
            <div className="app-card">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                아트 스타일
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ArtStyle)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isGenerating}
              >
                {Object.values(ART_STYLE_PRESETS).map((p) => (
                  <option key={p.style} value={p.style}>
                    {p.icon} {p.name} - {p.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt */}
            <div className="app-card">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                프롬프트 *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={preset.promptTemplate.replace(
                  '{subject}',
                  'your subject'
                )}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                disabled={isGenerating}
              />
              <p className="mt-2 text-xs text-gray-500">
                예시: {preset.examples[0]}
              </p>
            </div>

            {/* Resolution & Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="app-card">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  해상도
                </label>
                <select
                  value={resolution}
                  onChange={(e) =>
                    setResolution(e.target.value as ResolutionPreset)
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  {Object.entries(RESOLUTION_PRESETS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} ({info.width}x{info.height})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  권장: {preset.recommendedResolution}
                </p>
              </div>

              <div className="app-card">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  품질
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as QualityPreset)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  {Object.entries(QUALITY_PRESETS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} - {info.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seed & Batch Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="app-card">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  시드 (선택 사항)
                </label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="랜덤"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isGenerating}
                />
                <p className="mt-2 text-xs text-gray-500">
                  동일한 결과를 재현하려면 시드 값 입력
                </p>
              </div>

              <div className="app-card">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  배치 크기 (1-4)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(
                      Math.max(1, Math.min(4, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isGenerating}
                />
                <p className="mt-2 text-xs text-gray-500">
                  한 번에 생성할 이미지 수
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="app-card bg-red-900/20 border-red-500/30">
                <div className="flex items-start gap-3">
                  <div className="text-xl">❌</div>
                  <div>
                    <h3 className="text-sm font-bold text-red-300 mb-1">
                      오류
                    </h3>
                    <p className="text-sm text-gray-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>생성 중... {generationProgress}%</span>
                </div>
              ) : (
                '이미지 생성하기'
              )}
            </button>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Style Info */}
            <div className="app-card bg-purple-900/20 border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{preset.icon}</div>
                <div>
                  <h3 className="font-bold text-white">{preset.name}</h3>
                  <p className="text-xs text-gray-400">{preset.description}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">권장 해상도</span>
                  <span className="text-white">
                    {preset.recommendedResolution}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">종횡비</span>
                  <span className="text-white">{preset.aspectRatio}</span>
                </div>
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="app-card bg-blue-900/20 border-blue-500/30">
              <h3 className="font-bold text-white mb-4">💰 예상 비용</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">해상도</span>
                  <span className="text-white">
                    {resolutionInfo.width}x{resolutionInfo.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">배치 크기</span>
                  <span className="text-white">x{batchSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">품질</span>
                  <span className="text-white">{qualityInfo.name}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-blue-700 flex justify-between">
                  <span className="text-gray-300 font-semibold">
                    총 예상 비용
                  </span>
                  <span className="text-blue-300 font-bold">
                    ${estimatedCost.toFixed(4)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                * 실제 비용은 Gemini API 가격 정책에 따라 다를 수 있습니다
              </p>
            </div>

            {/* Tips */}
            <div className="app-card bg-gray-800/50">
              <h3 className="font-bold text-white mb-3">💡 프롬프트 팁</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>구체적인 설명을 추가하세요</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>스타일 키워드를 포함하세요</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>색상이나 분위기를 명시하세요</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>영어 프롬프트가 더 정확합니다</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generated Images */}
        <ImageGrid />
      </div>
    </main>
  );
}
