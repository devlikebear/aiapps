/**
 * Google Drive Media List Component
 * Google Drive에 저장된 오디오/이미지 목록 표시
 */

'use client';

import { useEffect, useState } from 'react';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import {
  useGoogleDriveList,
  useGoogleDriveDelete,
} from '@/lib/google-drive/hooks';
import { Download, Trash2, AlertCircle } from 'lucide-react';
import type { GoogleDriveFile } from '@/lib/google-drive/client';

export interface GoogleDriveMediaListProps {
  type: 'audio' | 'image';
  className?: string;
}

/**
 * Google Drive 미디어 목록 컴포넌트
 */
export function GoogleDriveMediaList({
  type,
  className,
}: GoogleDriveMediaListProps) {
  const { isAuthenticated, audioFiles, imageFiles, isLoading, error } =
    useGoogleDriveStore();
  const { loadAudioFiles, loadImageFiles } = useGoogleDriveList();
  const deleteFile = useGoogleDriveDelete();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // 파일 목록 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    if (type === 'audio') {
      loadAudioFiles();
    } else {
      loadImageFiles();
    }
  }, [isAuthenticated, type, loadAudioFiles, loadImageFiles]);

  if (!isAuthenticated) {
    return (
      <div className={`text-center py-8 text-gray-400 ${className || ''}`}>
        Google Drive에 로그인해 주세요
      </div>
    );
  }

  const files = type === 'audio' ? audioFiles : imageFiles;
  const mediaType = type === 'audio' ? '오디오' : '이미지';

  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className || ''}`}>
        <div className="inline-flex items-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border border-gray-600 border-t-blue-500" />
          {mediaType} 로드 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-sm text-red-400 bg-red-900/20 p-3 rounded ${className || ''}`}
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className || ''}`}>
        저장된 {mediaType}이 없습니다
      </div>
    );
  }

  const handleDelete = async (fileId: string) => {
    if (!window.confirm(`정말 삭제하시겠습니까?`)) return;

    setIsDeleting(fileId);
    const success = await deleteFile(fileId, type);

    if (success) {
      setIsDeleting(null);
    } else {
      setIsDeleting(null);
    }
  };

  const handleDownload = (file: GoogleDriveFile) => {
    // Google Drive에서 직접 다운로드
    const url = `https://drive.google.com/uc?export=download&id=${file.id}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <h3 className="text-sm font-medium text-gray-300">
        저장된 {mediaType} ({files.length})
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{Math.round(Number(file.size) / 1024)} KB</span>
                <span>•</span>
                <span>
                  {new Date(file.createdTime).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => handleDownload(file)}
                disabled={isDeleting === file.id}
                className="p-1.5 text-gray-400 hover:text-blue-400 disabled:opacity-50 transition-colors"
                title="다운로드"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                disabled={isDeleting === file.id}
                className="p-1.5 text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors"
                title="삭제"
              >
                {isDeleting === file.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border border-gray-600 border-t-red-500" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
