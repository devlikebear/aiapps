'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, AlertCircle, Grid3x3 } from 'lucide-react';
import { Input } from '@aiapps/ui';
import {
  REFERENCE_IMAGE_CONSTRAINTS,
  processImageFile,
  formatFileSize,
} from '@/lib/utils/image';

export interface SpriteReference {
  id: string;
  file: File;
  preview: string;
  frameColumns: number;
  frameRows: number;
}

interface SpriteReferenceUploaderProps {
  value: SpriteReference | null;
  onChange: (sprite: SpriteReference | null) => void;
  disabled?: boolean;
}

export function SpriteReferenceUploader({
  value,
  onChange,
  disabled = false,
}: SpriteReferenceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    setIsUploading(true);

    try {
      const file = files[0]; // 한 개만 선택
      const result = await processImageFile(file);

      if (!result.success) {
        setError(result.error || '이미지 처리 실패');
        return;
      }

      onChange({
        id: `${Date.now()}`,
        file,
        preview: result.preview || '',
        frameColumns: value?.frameColumns || 4, // 기본값 4열
        frameRows: value?.frameRows || 1, // 기본값 1행
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
  const handleRemove = () => {
    onChange(null);
    setError('');
  };

  // 프레임 설정 변경
  const handleFrameSettingChange = (
    key: 'frameColumns' | 'frameRows',
    newValue: number
  ) => {
    if (!value) return;

    const validValue = Math.max(1, Math.min(newValue, 20)); // 1~20 사이로 제한

    onChange({
      ...value,
      [key]: validValue,
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
        📸 참조 애니메이션 스프라이트 <span className="text-red-400">*</span>
      </label>

      {/* 업로드된 이미지 */}
      {value && (
        <div className="space-y-4">
          {/* 이미지 프리뷰 */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
            <div className="relative aspect-video">
              <Image
                src={value.preview}
                alt="Sprite Reference"
                fill
                className="object-contain"
                unoptimized
              />

              {/* 그리드 오버레이 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: `${100 / value.frameColumns}% ${100 / value.frameRows}%`,
                }}
              />
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 파일 정보 */}
            <div className="p-3 bg-gray-900/80 border-t border-gray-700">
              <p className="text-sm truncate">{value.file.name}</p>
              <p className="text-xs text-gray-400">
                {formatFileSize(value.file.size)} • 총{' '}
                {value.frameColumns * value.frameRows}개 프레임
              </p>
            </div>
          </div>

          {/* 프레임 설정 */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Grid3x3 className="w-4 h-4" />
              <span>프레임 설정</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="가로 프레임 수"
                value={value.frameColumns}
                onChange={(e) =>
                  handleFrameSettingChange(
                    'frameColumns',
                    parseInt(e.target.value) || 1
                  )
                }
                min={1}
                max={20}
                disabled={disabled}
                helperText="한 행에 몇 개의 프레임?"
                fullWidth
              />

              <Input
                type="number"
                label="세로 프레임 수"
                value={value.frameRows}
                onChange={(e) =>
                  handleFrameSettingChange(
                    'frameRows',
                    parseInt(e.target.value) || 1
                  )
                }
                min={1}
                max={20}
                disabled={disabled}
                helperText="몇 개의 행?"
                fullWidth
              />
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">
              <p>
                💡 예: 걷기 애니메이션이 4프레임이라면 가로=4, 세로=1로 설정하세요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 초기 업로드 영역 */}
      {!value && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg p-12 text-center cursor-pointer transition-colors bg-gray-800/30 hover:bg-gray-800/50"
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-base font-medium mb-2">
            애니메이션 스프라이트를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-gray-400 mb-1">
            여러 프레임이 포함된 스프라이트 시트 이미지
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPEG, WebP (최대{' '}
            {formatFileSize(REFERENCE_IMAGE_CONSTRAINTS.maxFileSize)})
          </p>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={REFERENCE_IMAGE_CONSTRAINTS.acceptedFormats.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
