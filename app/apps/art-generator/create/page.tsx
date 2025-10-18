'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Trash2, Eye, Wand2, Cloud } from 'lucide-react';
import { Button, Select, Input, RangeSlider } from '@aiapps/ui';
import { useArtStore } from '@/lib/stores/art-store';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import { useGoogleDriveUpload } from '@/lib/google-drive/hooks';
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
import { ThemeSelector } from '@/components/art/ThemeSelector';
import { ThemeManagementModal } from '@/components/art/ThemeManagementModal';
import { DynamicPresetForm } from '@/components/art/DynamicPresetForm';
import { estimateGenerationCost } from '@/lib/art/utils';
import { getApiKey } from '@/lib/api-key/storage';
import { jobQueue } from '@/lib/queue';
import { getAllImages } from '@/lib/storage/indexed-db';
import { generateImageTags } from '@/lib/utils/tags';
import type { PromptTheme } from '@/lib/art/prompt-theme';
import type { PresetBuilderSchema } from '@/lib/art/preset-builder-schema';
import { buildPromptFromSchema } from '@/lib/art/preset-builder-schema';

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
  const { error, generatedImages, setError, removeImage } = useArtStore();
  const { isAuthenticated } = useGoogleDriveStore();
  const uploadFile = useGoogleDriveUpload();

  // Form state
  const [usageType, setUsageType] = useState<UsageType>('game');
  const [isSavingToDrive, setIsSavingToDrive] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<PromptTheme | null>(null);
  const [availableArtStyles, setAvailableArtStyles] = useState<
    Array<{ value: ArtStyle; label: string; description: string }>
  >([]);
  const [style, setStyle] = useState<ArtStyle>('pixel-art');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Handle theme change
  const handleThemeChange = (theme: PromptTheme) => {
    setCurrentTheme(theme);
    setAvailableArtStyles(theme.artStyles);

    // Update style to first available in new theme
    if (theme.artStyles.length > 0) {
      setStyle(theme.artStyles[0].value);
    }

    // Select first preset if available
    if (theme.presetBuilders.length > 0) {
      setSelectedPreset(theme.presetBuilders[0]);
    }

    // Rebuild prompt if in builder mode
    if (promptMode === 'builder') {
      handleBuildPromptFromPreset();
    }
  };
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

  // Prompt Builder state - 유연한 프리셋 시스템
  const [promptMode, setPromptMode] = useState<'manual' | 'builder'>('manual');
  const [selectedPreset, setSelectedPreset] =
    useState<PresetBuilderSchema | null>(null);

  // 프롬프트 빌더에서 프롬프트 생성
  const handleBuildPromptFromPreset = () => {
    if (!selectedPreset) {
      setPrompt('');
      return;
    }

    const generatedPrompt = buildPromptFromSchema(selectedPreset);
    setPrompt(generatedPrompt);
  };

  // 테마 변경 시 첫 번째 프리셋 자동 선택
  useEffect(() => {
    if (
      currentTheme &&
      currentTheme.presetBuilders.length > 0 &&
      !selectedPreset
    ) {
      setSelectedPreset(currentTheme.presetBuilders[0]);
    }
  }, [currentTheme, selectedPreset]);

  // 프리셋 변경 시 자동으로 프롬프트 생성
  useEffect(() => {
    if (promptMode === 'builder' && selectedPreset) {
      handleBuildPromptFromPreset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreset, promptMode]);

  // Related images state
  const [relatedImages, setRelatedImages] = useState<StoredImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);

  const estimatedCost = estimateGenerationCost(resolution, batchSize, quality);

  // 현재 선택된 스타일의 정보 가져오기
  const currentStyleInfo = availableArtStyles.find((s) => s.value === style);
  const stylePreset = ART_STYLE_PRESETS[style] || {
    name: currentStyleInfo?.label || '알 수 없음',
    icon: '🎨',
    description: currentStyleInfo?.description || '',
    examples: [''],
    recommendedResolution: '512x512',
    aspectRatio: '1:1',
  };

  // UsageType 변경 시 기본값 자동 설정 (테마 시스템으로 대체됨)
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

    try {
      jobQueue.addImageGenerateJob({
        prompt: prompt.trim(),
        style,
        resolution,
        quality,
        batchSize,
        ...(seed && { seed: parseInt(seed, 10) }),
        ...(referenceImages && { referenceImages }),
      });

      // 폼 초기화
      setPrompt('');
      setSeed('');
      setReferenceConfig({
        images: [],
        usages: ['style'],
        influence: 70,
      });
      setError('');

      alert(
        '✅ 이미지 생성 작업이 큐에 추가되었습니다.\n완료되면 알림을 받게 됩니다.'
      );
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

  // Google Drive 저장 핸들러
  const handleSaveToGoogleDrive = async (
    image: (typeof generatedImages)[0]
  ) => {
    if (!isAuthenticated) {
      setError('Google Drive에 저장하려면 먼저 로그인해주세요');
      return;
    }

    setIsSavingToDrive(image.id);
    try {
      // Blob URL에서 fetch로 이미지 데이터 가져오기
      const response = await fetch(image.blobUrl);
      const blob = await response.blob();

      // 파일명 생성
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-');
      const filename = `art-${timestamp}.png`;

      // 메타데이터
      const metadata: Record<string, string> = {
        prompt: image.metadata.prompt || '',
        style: image.metadata.style || '',
        width: String(image.metadata.width || ''),
        height: String(image.metadata.height || ''),
        quality: image.metadata.quality || '',
        seed: image.metadata.seed ? String(image.metadata.seed) : '',
      };

      // Google Drive 업로드
      const result = await uploadFile(blob, filename, 'image', metadata);

      if (result) {
        setError('');
        // 성공 메시지
        alert('✅ 이미지가 Google Drive에 저장되었습니다!');
      } else {
        setError('Google Drive 저장에 실패했습니다');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Google Drive 저장 중 오류 발생';
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('Google Drive save error:', err);
    } finally {
      setIsSavingToDrive(null);
    }
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

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              프롬프트 테마
            </label>
            <ThemeSelector
              usageType={usageType}
              selectedThemeId={currentTheme?.id}
              onThemeChange={handleThemeChange}
              onManageThemes={() => setIsThemeModalOpen(true)}
            />
            <p className="mt-2 text-xs text-gray-500">
              {currentTheme?.description ||
                '사용 목적에 맞는 테마를 선택하세요'}
            </p>
          </div>

          {/* Style Selection */}
          <div>
            <Select
              label="아트 스타일"
              value={style}
              onChange={(e) => setStyle(e.target.value as ArtStyle)}
              options={
                availableArtStyles.length > 0
                  ? availableArtStyles
                  : [{ value: '', label: '테마를 먼저 선택하세요' }]
              }
              helperText={
                availableArtStyles.find((s) => s.value === style)
                  ?.description || '아트 스타일을 선택하세요'
              }
              disabled={availableArtStyles.length === 0}
              fullWidth
            />
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
                <Button
                  type="button"
                  onClick={() => setPromptMode('manual')}
                  variant={promptMode === 'manual' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  ✍️ 직접 입력
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setPromptMode('builder');
                    handleBuildPromptFromPreset();
                  }}
                  variant={promptMode === 'builder' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  <Wand2 className="w-3 h-3" />
                  프리셋 빌더
                </Button>
              </div>
            </div>

            {/* Builder Mode */}
            {promptMode === 'builder' && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                {/* Preset Selector */}
                <div>
                  <Select
                    label="프리셋 선택"
                    value={selectedPreset?.id || ''}
                    onChange={(e) => {
                      const preset = currentTheme?.presetBuilders.find(
                        (p) => p.id === e.target.value
                      );
                      setSelectedPreset(preset || null);
                    }}
                    options={
                      currentTheme && currentTheme.presetBuilders.length > 0
                        ? currentTheme.presetBuilders.map((preset) => ({
                            value: preset.id,
                            label: `${preset.icon || '📦'} ${preset.name}`,
                          }))
                        : [{ value: '', label: '테마를 먼저 선택하세요' }]
                    }
                    helperText={selectedPreset?.description}
                    disabled={
                      !currentTheme || currentTheme.presetBuilders.length === 0
                    }
                    fullWidth
                  />
                </div>

                {/* Dynamic Preset Form */}
                {selectedPreset && (
                  <DynamicPresetForm
                    schema={selectedPreset}
                    onChange={(updatedSchema) => {
                      setSelectedPreset(updatedSchema);
                    }}
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
                  <Button
                    type="button"
                    onClick={handleBuildPromptFromPreset}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    🔄 프롬프트 재생성
                  </Button>
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
              <Select
                label="해상도"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                options={RESOLUTIONS}
                helperText={`추천: ${stylePreset.recommendedResolution}`}
                fullWidth
              />
            </div>

            {/* Quality */}
            <div>
              <Select
                label="품질"
                value={quality}
                onChange={(e) => setQuality(e.target.value as QualityPreset)}
                options={QUALITY_PRESETS.map((q) => ({
                  value: q.value,
                  label: `${q.label} - ${q.description}`,
                }))}
                fullWidth
              />
            </div>
          </div>

          {/* Batch Size & Seed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch Size */}
            <RangeSlider
              label="생성 개수"
              min={1}
              max={4}
              step={1}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              helperText="한 번에 생성할 이미지 개수 (1~4개)"
              fullWidth
            />

            {/* Seed */}
            <div>
              <Input
                type="number"
                label="시드 (선택사항)"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="랜덤"
                helperText="동일한 시드로 재현 가능한 이미지 생성"
                fullWidth
              />
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
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            variant="primary"
            size="lg"
            fullWidth
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            🎨 작업 큐에 추가하기
          </Button>
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
                      <Button
                        onClick={() => handleDownload(image, 'png')}
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        PNG
                      </Button>
                      <Button
                        onClick={() => handleDownload(image, 'jpg')}
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4" />
                        JPG
                      </Button>
                      <Button
                        onClick={() => handleSaveToGoogleDrive(image)}
                        disabled={
                          isSavingToDrive === image.id || !isAuthenticated
                        }
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                      >
                        {isSavingToDrive === image.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-cyan-200 mr-1" />
                            저장 중...
                          </>
                        ) : (
                          <>
                            <Cloud className="w-4 h-4" />
                            저장
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => removeImage(image.id)}
                        variant="danger"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadRelated(image.data, image.id, 'png');
                          }}
                          variant="primary"
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          <Download className="w-3 h-3" />
                          PNG
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadRelated(image.data, image.id, 'jpg');
                          }}
                          variant="primary"
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <Download className="w-3 h-3" />
                          JPG
                        </Button>
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
                  <Button
                    onClick={() => setSelectedImage(null)}
                    variant="secondary"
                    size="sm"
                  >
                    닫기
                  </Button>
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
                    <Button
                      onClick={() =>
                        handleDownloadRelated(
                          selectedImage.data,
                          selectedImage.id,
                          'png'
                        )
                      }
                      variant="primary"
                      size="md"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      PNG 다운로드
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownloadRelated(
                          selectedImage.data,
                          selectedImage.id,
                          'jpg'
                        )
                      }
                      variant="primary"
                      size="md"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      JPG 다운로드
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Management Modal */}
      <ThemeManagementModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onThemeCreated={(theme) => {
          handleThemeChange(theme);
          setIsThemeModalOpen(false);
        }}
      />
    </div>
  );
}
