/**
 * 오디오 라이브러리 페이지
 */

'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/stores/audio-store';

export default function LibraryPage() {
  const {
    assets,
    selectedAsset,
    isLoadingLibrary,
    fetchLibrary,
    setSelectedAsset,
    deleteAsset,
  } = useAudioStore();

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteAsset(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">오디오 라이브러리</h1>

        {isLoadingLibrary && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        )}

        {!isLoadingLibrary && assets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">생성된 오디오가 없습니다.</p>
            <a
              href="/audio/create"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              새로 생성하기
            </a>
          </div>
        )}

        {!isLoadingLibrary && assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold mb-2 truncate">{asset.prompt}</h3>

                <div className="text-sm text-gray-600 mb-4">
                  {asset.genre && (
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                      {asset.genre}
                    </span>
                  )}
                  {asset.mood && (
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2 mb-2">
                      {asset.mood}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>BPM: {asset.bpm}</p>
                  <p>Duration: {asset.duration}s</p>
                  <p>Format: {asset.fileFormat.toUpperCase()}</p>
                </div>

                {asset.tags.length > 0 && (
                  <div className="mb-4">
                    {asset.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAsset(asset)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    재생
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="px-4 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 오디오 플레이어 모달 */}
        {selectedAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">{selectedAsset.prompt}</h2>

              <audio controls className="w-full mb-4" src={selectedAsset.fileUrl}>
                Your browser does not support the audio element.
              </audio>

              <div className="text-sm text-gray-600 mb-4">
                <p>BPM: {selectedAsset.bpm}</p>
                <p>Duration: {selectedAsset.duration}s</p>
                <p>Instruments: {selectedAsset.instruments.join(', ')}</p>
              </div>

              <div className="flex gap-2">
                <a
                  href={selectedAsset.fileUrl}
                  download
                  className="flex-1 bg-green-600 text-white py-2 rounded text-center hover:bg-green-700"
                >
                  다운로드
                </a>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
