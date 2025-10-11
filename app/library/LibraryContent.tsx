'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Edit,
  X,
  CheckSquare,
  Square,
  Layers,
  Wand2,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileArchive,
  Loader2,
} from 'lucide-react';
import { getAllAudio, deleteAudio } from '@/lib/storage/indexed-db';
import { getAllImages, deleteImage } from '@/lib/storage/indexed-db';
import ImageEditor from '@/components/art/ImageEditor';
import ImageComposer from '@/components/art/ImageComposer';
import StyleTransfer from '@/components/art/StyleTransfer';
import type { StoredImage, StoredAudio } from '@/lib/types/storage';
import {
  exportAndDownloadGallery,
  type ExportProgressCallback,
} from '@/lib/utils/gallery-export';
import {
  importGalleryFromZip,
  previewZipContents,
  type ImportProgressCallback,
  type DuplicateStrategy,
} from '@/lib/utils/gallery-import';

type MediaType = 'all' | 'audio' | 'image';

// Audio with blobUrl extension
interface AudioWithBlob extends StoredAudio {
  blobUrl: string;
}

// Image with blobUrl extension
interface ImageWithBlob extends StoredImage {
  blobUrl: string;
}

export default function LibraryContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get('tab') as MediaType | null;

  const [activeTab, setActiveTab] = useState<MediaType>(urlTab || 'all');
  const [audioList, setAudioList] = useState<AudioWithBlob[]>([]);
  const [imageList, setImageList] = useState<ImageWithBlob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Tag filter state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Advanced filter state
  const [availableStyles, setAvailableStyles] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>(
    'newest'
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Audio player state
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<ImageWithBlob | null>(
    null
  );

  // Image editor state
  const [editingImage, setEditingImage] = useState<ImageWithBlob | null>(null);

  // Style transfer state
  const [styleTransferImage, setStyleTransferImage] =
    useState<ImageWithBlob | null>(null);

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  // Image composer state
  const [showComposer, setShowComposer] = useState(false);

  // Export/Import state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] =
    useState<DuplicateStrategy>('skip');

  // Update tab from URL
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

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
      const allStyles = new Set<string>();

      [...audioWithBlobs, ...imagesWithBlobs].forEach((item) => {
        item.tags?.forEach((tag) => allTags.add(tag));
      });

      // 이미지 스타일 수집
      imagesWithBlobs.forEach((item) => {
        if (item.metadata.style) {
          allStyles.add(item.metadata.style);
        }
      });

      setAvailableTags(Array.from(allTags).sort());
      setAvailableStyles(Array.from(allStyles).sort());
    } catch (error) {
      // eslint-disable-next-line no-console
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
    image: ImageWithBlob,
    format: 'png' | 'jpg' = 'png'
  ) => {
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

  // Multi-select handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedImageIds([]);
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const handleOpenComposer = () => {
    if (selectedImageIds.length < 2) {
      alert('이미지를 2개 이상 선택해주세요');
      return;
    }
    setShowComposer(true);
  };

  const handleComposerClose = () => {
    setShowComposer(false);
    setSelectionMode(false);
    setSelectedImageIds([]);
  };

  const handleComposerSave = () => {
    loadMedia();
    handleComposerClose();
  };

  // Export/Import handlers
  const handleExportGallery = async () => {
    if (selectedImageIds.length === 0) {
      alert('내보낼 이미지를 선택해주세요');
      return;
    }

    const selectedImages = imageList.filter((img) =>
      selectedImageIds.includes(img.id)
    );

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('');

    try {
      const onProgress: ExportProgressCallback = (progress) => {
        setExportProgress(progress.percentage);
        setExportStatus(progress.status);
      };

      await exportAndDownloadGallery(selectedImages, onProgress);

      // Reset selection after export
      setSelectionMode(false);
      setSelectedImageIds([]);
      alert(`${selectedImages.length}개 이미지를 성공적으로 내보냈습니다.`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', error);
      alert('내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportStatus('');
    }
  };

  const handleImportFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Preview ZIP contents
      const { manifest } = await previewZipContents(file);
      setImportFile(file);
      setShowImportModal(true);

      // Show preview info
      // eslint-disable-next-line no-console
      console.log(
        `ZIP 파일: ${manifest.totalImages}개 이미지, 내보낸 날짜: ${new Date(manifest.exportDate).toLocaleDateString('ko-KR')}`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Invalid ZIP file:', error);
      alert('유효하지 않은 갤러리 ZIP 파일입니다.');
    }

    // Reset input
    event.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('');
    setShowImportModal(false);

    try {
      const onProgress: ImportProgressCallback = (progress) => {
        setImportProgress(progress.percentage);
        setImportStatus(progress.status);
      };

      const result = await importGalleryFromZip(
        importFile,
        duplicateStrategy,
        onProgress
      );

      // Reload gallery
      await loadMedia();

      // Show result
      alert(
        `가져오기 완료:\n- 총 ${result.total}개\n- 가져옴: ${result.imported}개\n- 건너뜀: ${result.skipped}개\n- 오류: ${result.errors}개`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Import failed:', error);
      alert('가져오기에 실패했습니다.');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      setImportFile(null);
    }
  };

  const handleImportCancel = () => {
    setShowImportModal(false);
    setImportFile(null);
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
    setCurrentPage(1);
  };

  // Toggle style selection
  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedStyles([]);
    setDateRange({ start: null, end: null });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter and sort media
  const filterAndSortMedia = <T extends AudioWithBlob | ImageWithBlob>(
    items: T[]
  ): T[] => {
    const filtered = items.filter((item) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        item.metadata.prompt.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => item.tags?.includes(tag));

      // Style filter (images only)
      const matchesStyle =
        selectedStyles.length === 0 ||
        ('style' in item.metadata &&
          selectedStyles.includes(item.metadata.style || ''));

      // Date range filter
      const itemDate = new Date(item.metadata.createdAt);
      const matchesDateRange =
        (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
        (!dateRange.end || itemDate <= new Date(dateRange.end));

      return matchesSearch && matchesTags && matchesStyle && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.metadata.createdAt).getTime() -
            new Date(a.metadata.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.metadata.createdAt).getTime() -
            new Date(b.metadata.createdAt).getTime()
          );
        case 'name':
          return a.metadata.prompt.localeCompare(b.metadata.prompt);
        case 'size':
          return (b.data?.length || 0) - (a.data?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredAudio = filterAndSortMedia(audioList);
  const filteredImages = filterAndSortMedia(imageList);

  // Paginate images
  const totalImagePages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {/* Sort & Advanced Filters */}
        {(filteredImages.length > 0 || filteredAudio.length > 0) && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <label className="text-sm text-gray-400">정렬:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(
                      e.target.value as 'newest' | 'oldest' | 'name' | 'size'
                    );
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="name">이름순</option>
                  <option value="size">크기순</option>
                </select>
              </div>

              {/* Style Filters (Images Only) */}
              {activeTab !== 'audio' && availableStyles.length > 0 && (
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <label className="text-sm text-gray-400">스타일:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedStyles.includes(style)
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear All Filters */}
              {(selectedTags.length > 0 ||
                selectedStyles.length > 0 ||
                dateRange.start ||
                dateRange.end ||
                searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  모든 필터 초기화
                </button>
              )}
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
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                      <ImageIcon className="w-6 h-6 text-pink-400" />
                      이미지 ({filteredImages.length})
                    </h2>
                    <div className="flex items-center gap-2">
                      {/* Import Button */}
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
                        <Upload className="w-5 h-5" />
                        가져오기
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleImportFileSelect}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </label>

                      {/* Export Button (shown in selection mode) */}
                      {selectionMode && selectedImageIds.length > 0 && (
                        <button
                          onClick={handleExportGallery}
                          disabled={isExporting}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <FileArchive className="w-5 h-5" />
                          내보내기 ({selectedImageIds.length})
                        </button>
                      )}

                      {/* Selection Mode Toggle */}
                      <button
                        onClick={toggleSelectionMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectionMode
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {selectionMode ? (
                          <>
                            <CheckSquare className="w-5 h-5" />
                            선택 완료
                          </>
                        ) : (
                          <>
                            <Square className="w-5 h-5" />
                            이미지 선택
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedImages.map((image) => (
                      <div
                        key={image.id}
                        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border transition-all group ${
                          selectionMode && selectedImageIds.includes(image.id)
                            ? 'border-purple-500 ring-2 ring-purple-500'
                            : 'border-gray-700 hover:border-pink-500'
                        }`}
                      >
                        <div
                          className="relative aspect-square cursor-pointer"
                          onClick={() =>
                            selectionMode
                              ? toggleImageSelection(image.id)
                              : setSelectedImage(image)
                          }
                        >
                          {image.blobUrl && (
                            <Image
                              src={image.blobUrl}
                              alt={image.metadata.prompt}
                              fill
                              className="object-cover"
                            />
                          )}
                          {selectionMode && (
                            <div className="absolute top-2 right-2 z-10">
                              {selectedImageIds.includes(image.id) ? (
                                <CheckSquare className="w-8 h-8 text-purple-400 bg-gray-900/80 rounded p-1" />
                              ) : (
                                <Square className="w-8 h-8 text-gray-400 bg-gray-900/80 rounded p-1" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {selectionMode ? (
                                selectedImageIds.includes(image.id) ? (
                                  <CheckSquare className="w-8 h-8 text-purple-400" />
                                ) : (
                                  <Square className="w-8 h-8 text-white" />
                                )
                              ) : (
                                <Search className="w-8 h-8 text-white" />
                              )}
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

                          {!selectionMode && (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingImage(image);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <Edit className="w-3 h-3" />
                                  편집
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStyleTransferImage(image);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <Wand2 className="w-3 h-3" />
                                  스타일
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleDownloadImage(image, 'png')
                                  }
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
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {filteredImages.length > itemsPerPage && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Items Per Page */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">
                          페이지당:
                        </label>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="12">12개</option>
                          <option value="24">24개</option>
                          <option value="48">48개</option>
                          <option value="96">96개</option>
                        </select>
                        <span className="text-sm text-gray-400">
                          전체 {filteredImages.length}개
                        </span>
                      </div>

                      {/* Page Navigation */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(totalImagePages, 5) },
                            (_, i) => {
                              let pageNum: number;
                              if (totalImagePages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalImagePages - 2) {
                                pageNum = totalImagePages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalImagePages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalImagePages}
                          className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Page Info */}
                      <div className="text-sm text-gray-400">
                        페이지 {currentPage} / {totalImagePages}
                      </div>
                    </div>
                  )}
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
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

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

              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingImage(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    이미지 편집
                  </button>
                  <button
                    onClick={() => {
                      setStyleTransferImage(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"
                  >
                    <Wand2 className="w-5 h-5" />
                    스타일 전이
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadImage(selectedImage, 'png')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    PNG 다운로드
                  </button>
                  <button
                    onClick={() => handleDownloadImage(selectedImage, 'jpg')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
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
        </div>
      )}

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={() => {
            loadMedia();
            setEditingImage(null);
          }}
        />
      )}

      {/* Style Transfer Modal */}
      {styleTransferImage && (
        <StyleTransfer
          baseImage={{
            id: styleTransferImage.id,
            dataUrl: styleTransferImage.blobUrl,
            prompt: styleTransferImage.metadata.prompt,
          }}
          onClose={() => setStyleTransferImage(null)}
          onSave={() => {
            loadMedia();
            setStyleTransferImage(null);
          }}
        />
      )}

      {/* Floating Compose Button */}
      {selectionMode && selectedImageIds.length >= 2 && (
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={handleOpenComposer}
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white font-semibold shadow-xl transition-all transform hover:scale-105"
          >
            <Layers className="w-5 h-5" />
            이미지 합성 ({selectedImageIds.length})
          </button>
        </div>
      )}

      {/* Image Composer Modal */}
      {showComposer && (
        <ImageComposer
          initialImages={imageList
            .filter((img) => selectedImageIds.includes(img.id))
            .map((img) => ({
              id: img.id,
              dataUrl: img.blobUrl,
            }))}
          onClose={handleComposerClose}
          onSave={handleComposerSave}
        />
      )}

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              갤러리 내보내는 중...
            </h3>
            <div className="space-y-4">
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{exportStatus}</span>
                <span className="text-white font-medium">
                  {exportProgress}%
                </span>
              </div>
              <div className="flex items-center justify-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                잠시만 기다려주세요...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Modal */}
      {showImportModal && importFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              갤러리 가져오기
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">파일 이름:</p>
                <p className="text-white font-medium">{importFile.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  중복 처리 방법:
                </label>
                <select
                  value={duplicateStrategy}
                  onChange={(e) =>
                    setDuplicateStrategy(e.target.value as DuplicateStrategy)
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="skip">건너뛰기 (기존 이미지 유지)</option>
                  <option value="overwrite">덮어쓰기 (기존 이미지 교체)</option>
                  <option value="keep-both">둘 다 유지 (새 ID 생성)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleImportCancel}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleImportConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  가져오기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Progress Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              갤러리 가져오는 중...
            </h3>
            <div className="space-y-4">
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{importStatus}</span>
                <span className="text-white font-medium">
                  {importProgress}%
                </span>
              </div>
              <div className="flex items-center justify-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                잠시만 기다려주세요...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
