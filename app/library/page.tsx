'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Music,
  ImageIcon,
  Play,
  Pause,
  Download,
  Trash2,
  Filter,
  Search,
  Calendar,
} from 'lucide-react';
import { getAllAudio, deleteAudio } from '@/lib/storage/indexed-db';
import { getAllImages, deleteImage } from '@/lib/storage/indexed-db';

// IndexedDB 타입 정의
interface StoredAudio {
  id: string;
  data: string;
  metadata: {
    prompt: string;
    genre?: string;
    type?: string;
    createdAt: string;
    [key: string]: unknown;
  };
  tags: string[];
  createdAt: Date;
  blobUrl?: string;
}

interface StoredImage {
  id: string;
  data: string;
  metadata: {
    prompt: string;
    style?: string;
    createdAt: string;
    [key: string]: unknown;
  };
  tags: string[];
  createdAt: Date;
  blobUrl?: string;
}

type MediaType = 'all' | 'audio' | 'image';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<MediaType>('all');
  const [audioList, setAudioList] = useState<StoredAudio[]>([]);
  const [imageList, setImageList] = useState<StoredImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Tag filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Audio player state
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);

  // Load media from IndexedDB
  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const [audio, images] = await Promise.all([
        getAllAudio(),
        getAllImages(),
      ]);

      // Base64 데이터를 Blob URL로 변환
      const audioWithBlobs = audio.map((item) => ({
        ...item,
        blobUrl: `data:audio/wav;base64,${item.data}`,
      }));

      const imagesWithBlobs = images.map((item) => ({
        ...item,
        blobUrl: `data:image/png;base64,${item.data}`,
      }));

      setAudioList(audioWithBlobs);
      setImageList(imagesWithBlobs);

      // 모든 태그 수집 (중복 제거)
      const allTags = new Set<string>();
      [...audioWithBlobs, ...imagesWithBlobs].forEach((item) => {
        item.tags?.forEach((tag) => allTags.add(tag));
      });
      setAvailableTags(Array.from(allTags).sort());
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio player controls
  const togglePlayAudio = (audioId: string, blobUrl: string) => {
    if (currentAudio === audioId && isPlaying) {
      audioElement?.pause();
      setIsPlaying(false);
    } else {
      if (audioElement) {
        audioElement.pause();
      }

      const audio = new Audio(blobUrl);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      setAudioElement(audio);
      setCurrentAudio(audioId);
      setIsPlaying(true);
    }
  };

  const handleDownloadAudio = (audio: StoredAudio) => {
    if (!audio.blobUrl) return;
    const link = document.createElement('a');
    link.href = audio.blobUrl;
    link.download = `${audio.metadata.prompt.slice(0, 30)}_${audio.id}.wav`;
    link.click();
  };

  const handleDeleteAudio = async (id: string) => {
    if (confirm('이 오디오를 삭제하시겠습니까?')) {
      await deleteAudio(id);
      setAudioList((prev) => prev.filter((a) => a.id !== id));
      if (currentAudio === id) {
        audioElement?.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    }
  };

  const handleDownloadImage = (
    image: StoredImage,
    format: 'png' | 'jpg' = 'png'
  ) => {
    if (!image.blobUrl) return;
    const link = document.createElement('a');
    link.href = image.blobUrl;
    link.download = `${image.metadata.prompt.slice(0, 30)}_${image.id}.${format}`;
    link.click();
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('이 이미지를 삭제하시겠습니까?')) {
      await deleteImage(id);
      setImageList((prev) => prev.filter((img) => img.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Filter media based on search query and tags
  const filteredAudio = audioList.filter((audio) => {
    const matchesSearch = audio.metadata.prompt
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => audio.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const filteredImages = imageList.filter((image) => {
    const matchesSearch = image.metadata.prompt
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => image.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  // Stats
  const totalAudio = audioList.length;
  const totalImages = imageList.length;
  const totalStorage =
    audioList.reduce((sum, a) => sum + (a.data?.length || 0), 0) +
    imageList.reduce((sum, img) => sum + (img.data?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            미디어 라이브러리
          </h1>
          <p className="text-gray-400">
            생성된 오디오와 이미지를 탐색하고 관리하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {totalAudio}
                </div>
                <div className="text-sm text-gray-400">오디오</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-pink-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {totalImages}
                </div>
                <div className="text-sm text-gray-400">이미지</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Download className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {(totalStorage / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="text-sm text-gray-400">총 용량</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                전체 ({totalAudio + totalImages})
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'audio'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Music className="w-4 h-4" />
                오디오 ({totalAudio})
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'image'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                이미지 ({totalImages})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="프롬프트로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-400" />
                <h3 className="font-medium text-white">태그 필터</h3>
                {selectedTags.length > 0 && (
                  <span className="text-sm text-gray-400">
                    ({selectedTags.length}개 선택됨)
                  </span>
                )}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearTagFilters}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  모두 지우기
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">미디어를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Audio Section */}
            {(activeTab === 'all' || activeTab === 'audio') &&
              filteredAudio.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                    <Music className="w-6 h-6 text-blue-400" />
                    오디오 ({filteredAudio.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAudio.map((audio) => (
                      <div
                        key={audio.id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-all"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <button
                            onClick={() =>
                              audio.blobUrl &&
                              togglePlayAudio(audio.id, audio.blobUrl)
                            }
                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                              currentAudio === audio.id && isPlaying
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-600/20 hover:bg-blue-600/30'
                            }`}
                            disabled={!audio.blobUrl}
                          >
                            {currentAudio === audio.id && isPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-blue-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1 truncate">
                              {audio.metadata.prompt}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                audio.metadata.createdAt
                              ).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                          <button
                            onClick={() => handleDownloadAudio(audio)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-gray-300 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            다운로드
                          </button>

                          <button
                            onClick={() => handleDeleteAudio(audio.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-xs font-medium text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Images Section */}
            {(activeTab === 'all' || activeTab === 'image') &&
              filteredImages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                    <ImageIcon className="w-6 h-6 text-pink-400" />
                    이미지 ({filteredImages.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <div
                        key={image.id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-pink-500 transition-all group"
                      >
                        <div
                          className="relative aspect-square cursor-pointer"
                          onClick={() => setSelectedImage(image)}
                        >
                          {image.blobUrl && (
                            <Image
                              src={image.blobUrl}
                              alt={image.metadata.prompt}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Search className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="p-3">
                          <h3 className="font-medium text-white text-sm mb-2 truncate">
                            {image.metadata.prompt}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              image.metadata.createdAt
                            ).toLocaleDateString('ko-KR')}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadImage(image, 'png')}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-gray-300 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              PNG
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="px-2 py-1.5 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-xs transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Empty State */}
            {((activeTab === 'all' &&
              filteredAudio.length === 0 &&
              filteredImages.length === 0) ||
              (activeTab === 'audio' && filteredAudio.length === 0) ||
              (activeTab === 'image' && filteredImages.length === 0)) && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-gray-500 mb-4">
                  {activeTab === 'audio' ? (
                    <Music className="w-16 h-16" />
                  ) : activeTab === 'image' ? (
                    <ImageIcon className="w-16 h-16" />
                  ) : (
                    <Filter className="w-16 h-16" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '미디어가 없습니다'}
                </h3>
                <p className="text-gray-500 text-center">
                  {searchQuery
                    ? '다른 검색어를 시도해보세요'
                    : activeTab === 'audio'
                      ? '오디오 생성기에서 새로운 음악을 만들어보세요'
                      : activeTab === 'image'
                        ? '아트 생성기에서 이미지를 생성해보세요'
                        : '생성기를 사용하여 새로운 미디어를 만들어보세요'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square">
              {selectedImage.blobUrl && (
                <Image
                  src={selectedImage.blobUrl}
                  alt={selectedImage.metadata.prompt}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedImage.metadata.prompt}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">생성 시간</div>
                  <div className="text-white">
                    {new Date(selectedImage.metadata.createdAt).toLocaleString(
                      'ko-KR'
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">스타일</div>
                  <div className="text-white">
                    {selectedImage.metadata.style || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadImage(selectedImage, 'png')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  PNG 다운로드
                </button>
                <button
                  onClick={() => handleDownloadImage(selectedImage, 'jpg')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  JPG 다운로드
                </button>
                <button
                  onClick={() => {
                    handleDeleteImage(selectedImage.id);
                    setSelectedImage(null);
                  }}
                  className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
