'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Trash2, Eye, Wand2 } from 'lucide-react';
import { useArtStore } from '@/lib/stores/art-store';
import {
  ART_STYLE_PRESETS,
  USAGE_TYPE_PRESETS,
  type ArtStyle,
  type QualityPreset,
  type UsageType,
  type ReferenceImageConfig,
} from '@/lib/art/types';
import { UsageTypeSelector } from '@/components/art/UsageTypeSelector';
import { ReferenceImageUploader } from '@/components/art/ReferenceImageUploader';
import { AssetTypeSelector } from '@/components/art/AssetTypeSelector';
import { CharacterPromptForm } from '@/components/art/CharacterPromptForm';
import { ItemPromptForm } from '@/components/art/ItemPromptForm';
import { EnvironmentPromptForm } from '@/components/art/EnvironmentPromptForm';
import { estimateGenerationCost } from '@/lib/art/utils';
import { getApiKey } from '@/lib/api-key/storage';
import { jobQueue } from '@/lib/queue';
import { getAllImages } from '@/lib/storage/indexed-db';
import { generateImageTags } from '@/lib/utils/tags';
import { PromptBuilder, type PromptPreset } from '@/lib/art/prompt-builder';
import {
  DEFAULT_CHARACTER_PRESET,
  type CharacterPreset,
} from '@/lib/art/presets/character';
import { DEFAULT_ITEM_PRESET, type ItemPreset } from '@/lib/art/presets/item';
import {
  DEFAULT_ENVIRONMENT_PRESET,
  type EnvironmentPreset,
} from '@/lib/art/presets/environment';

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

interface StoredImage {
  id: string;
  data: string;
  metadata: {
    prompt: string;
    style?: string;
    width?: number;
    height?: number;
    quality?: string;
    [key: string]: unknown;
  };
  tags: string[];
  createdAt: Date;
}

