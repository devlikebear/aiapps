'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, AlertCircle } from 'lucide-react';
import {
  REFERENCE_USAGE_OPTIONS,
  type ReferenceUsage,
  type ReferenceImageConfig,
} from '@/lib/art/types';
import {
  REFERENCE_IMAGE_CONSTRAINTS,
  processImageFile,
  formatFileSize,
} from '@/lib/utils/image';

interface ReferenceImageUploaderProps {
  value: ReferenceImageConfig;
  onChange: (config: ReferenceImageConfig) => void;
  disabled?: boolean;
}

export function ReferenceImageUploader({
  value,
  onChange,
  disabled = false,
}: ReferenceImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { images, influence, usages } = value;
  const canAddMore = images.length < REFERENCE_IMAGE_CONSTRAINTS.maxFiles;

  // 파일 선택 핸들러
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    setIsUploading(true);

    try {
      const newImages = [...images];

      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= REFERENCE_IMAGE_CONSTRAINTS.maxFiles) {
          setError(
            `최대 ${REFERENCE_IMAGE_CONSTRAINTS.maxFiles}개까지만 업로드 가능합니다.`
          );
          break;
        }

        const file = files[i];
        const result = await processImageFile(file);

        if (!result.success) {
          setError(result.error || '이미지 처리 실패');
          continue;
        }

        newImages.push({
          id: `${Date.now()}-${i}`,
          file,
          preview: result.preview || '',
        });
      }

      onChange({
        ...value,
        images: newImages,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '이미지 업로드 중 오류 발생'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 이미지 제거
  const handleRemoveImage = (id: string) => {
    onChange({
      ...value,
      images: images.filter((img) => img.id !== id),
    });
  };

  // 활용 방식 토글 (멀티선택)
  const handleUsageToggle = (usage: ReferenceUsage) => {
    const newUsages = usages.includes(usage)
      ? usages.filter((u) => u !== usage)
      : [...usages, usage];

    onChange({
      ...value,
      usages: newUsages,
    });
  };

  // 영향력 변경
  const handleInfluenceChange = (newInfluence: number) => {
    onChange({
      ...value,
      influence: newInfluence,
    });
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        📎 레퍼런스 이미지 (선택사항)
      </label>

      {/* 업로드 영역 */}
      <div className="space-y-3">
        {/* 이미지 그리드 */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group"
              >
                <Image
                  src={image.preview}
                  alt="Reference"
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  disabled={disabled}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* 파일 정보 */}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">
                    {image.file.name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatFileSize(image.file.size)}
                  </p>
                </div>
              </div>
            ))}

            {/* 추가 버튼 */}
            {canAddMore && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="aspect-square bg-gray-800 hover:bg-gray-750 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-500">추가</span>
              </button>
            )}
          </div>
        )}

        {/* 초기 업로드 영역 */}
        {images.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-colors bg-gray-800/30 hover:bg-gray-800/50"
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-sm font-medium mb-1">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPEG, WebP (최대 {REFERENCE_IMAGE_CONSTRAINTS.maxFiles}개,{' '}
              {formatFileSize(REFERENCE_IMAGE_CONSTRAINTS.maxFileSize)})
            </p>
          </div>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={REFERENCE_IMAGE_CONSTRAINTS.acceptedFormats.join(',')}
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 설정 옵션 (이미지가 있을 때만) */}
      {images.length > 0 && (
        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 space-y-4">
          {/* 활용 방식 (멀티선택) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ⚙️ 레퍼런스 활용 방식 (복수 선택 가능)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(REFERENCE_USAGE_OPTIONS) as ReferenceUsage[]).map(
                (usage) => {
                  const option = REFERENCE_USAGE_OPTIONS[usage];
                  const isSelected = usages.includes(usage);

                  return (
                    <button
                      key={usage}
                      type="button"
                      onClick={() => handleUsageToggle(usage)}
                      disabled={disabled}
                      className={`
                        p-2 rounded-lg border text-left transition-all
                        ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{option.icon}</span>
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                        {isSelected && (
                          <span className="ml-auto text-purple-400 text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {option.description}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 영향력 슬라이더 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                🎚️ 영향력: {influence}%
              </label>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={influence}
              onChange={(e) => handleInfluenceChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>약함</span>
              <span>보통</span>
              <span>강함</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
