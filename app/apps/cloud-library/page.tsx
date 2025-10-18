'use client';

import { useEffect, useState } from 'react';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import {
  useGoogleDriveList,
  useGoogleDriveDelete,
} from '@/lib/google-drive/hooks';
import {
  Download,
  Trash2,
  AlertCircle,
  Music,
  Image as ImageIcon,
  Sparkles,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { GoogleDriveLogin } from '@/components/cloud/GoogleDriveLoginButton';
import type { GoogleDriveFile } from '@/lib/google-drive/client';

interface EnhancedFile extends GoogleDriveFile {
  type: 'audio' | 'image' | 'tweet';
  properties?: Record<string, string>;
}

type SortKey = 'name' | 'createdTime' | 'size';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'audio' | 'image' | 'tweet';

/**
 * Cloud Library 페이지
 * Google Drive에 저장된 모든 미디어 (오디오 + 이미지 + 트윗) 통합 보기
 */
export default function CloudLibraryPage() {
  const {
    isAuthenticated,
    audioFiles,
    imageFiles,
    tweetFiles,
    isLoading,
    error,
  } = useGoogleDriveStore();
  const { loadAudioFiles, loadImageFiles, loadTweetFiles } =
    useGoogleDriveList();
  const deleteFile = useGoogleDriveDelete();

  // UI 상태
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 파일 목록 로드
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAudioFiles();
    loadImageFiles();
    loadTweetFiles();
  }, [isAuthenticated, loadAudioFiles, loadImageFiles, loadTweetFiles]);

  // 통합 파일 목록
  const allFiles: EnhancedFile[] = [
    ...audioFiles.map((f) => ({ ...f, type: 'audio' as const })),
    ...imageFiles.map((f) => ({ ...f, type: 'image' as const })),
    ...tweetFiles.map((f) => ({ ...f, type: 'tweet' as const })),
  ];

  // 필터링
  const filteredFiles = allFiles.filter((file) => {
    // 타입 필터
    if (filterType !== 'all' && file.type !== filterType) return false;

    // 검색 필터 (이름 + 메타데이터)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name = file.name.toLowerCase();

      // 파일명에서 검색
      if (name.includes(term)) return true;

      // 메타데이터에서 검색 (프롬프트 등)
      if (file.properties) {
        const propertiesStr = Object.values(file.properties)
          .join(' ')
          .toLowerCase();
        if (propertiesStr.includes(term)) return true;
      }

      return false;
    }

    return true;
  });

  // 정렬
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortKey) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdTime':
        aValue = new Date(a.createdTime).getTime();
        bValue = new Date(b.createdTime).getTime();
        break;
      case 'size':
        aValue = Number(a.size);
        bValue = Number(b.size);
        break;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 핸들러
  const handleDelete = async (fileId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(fileId);
    const file = allFiles.find((f) => f.id === fileId);
    if (file) {
      const success = await deleteFile(fileId, file.type);
      if (!success) {
        // 에러는 스토어에서 처리됨
      }
    }
    setIsDeleting(null);
  };

  const handleDownload = (file: EnhancedFile) => {
    const url = `https://drive.google.com/uc?export=download&id=${file.id}`;
    window.open(url, '_blank');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              ☁️ Cloud Library
            </h1>
            <p className="text-gray-400">
              Google Drive에 저장된 모든 생성된 미디어를 관리하세요
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <div className="mb-6">
              <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-300 mb-2">
                Google Drive 연결 필요
              </h2>
              <p className="text-gray-400 mb-6">
                Google Drive에 저장된 미디어를 보려면 먼저 로그인해주세요.
              </p>
            </div>
            <GoogleDriveLogin />
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">
            ☁️ Cloud Library
          </h1>

          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border border-gray-600 border-t-blue-500" />
                <span className="text-gray-400">미디어 로드 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">
            ☁️ Cloud Library
          </h1>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-red-400 mb-1">
                  미디어 로드 실패
                </h2>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (allFiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">
            ☁️ Cloud Library
          </h1>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <div className="mb-4">
              <Music
                size={48}
                className="mx-auto text-gray-500 mb-4 opacity-50"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              저장된 미디어가 없습니다
            </h2>
            <p className="text-gray-400 text-sm">
              오디오나 이미지를 생성한 후 Google Drive에 저장하면 여기에
              표시됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Statistics
  const audioCount = audioFiles.length;
  const imageCount = imageFiles.length;
  const tweetCount = tweetFiles.length;
  const totalSize = allFiles.reduce((acc, f) => acc + Number(f.size), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-100">
              ☁️ Cloud Library
            </h1>
            <GoogleDriveLogin />
          </div>
          <p className="text-gray-400">
            Google Drive에 저장된 모든 생성된 미디어를 관리하세요
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Music size={24} className="text-cyan-400" />
              <div>
                <p className="text-gray-400 text-sm">오디오</p>
                <p className="text-2xl font-bold text-gray-100">{audioCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ImageIcon size={24} className="text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">이미지</p>
                <p className="text-2xl font-bold text-gray-100">{imageCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-cyan-400" />
              <div>
                <p className="text-gray-400 text-sm">트윗</p>
                <p className="text-2xl font-bold text-gray-100">{tweetCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div>
              <p className="text-gray-400 text-sm">전체 크기</p>
              <p className="text-2xl font-bold text-gray-100">
                {(totalSize / (1024 * 1024)).toFixed(1)}
                <span className="text-base"> MB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="파일명이나 프롬프트로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Type */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <div className="flex gap-2 flex-wrap">
                {(['all', 'audio', 'image', 'tweet'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type === 'all'
                      ? '전체'
                      : type === 'audio'
                        ? '🎵 오디오'
                        : type === 'image'
                          ? '🖼️ 이미지'
                          : '✨ 트윗'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">정렬:</span>
            {(['name', 'createdTime', 'size'] as const).map((key) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  sortKey === key
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {key === 'name'
                  ? '파일명'
                  : key === 'createdTime'
                    ? '생성일'
                    : '크기'}
                {sortKey === key && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}

            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="ml-auto px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                초기화
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              결과 ({sortedFiles.length})
            </h2>
            {searchTerm && (
              <span className="text-sm text-gray-400">
                &quot;{searchTerm}&quot; 검색 결과
              </span>
            )}
          </div>

          {sortedFiles.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400">조건에 맞는 미디어가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors"
                >
                  {/* Main Row */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {file.type === 'audio' ? (
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Music size={20} className="text-cyan-400" />
                          </div>
                        ) : file.type === 'image' ? (
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <ImageIcon size={20} className="text-purple-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Sparkles size={20} className="text-cyan-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                          <span>
                            {(Number(file.size) / 1024).toFixed(1)} KB
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(file.createdTime).toLocaleDateString(
                              'ko-KR',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                          {file.properties?.prompt && (
                            <>
                              <span>•</span>
                              <span className="max-w-xs truncate">
                                &quot;{file.properties.prompt}&quot;
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={isDeleting === file.id}
                        className="p-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 transition-colors rounded-lg hover:bg-gray-700/50"
                        title="다운로드"
                      >
                        <Download size={18} />
                      </button>

                      <button
                        onClick={() =>
                          setExpandedId(expandedId === file.id ? null : file.id)
                        }
                        className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-700/50"
                        title="정보"
                      >
                        <span className="text-lg">
                          {expandedId === file.id ? '−' : '+'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={isDeleting === file.id}
                        className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors rounded-lg hover:bg-gray-700/50"
                        title="삭제"
                      >
                        {isDeleting === file.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border border-gray-600 border-t-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === file.id && file.properties && (
                    <div className="border-t border-gray-700 px-4 py-3 bg-gray-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {Object.entries(file.properties).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-gray-500 capitalize">
                              {key === 'prompt'
                                ? '프롬프트'
                                : key === 'genre'
                                  ? '장르'
                                  : key === 'style'
                                    ? '스타일'
                                    : key === 'bpm'
                                      ? 'BPM'
                                      : key === 'duration'
                                        ? '길이'
                                        : key === 'quality'
                                          ? '품질'
                                          : key === 'seed'
                                            ? '시드'
                                            : key === 'width'
                                              ? '너비'
                                              : key === 'height'
                                                ? '높이'
                                                : key}
                            </p>
                            <p className="text-gray-200 truncate">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
