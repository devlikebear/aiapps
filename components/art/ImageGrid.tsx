'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useArtStore } from '@/lib/stores/art-store';
import { downloadImage } from '@/lib/art/utils';
import type { ImageFormat } from '@/lib/art/types';

interface ImageGridProps {
  showActions?: boolean;
}

export default function ImageGrid({ showActions = true }: ImageGridProps) {
  const { generatedImages, removeImage } = useArtStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = (
    blobUrl: string,
    id: string,
    format: ImageFormat = 'png'
  ) => {
    const filename = `art-${id}.${format}`;
    downloadImage(blobUrl, filename);
  };

  if (generatedImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">생성된 이미지</h2>
          <div className="text-sm text-gray-400">
            {generatedImages.length}개의 이미지
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedImages.map((image) => (
            <div key={image.id} className="app-card group">
              <div
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(image.id)}
              >
                <Image
                  src={image.blobUrl}
                  alt={image.metadata.prompt}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">클릭하여 확대</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {image.metadata.prompt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{image.metadata.style}</span>
                    <span>•</span>
                    <span>
                      {image.metadata.width}x{image.metadata.height}
                    </span>
                    <span>•</span>
                    <span>{image.metadata.quality}</span>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDownload(image.blobUrl, image.id, 'png')
                      }
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
                    >
                      PNG 다운로드
                    </button>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-sm text-red-300 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}

                {image.metadata.seed && (
                  <div className="text-xs text-gray-500">
                    시드: {image.metadata.seed}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              닫기
            </button>
            {generatedImages
              .filter((img) => img.id === selectedImage)
              .map((image) => (
                <div key={image.id} className="space-y-4">
                  <div
                    className="relative w-full"
                    style={{
                      aspectRatio: `${image.metadata.width}/${image.metadata.height}`,
                    }}
                  >
                    <Image
                      src={image.blobUrl}
                      alt={image.metadata.prompt}
                      fill
                      className="object-contain rounded-lg"
                      unoptimized
                    />
                  </div>
                  <div className="app-card">
                    <h3 className="font-bold text-white mb-2">프롬프트</h3>
                    <p className="text-gray-300">{image.metadata.prompt}</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">스타일</div>
                        <div className="text-white">{image.metadata.style}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">해상도</div>
                        <div className="text-white">
                          {image.metadata.width}x{image.metadata.height}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">품질</div>
                        <div className="text-white">
                          {image.metadata.quality}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">크기</div>
                        <div className="text-white">
                          {(image.metadata.fileSize / 1024 / 1024).toFixed(2)}{' '}
                          MB
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
