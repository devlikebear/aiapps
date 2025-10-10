'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Trash2 } from 'lucide-react';
import { useArtStore } from '@/lib/stores/art-store';
import {
  ART_STYLE_PRESETS,
  type ArtStyle,
  type QualityPreset,
} from '@/lib/art/types';
import { estimateGenerationCost } from '@/lib/art/utils';
import { getApiKey } from '@/lib/api-key/storage';
import { jobQueue } from '@/lib/queue';

const RESOLUTIONS = [
  { label: '256×256', value: '256x256' },
  { label: '512×512', value: '512x512' },
  { label: '768×768', value: '768x768' },
  { label: '1024×1024', value: '1024x1024' },
  { label: '1024×768', value: '1024x768' },
  { label: '768×1024', value: '768x1024' },
  { label: '1920×1080', value: '1920x1080' },
  { label: '1080×1920', value: '1080x1920' },
];

const QUALITY_PRESETS: Array<{
  value: QualityPreset;
  label: string;
  description: string;
}> = [
  { value: 'draft', label: '드래프트', description: '빠른 생성, 낮은 품질' },
  { value: 'standard', label: '표준', description: '균형잡힌 품질과 속도' },
  { value: 'high', label: '고품질', description: '최고 품질, 느린 생성' },
];

export default function ArtCreatePage() {
  const { error, generatedImages, setError, removeImage } = useArtStore();

  // Form state
  const [style, setStyle] = useState<ArtStyle>('pixel-art');
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState('512x512');
  const [quality, setQuality] = useState<QualityPreset>('standard');
  const [batchSize, setBatchSize] = useState(1);
  const [seed, setSeed] = useState('');

  const stylePreset = ART_STYLE_PRESETS[style];
  const estimatedCost = estimateGenerationCost(resolution, batchSize, quality);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      setError(
        'API 키가 설정되지 않았습니다. 헤더의 설정 버튼에서 API 키를 등록해주세요.'
      );
      return;
    }

    // 작업 큐에 추가
    try {
      jobQueue.addImageJob({
        prompt: prompt.trim(),
        style,
        resolution,
        quality,
        batchSize,
        ...(seed && { seed: parseInt(seed, 10) }),
      });

      // 폼 초기화 (선택적)
      setPrompt('');
      setSeed('');
      setError('');

      // 성공 메시지 표시
      alert(
        '✅ 이미지 생성 작업이 큐에 추가되었습니다.\n완료되면 알림을 받게 됩니다.'
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '작업 큐 추가 중 오류가 발생했습니다';
      setError(errorMessage);
    }
  };

  const handleDownload = (
    image: (typeof generatedImages)[0],
    format: 'png' | 'jpg' = 'png'
  ) => {
    const link = document.createElement('a');
    link.href = image.blobUrl;
    link.download = `art-${image.id}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🎨 AI 아트 생성기
          </h1>
          <p className="text-gray-400">2D 게임 아트를 AI로 생성하세요</p>
        </div>

        {/* Generation Form */}
        <div className="app-card p-6 md:p-8 space-y-6">
          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              아트 스타일
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as ArtStyle)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(ART_STYLE_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.icon} {preset.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {stylePreset.description}
            </p>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">
              프롬프트 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`예: ${stylePreset.examples[0]}`}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Resolution & Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium mb-2">해상도</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {RESOLUTIONS.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                추천: {stylePreset.recommendedResolution}
              </p>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium mb-2">품질</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as QualityPreset)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {QUALITY_PRESETS.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label} - {q.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Batch Size & Seed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                생성 개수: {batchSize}개
              </label>
              <input
                type="range"
                min={1}
                max={4}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1개</span>
                <span>4개</span>
              </div>
            </div>

            {/* Seed */}
            <div>
              <label className="block text-sm font-medium mb-2">
                시드 (선택사항)
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="랜덤"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                동일한 시드로 재현 가능한 이미지 생성
              </p>
            </div>
          </div>

          {/* Style Info */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium mb-2">
              {stylePreset.icon} {stylePreset.name} 스타일
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <span className="text-gray-500">추천 비율:</span>{' '}
                {stylePreset.aspectRatio}
              </div>
              <div>
                <span className="text-gray-500">예상 비용:</span> ≈
                {estimatedCost.toFixed(2)} 토큰
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            🎨 작업 큐에 추가하기
          </button>
        </div>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="app-card p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold">생성된 이미지</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image) => (
                <div key={image.id} className="app-card overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-800">
                    <Image
                      src={image.blobUrl}
                      alt={image.metadata.prompt}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  {/* Info & Actions */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm line-clamp-2">
                      {image.metadata.prompt}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {image.metadata.width}×{image.metadata.height}
                      </span>
                      <span>•</span>
                      <span>{image.metadata.style}</span>
                      {image.metadata.seed && (
                        <>
                          <span>•</span>
                          <span>시드: {image.metadata.seed}</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(image, 'png')}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        PNG
                      </button>
                      <button
                        onClick={() => handleDownload(image, 'jpg')}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        JPG
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
