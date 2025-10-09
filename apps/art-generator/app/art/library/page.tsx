'use client';

import { useEffect, useState } from 'react';
import { useImageStore } from '../../../stores/image-store';
import {
  ART_STYLES,
  ART_TYPES,
  MOODS,
  type ImageAsset,
  type LibraryQuery
} from '../../../lib/schemas/image';

export default function LibraryPage() {
  const { filteredLibrary, loadLibrary, deleteFromLibrary, filterLibrary } = useImageStore();

  const [selectedAsset, setSelectedAsset] = useState<ImageAsset | null>(null);
  const [filters, setFilters] = useState<LibraryQuery>({
    style: undefined,
    artType: undefined,
    mood: undefined,
  });

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const handleFilter = () => {
    filterLibrary(filters);
  };

  const handleReset = () => {
    setFilters({ style: undefined, artType: undefined, mood: undefined });
    loadLibrary();
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 이미지를 삭제하시겠습니까?')) {
      await deleteFromLibrary(id);
      setSelectedAsset(null);
    }
  };

  const handleDownload = (asset: ImageAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageData;
    link.download = `art-${asset.id}.${asset.format}`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          아트 라이브러리
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">스타일</label>
              <select
                value={filters.style || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, style: value ? (value as typeof filters.style) : undefined });
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {ART_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">아트 타입</label>
              <select
                value={filters.artType || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, artType: value ? (value as typeof filters.artType) : undefined });
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {ART_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">무드</label>
              <select
                value={filters.mood || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, mood: value ? (value as typeof filters.mood) : undefined });
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                필터 적용
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {filteredLibrary.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-400">
            <p className="text-xl mb-4">라이브러리가 비어있습니다</p>
            <p>이미지를 생성하고 저장해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLibrary.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={asset.imageData}
                    alt={asset.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{asset.prompt}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {asset.tags.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{asset.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {asset.width} × {asset.height} • {asset.format.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedAsset && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedAsset(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">이미지 상세</h2>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <img
                    src={selectedAsset.imageData}
                    alt={selectedAsset.prompt}
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">프롬프트</h3>
                    <p className="text-gray-600">{selectedAsset.prompt}</p>
                  </div>

                  {selectedAsset.style && (
                    <div>
                      <h3 className="font-semibold mb-1">스타일</h3>
                      <p className="text-gray-600">{selectedAsset.style}</p>
                    </div>
                  )}

                  {selectedAsset.artType && (
                    <div>
                      <h3 className="font-semibold mb-1">아트 타입</h3>
                      <p className="text-gray-600">{selectedAsset.artType}</p>
                    </div>
                  )}

                  {selectedAsset.mood && (
                    <div>
                      <h3 className="font-semibold mb-1">무드</h3>
                      <p className="text-gray-600">{selectedAsset.mood}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-1">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">해상도: </span>
                      {selectedAsset.width} × {selectedAsset.height}
                    </div>
                    <div>
                      <span className="font-semibold">포맷: </span>
                      {selectedAsset.format.toUpperCase()}
                    </div>
                    {selectedAsset.tokenCost && (
                      <div>
                        <span className="font-semibold">토큰 비용: </span>
                        {selectedAsset.tokenCost}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">생성 일시: </span>
                      {new Date(selectedAsset.createdAt).toLocaleString('ko-KR')}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleDownload(selectedAsset)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      다운로드
                    </button>
                    <button
                      onClick={() => handleDelete(selectedAsset.id)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
