'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Download,
  Trash2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  getAllImages,
  deleteImage,
  getStorageSize,
} from '@/lib/storage/indexed-db';
import GalleryFiltersComponent from '@/components/art/GalleryFilters';
import {
  searchAndFilterImages,
  getFilterOptions,
  filtersToQueryParams,
  queryParamsToFilters,
  type GalleryFilters,
  type SortOption,
} from '@/lib/utils/gallery-search';

interface StoredImage {
  id: string;
  data: string; // base64
  metadata: {
    id: string;
    style: string;
    prompt: string;
    width: number;
    height: number;
    aspectRatio: string;
    seed?: number;
    createdAt: string;
  };
  createdAt: Date;
}

const ITEMS_PER_PAGE = 20;

export default function ArtGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // All images from IndexedDB
  const [allImages, setAllImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{
    audioCount: number;
    imageCount: number;
    estimatedSize: number;
  } | null>(null);

  // Filter and sort states
  const [filters, setFilters] = useState<GalleryFilters>(() =>
    queryParamsToFilters(searchParams)
  );
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sortParam = searchParams.get('sort');
    return (sortParam as SortOption) || 'date-desc';
  });

  // Filtered and paginated results
  const [displayedImages, setDisplayedImages] = useState<StoredImage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  // UI state
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);

  // Load all images from IndexedDB on mount
  useEffect(() => {
    loadImageGallery();
    loadStorageInfo();
  }, []);

  const loadImageGallery = async () => {
    try {
      setIsLoading(true);
      const images = await getAllImages();
      setAllImages(images);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load image gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageSize();
      setStorageInfo(info);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load storage info:', error);
    }
  };

  // Apply filters and update displayed images
  useEffect(() => {
    if (allImages.length === 0) {
      setDisplayedImages([]);
      setTotalFilteredCount(0);
      setHasMore(false);
      return;
    }

    // Reset pagination when filters change
    setCurrentPage(0);

    const {
      results,
      total,
      hasMore: more,
    } = searchAndFilterImages(allImages, {
      filters,
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset: 0,
    });

    setDisplayedImages(results);
    setTotalFilteredCount(total);
    setHasMore(more);
  }, [allImages, filters, sortBy]);

  // Load more images (infinite scroll)
  const loadMore = useCallback(() => {
    if (!hasMore) return;

    const nextPage = currentPage + 1;
    const { results } = searchAndFilterImages(allImages, {
      filters,
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset: nextPage * ITEMS_PER_PAGE,
    });

    setDisplayedImages((prev) => [...prev, ...results]);
    setCurrentPage(nextPage);

    // Check if there are more items
    const nextOffset = (nextPage + 1) * ITEMS_PER_PAGE;
    const { hasMore: more } = searchAndFilterImages(allImages, {
      filters,
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset: nextOffset,
    });
    setHasMore(more);
  }, [allImages, filters, sortBy, currentPage, hasMore]);

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    }, options);

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Update URL when filters change
  useEffect(() => {
    const params = filtersToQueryParams(filters);
    if (sortBy !== 'date-desc') {
      params.set('sort', sortBy);
    }

    const newUrl = params.toString()
      ? `/apps/art-generator/gallery?${params.toString()}`
      : '/apps/art-generator/gallery';

    router.replace(newUrl, { scroll: false });
  }, [filters, sortBy, router]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: GalleryFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handleDownload = (
    image: StoredImage,
    format: 'png' | 'jpg' = 'png'
  ) => {
    // Base64를 Blob으로 변환
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const byteCharacters = atob(image.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `art-${image.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return;

    try {
      await deleteImage(id);
      setAllImages((prev) => prev.filter((img) => img.id !== id));

      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }

      // 저장소 정보 업데이트
      loadStorageInfo();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete image:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };

  // Get filter options from all images
  const filterOptions = getFilterOptions(allImages);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageDataUrl = (image: StoredImage) => {
    return `data:image/png;base64,${image.data}`;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/apps/art-generator"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">아트 갤러리</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                생성된 이미지를 탐색하고 관리하세요
              </p>
            </div>
          </div>

          {storageInfo && (
            <div className="app-card p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>이미지: {storageInfo.imageCount}개</div>
                <div>저장소: {formatFileSize(storageInfo.estimatedSize)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        {!isLoading && allImages.length > 0 && (
          <GalleryFiltersComponent
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            filterOptions={filterOptions}
            resultCount={totalFilteredCount}
            totalCount={allImages.length}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                갤러리 로딩 중...
              </p>
            </div>
          </div>
        )}

        {/* Empty State - No images at all */}
        {!isLoading && allImages.length === 0 && (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">
              저장된 이미지가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              이미지를 생성하면 여기에 자동으로 저장됩니다
            </p>
            <Link
              href="/apps/art-generator/create"
              className="app-button inline-flex items-center gap-2"
            >
              <ImageIcon className="w-5 h-5" />
              이미지 생성하기
            </Link>
          </div>
        )}

        {/* Empty State - No results after filtering */}
        {!isLoading && allImages.length > 0 && displayedImages.length === 0 && (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              다른 필터 조건을 시도해보세요
            </p>
          </div>
        )}

        {/* Image Grid */}
        {!isLoading && displayedImages.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {displayedImages.map((image) => (
                <div
                  key={image.id}
                  className="app-card group overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => setSelectedImage(image)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={getImageDataUrl(image)}
                      alt={image.metadata.prompt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {image.metadata.style}
                      </span>
                      <span className="text-xs text-gray-500">
                        {image.metadata.width}×{image.metadata.height}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 mb-2">
                      {image.metadata.prompt}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(image.createdAt)}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-3 border-t dark:border-gray-700 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image, 'png');
                      }}
                      className="flex-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      title="PNG 다운로드"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs">PNG</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    더 불러오는 중...
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Image Detail Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8">
                  <div className="relative w-full h-full max-h-[70vh]">
                    <Image
                      src={getImageDataUrl(selectedImage)}
                      alt={selectedImage.metadata.prompt}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="w-full md:w-96 p-6 overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">이미지 상세정보</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        프롬프트
                      </label>
                      <p className="mt-1">{selectedImage.metadata.prompt}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          스타일
                        </label>
                        <p className="mt-1">{selectedImage.metadata.style}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          해상도
                        </label>
                        <p className="mt-1">
                          {selectedImage.metadata.width}×
                          {selectedImage.metadata.height}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          비율
                        </label>
                        <p className="mt-1">
                          {selectedImage.metadata.aspectRatio}
                        </p>
                      </div>
                      {selectedImage.metadata.seed && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            시드
                          </label>
                          <p className="mt-1">{selectedImage.metadata.seed}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        생성일시
                      </label>
                      <p className="mt-1">
                        {formatDate(selectedImage.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => handleDownload(selectedImage, 'png')}
                      className="w-full app-button flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      PNG 다운로드
                    </button>
                    <button
                      onClick={() => handleDownload(selectedImage, 'jpg')}
                      className="w-full app-button-secondary flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      JPG 다운로드
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedImage.id);
                        setSelectedImage(null);
                      }}
                      className="w-full p-3 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      삭제
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
