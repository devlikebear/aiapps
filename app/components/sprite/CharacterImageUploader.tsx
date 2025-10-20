'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, AlertCircle, User } from 'lucide-react';
import {
  REFERENCE_IMAGE_CONSTRAINTS,
  processImageFile,
  formatFileSize,
} from '@/lib/utils/image';

export interface CharacterImage {
  id: string;
  file: File;
  preview: string;
}

interface CharacterImageUploaderProps {
  value: CharacterImage | null;
  onChange: (character: CharacterImage | null) => void;
  disabled?: boolean;
}

export function CharacterImageUploader({
  value,
  onChange,
  disabled = false,
}: CharacterImageUploaderProps) {
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
        🎭 교체할 캐릭터 이미지 <span className="text-red-400">*</span>
      </label>

      {/* 업로드된 이미지 */}
      {value && (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
          <div className="relative aspect-square">
            <Image
              src={value.preview}
              alt="Character"
              fill
              className="object-contain"
              unoptimized
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
              {formatFileSize(value.file.size)}
            </p>
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
          <User className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-base font-medium mb-2">
            캐릭터 이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-gray-400 mb-1">
            스프라이트에 적용할 캐릭터 이미지
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

      {/* 도움말 */}
      {!value && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
          <p className="mb-1">💡 <strong>팁:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>배경이 투명한 PNG 파일을 권장합니다</li>
            <li>캐릭터가 명확하게 보이는 이미지를 선택하세요</li>
            <li>정면 또는 측면 이미지가 좋은 결과를 낼 수 있습니다</li>
          </ul>
        </div>
      )}
    </div>
  );
}