export default function ArtCreatePage() {
  const {
    error,
    generatedImages,
    setError,
    removeImage,
    addGeneratedImages,
    startGeneration,
  } = useArtStore();

  // Form state
  const [usageType, setUsageType] = useState<UsageType>('game');
  const [style, setStyle] = useState<ArtStyle>('pixel-art');
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState('512x512');
  const [quality, setQuality] = useState<QualityPreset>('standard');
  const [batchSize, setBatchSize] = useState(1);
  const [seed, setSeed] = useState('');
  const [referenceConfig, setReferenceConfig] = useState<ReferenceImageConfig>({
    images: [],
    usages: ['style'], // 기본값
    influence: 70,
  });

  // Prompt Builder state
  const [promptMode, setPromptMode] = useState<'manual' | 'builder'>('manual');
  const [assetType, setAssetType] = useState<
    'character' | 'item' | 'environment'
  >('character');
  const [characterPreset, setCharacterPreset] = useState<CharacterPreset>(
    DEFAULT_CHARACTER_PRESET
  );
  const [itemPreset, setItemPreset] = useState<ItemPreset>(DEFAULT_ITEM_PRESET);
  const [environmentPreset, setEnvironmentPreset] = useState<EnvironmentPreset>(
    DEFAULT_ENVIRONMENT_PRESET
  );

  // 프롬프트 빌더에서 프롬프트 생성
  const buildPromptFromPreset = () => {
    let preset: PromptPreset;
    if (assetType === 'character') {
      preset = characterPreset;
    } else if (assetType === 'item') {
      preset = itemPreset;
    } else {
      preset = environmentPreset;
    }

    const generatedPrompt = PromptBuilder.buildPrompt(preset);
    setPrompt(generatedPrompt);
  };

  // 에셋 타입 변경 시 자동으로 프롬프트 생성
  useEffect(() => {
    if (promptMode === 'builder') {
      buildPromptFromPreset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetType, characterPreset, itemPreset, environmentPreset, promptMode]);

  // Related images state
  const [relatedImages, setRelatedImages] = useState<StoredImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);

  const stylePreset = ART_STYLE_PRESETS[style];
  const estimatedCost = estimateGenerationCost(resolution, batchSize, quality);

  // UsageType 변경 시 기본값 자동 설정
  useEffect(() => {
    const preset = USAGE_TYPE_PRESETS[usageType];
    setResolution(preset.defaults.resolution);
    setQuality(preset.defaults.quality);

    // 스타일이 현재 UsageType의 사용 가능한 스타일 목록에 없으면 첫 번째 스타일로 변경
    if (!preset.availableStyles.includes(style)) {
      setStyle(preset.availableStyles[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageType]); // style은 의존성에서 제외 (무한 루프 방지)

  // 관련 이미지 로드 및 필터링
  useEffect(() => {
    const loadRelatedImages = async () => {
      try {
        const allImages = await getAllImages();

        // 현재 설정에서 태그 생성
        const currentTags = generateImageTags({
          style,
          resolution,
          quality,
        });

        // 태그가 일치하는 이미지 필터링
        const filtered = allImages.filter((image) =>
          currentTags.some((tag) => image.tags?.includes(tag))
        );

        // 최신순 정렬
        filtered.sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setRelatedImages(filtered.slice(0, 6)); // 최대 6개만 표시
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load related images:', error);
      }
    };

    loadRelatedImages();
  }, [style, resolution, quality]);

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

    // 레퍼런스 이미지 준비
    const referenceImages =
      referenceConfig.images.length > 0 && referenceConfig.usages.length > 0
        ? {
            images: referenceConfig.images.map((img) => img.preview),
            usages: referenceConfig.usages,
            influence: referenceConfig.influence,
          }
        : undefined;

    // 레퍼런스 이미지가 있으면 localStorage 용량 문제로 즉시 생성
    const hasReferenceImages = referenceImages !== undefined;

    try {
      if (hasReferenceImages) {
        // 즉시 생성 (큐 사용 안 함)
        setError('');
        startGeneration(); // 로딩 상태 시작
        alert('🎨 레퍼런스 이미지를 사용하여 즉시 생성합니다...');

        const response = await fetch('/api/art/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            style,
            resolution,
            quality,
            batchSize,
            ...(seed && { seed: parseInt(seed, 10) }),
            referenceImages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || '이미지 생성 실패');
        }

        const data = await response.json();

        // 생성된 이미지를 스토어에 추가
        if (data.images && Array.isArray(data.images)) {
          addGeneratedImages(data);
          alert(`✅ ${data.images.length}개 이미지 생성 완료!`);
        }

        // 폼 초기화
        setPrompt('');
        setSeed('');
        setReferenceConfig({
          images: [],
          usages: ['style'],
          influence: 70,
        });
      } else {
        // 작업 큐에 추가 (레퍼런스 이미지 없을 때)
        jobQueue.addImageJob({
          prompt: prompt.trim(),
          style,
          resolution,
          quality,
          batchSize,
          ...(seed && { seed: parseInt(seed, 10) }),
        });

        // 폼 초기화
        setPrompt('');
        setSeed('');
        setError('');

        alert(
          '✅ 이미지 생성 작업이 큐에 추가되었습니다.\n완료되면 알림을 받게 됩니다.'
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '이미지 생성 중 오류가 발생했습니다';
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

  // 관련 이미지 다운로드
  const handleDownloadRelated = (
    imageData: string,
    imageId: string,
    format: 'png' | 'jpg' = 'png'
  ) => {
    const link = document.createElement('a');
    const dataUrl = imageData.startsWith('data:')
      ? imageData
      : `data:image/png;base64,${imageData}`;
    link.href = dataUrl;
    link.download = `art-${imageId}.${format}`;
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
          {/* Usage Type Selection */}
          <UsageTypeSelector value={usageType} onChange={setUsageType} />

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
              {Object.entries(ART_STYLE_PRESETS)
                .filter(([key]) =>
                  USAGE_TYPE_PRESETS[usageType].availableStyles.includes(
                    key as ArtStyle
                  )
                )
                .map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.icon} {preset.name}
                  </option>
                ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {stylePreset.description}
            </p>
          </div>

          {/* Reference Images */}
          <ReferenceImageUploader
            value={referenceConfig}
            onChange={setReferenceConfig}
          />

          {/* Prompt Section */}
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                프롬프트 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPromptMode('manual')}
                  className={`
                    px-3 py-1 rounded text-xs transition-all
                    ${
                      promptMode === 'manual'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  ✍️ 직접 입력
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPromptMode('builder');
                    buildPromptFromPreset();
                  }}
                  className={`
                    px-3 py-1 rounded text-xs transition-all flex items-center gap-1
                    ${
                      promptMode === 'builder'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  <Wand2 className="w-3 h-3" />
                  프리셋 빌더
                </button>
              </div>
            </div>

            {/* Builder Mode */}
            {promptMode === 'builder' && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                {/* Asset Type Selector */}
                <AssetTypeSelector value={assetType} onChange={setAssetType} />

                {/* Dynamic Form based on Asset Type */}
                {assetType === 'character' && (
                  <CharacterPromptForm
                    value={characterPreset}
                    onChange={setCharacterPreset}
                  />
                )}
                {assetType === 'item' && (
                  <ItemPromptForm value={itemPreset} onChange={setItemPreset} />
                )}
                {assetType === 'environment' && (
                  <EnvironmentPromptForm
                    value={environmentPreset}
                    onChange={setEnvironmentPreset}
                  />
                )}
              </div>
            )}

            {/* Generated/Manual Prompt Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">
                  {promptMode === 'builder'
                    ? '생성된 프롬프트 (수정 가능)'
                    : '프롬프트'}
                </label>
                {promptMode === 'builder' && (
                  <button
                    type="button"
                    onClick={buildPromptFromPreset}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    🔄 프롬프트 재생성
                  </button>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  promptMode === 'manual'
                    ? `예: ${stylePreset.examples[0]}`
                    : '프리셋을 설정하면 자동으로 프롬프트가 생성됩니다'
                }
                rows={promptMode === 'builder' ? 3 : 4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
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

        {/* Related Images Section */}
        {relatedImages.length > 0 && (
          <div className="app-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🎨 관련 이미지</h2>
              <p className="text-sm text-gray-400">
                현재 설정과 유사한 이미지 {relatedImages.length}개
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedImages.map((image) => {
                const dataUrl = image.data.startsWith('data:')
                  ? image.data
                  : `data:image/png;base64,${image.data}`;

                return (
                  <div
                    key={image.id}
                    className="app-card overflow-hidden group cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative aspect-square bg-gray-800"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={dataUrl}
                        alt={image.metadata.prompt}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <p className="text-xs line-clamp-2 text-gray-400">
                        {image.metadata.prompt}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {image.metadata.width && image.metadata.height && (
                          <span>
                            {image.metadata.width}×{image.metadata.height}
                          </span>
                        )}
                        {image.metadata.style && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {image.metadata.style}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Tags */}
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {image.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {image.tags.length > 2 && (
                            <span className="px-1.5 py-0.5 text-gray-500 text-xs">
                              +{image.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadRelated(image.data, image.id, 'png');
                          }}
                          className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          PNG
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadRelated(image.data, image.id, 'jpg');
                          }}
                          className="flex-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          JPG
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Detail Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="app-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold">이미지 상세</h3>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    닫기
                  </button>
                </div>

                {/* Image */}
                <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={
                      selectedImage.data.startsWith('data:')
                        ? selectedImage.data
                        : `data:image/png;base64,${selectedImage.data}`
                    }
                    alt={selectedImage.metadata.prompt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">프롬프트</div>
                    <p className="text-sm">{selectedImage.metadata.prompt}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg text-sm">
                    {selectedImage.metadata.width &&
                      selectedImage.metadata.height && (
                        <div>
                          <div className="text-gray-500 text-xs">해상도</div>
                          <div className="font-medium">
                            {selectedImage.metadata.width}×
                            {selectedImage.metadata.height}
                          </div>
                        </div>
                      )}
                    {selectedImage.metadata.style && (
                      <div>
                        <div className="text-gray-500 text-xs">스타일</div>
                        <div className="font-medium">
                          {selectedImage.metadata.style}
                        </div>
                      </div>
                    )}
                    {selectedImage.metadata.quality && (
                      <div>
                        <div className="text-gray-500 text-xs">품질</div>
                        <div className="font-medium">
                          {selectedImage.metadata.quality}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-500 text-xs">생성 시각</div>
                      <div className="font-medium text-xs">
                        {new Date(selectedImage.createdAt).toLocaleDateString(
                          'ko-KR',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">태그</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Download Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        handleDownloadRelated(
                          selectedImage.data,
                          selectedImage.id,
                          'png'
                        )
                      }
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PNG 다운로드
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadRelated(
                          selectedImage.data,
                          selectedImage.id,
                          'jpg'
                        )
                      }
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      JPG 다운로드
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
