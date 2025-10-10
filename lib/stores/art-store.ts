import { create } from 'zustand';
import type {
  ArtGenerateRequest,
  ArtGenerateResponse,
  ImageMetadata,
  ArtStyle,
} from '@/lib/art/types';
import { saveImage } from '@/lib/storage/indexed-db';

interface GeneratedImage {
  id: string;
  blobUrl: string;
  data: string;
  metadata: ImageMetadata;
}

interface ArtState {
  // 생성 요청 상태
  isGenerating: boolean;
  generationProgress: number;
  error: string | null;

  // 현재 선택된 스타일
  selectedStyle: ArtStyle | null;

  // 생성 요청 파라미터
  currentRequest: ArtGenerateRequest | null;

  // 생성된 이미지들
  generatedImages: GeneratedImage[];

  // 이미지 히스토리 (최근 20개)
  imageHistory: GeneratedImage[];

  // Actions
  setSelectedStyle: (style: ArtStyle) => void;
  setCurrentRequest: (request: ArtGenerateRequest) => void;
  startGeneration: () => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  addGeneratedImages: (response: ArtGenerateResponse) => void;
  clearGeneratedImages: () => void;
  removeImage: (id: string) => void;
  reset: () => void;
}

export const useArtStore = create<ArtState>((set, get) => ({
  // Initial state
  isGenerating: false,
  generationProgress: 0,
  error: null,
  selectedStyle: null,
  currentRequest: null,
  generatedImages: [],
  imageHistory: [],

  // Actions
  setSelectedStyle: (style) => set({ selectedStyle: style }),

  setCurrentRequest: (request) => set({ currentRequest: request }),

  startGeneration: () =>
    set({
      isGenerating: true,
      generationProgress: 0,
      error: null,
      generatedImages: [],
    }),

  setProgress: (progress) => set({ generationProgress: progress }),

  setError: (error) =>
    set({
      error,
      isGenerating: false,
      generationProgress: 0,
    }),

  addGeneratedImages: (response) => {
    const newImages: GeneratedImage[] = response.images.map((img) => ({
      id: img.metadata.id,
      blobUrl: `data:image/${img.format};base64,${img.data}`,
      data: img.data,
      metadata: img.metadata,
    }));

    // IndexedDB에 저장 (비동기이지만 await하지 않음)
    newImages.forEach((img) => {
      saveImage({
        id: img.id,
        blobUrl: img.blobUrl,
        data: img.data,
        metadata: img.metadata,
      }).catch((err) =>
        console.error('Failed to save image to IndexedDB:', err)
      );
    });

    set((state) => {
      // 히스토리에 추가 (최근 20개만 유지)
      const updatedHistory = [...newImages, ...state.imageHistory].slice(0, 20);

      // 이전 Blob URL 정리
      state.generatedImages.forEach((img) => {
        if (img.blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.blobUrl);
        }
      });

      return {
        generatedImages: newImages,
        imageHistory: updatedHistory,
        isGenerating: false,
        generationProgress: 100,
      };
    });
  },

  clearGeneratedImages: () => {
    const state = get();

    // Blob URL 정리
    state.generatedImages.forEach((img) => {
      if (img.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.blobUrl);
      }
    });

    set({ generatedImages: [] });
  },

  removeImage: (id) =>
    set((state) => {
      const imageToRemove = state.generatedImages.find((img) => img.id === id);

      if (imageToRemove && imageToRemove.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.blobUrl);
      }

      return {
        generatedImages: state.generatedImages.filter((img) => img.id !== id),
        imageHistory: state.imageHistory.filter((img) => img.id !== id),
      };
    }),

  reset: () => {
    const state = get();

    // 모든 Blob URL 정리
    state.generatedImages.forEach((img) => {
      if (img.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.blobUrl);
      }
    });

    state.imageHistory.forEach((img) => {
      if (img.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.blobUrl);
      }
    });

    set({
      isGenerating: false,
      generationProgress: 0,
      error: null,
      selectedStyle: null,
      currentRequest: null,
      generatedImages: [],
      imageHistory: [],
    });
  },
}));
