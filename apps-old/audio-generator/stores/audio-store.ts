/**
 * 오디오 생성 및 라이브러리 상태 관리 (Zustand)
 */

import { create } from 'zustand';
import { AudioAsset, AudioPrompt } from '@/lib/schemas/audio';

/**
 * 생성 상태
 */
export type GenerationStatus =
  | 'idle'
  | 'pending'
  | 'streaming'
  | 'completed'
  | 'failed';

/**
 * 스트리밍 진행 정보
 */
export interface StreamProgress {
  progress: number; // 0-100
  audioChunksReceived: number;
  metadata?: {
    bpm: number;
    key: string;
    scale: string;
    duration: number;
  };
}

/**
 * 생성된 오디오 결과
 */
export interface GeneratedAudio {
  audio: {
    data: ArrayBuffer;
    sampleRate: number;
    channels: number;
    bitDepth: number;
  };
  metadata: {
    bpm: number;
    key: string;
    scale: string;
    duration: number;
  };
  requestId: string;
  generatedAt: string;
  estimatedCost: number;
}

/**
 * 오디오 스토어 상태
 */
interface AudioState {
  // 생성 상태
  status: GenerationStatus;
  progress: StreamProgress | null;
  currentPrompt: AudioPrompt | null;
  generatedAudio: GeneratedAudio | null;
  error: string | null;

  // 라이브러리
  assets: AudioAsset[];
  selectedAsset: AudioAsset | null;
  isLoadingLibrary: boolean;

  // Actions
  setStatus: (status: GenerationStatus) => void;
  setProgress: (progress: StreamProgress) => void;
  setCurrentPrompt: (prompt: AudioPrompt) => void;
  setGeneratedAudio: (audio: GeneratedAudio) => void;
  setError: (error: string | null) => void;
  resetGeneration: () => void;

  // Library actions
  setAssets: (assets: AudioAsset[]) => void;
  addAsset: (asset: AudioAsset) => void;
  removeAsset: (id: string) => void;
  setSelectedAsset: (asset: AudioAsset | null) => void;
  setLoadingLibrary: (loading: boolean) => void;

  // API calls
  generateAudio: (prompt: AudioPrompt) => Promise<void>;
  fetchLibrary: () => Promise<void>;
  saveAsset: (asset: AudioAsset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  status: 'idle',
  progress: null,
  currentPrompt: null,
  generatedAudio: null,
  error: null,
  assets: [],
  selectedAsset: null,
  isLoadingLibrary: false,

  // Actions
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setGeneratedAudio: (audio) => set({ generatedAudio: audio }),
  setError: (error) => set({ error }),
  resetGeneration: () =>
    set({
      status: 'idle',
      progress: null,
      generatedAudio: null,
      error: null,
    }),

  // Library actions
  setAssets: (assets) => set({ assets }),
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  removeAsset: (id) =>
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  setLoadingLibrary: (loading) => set({ isLoadingLibrary: loading }),

  // API calls
  generateAudio: async (prompt) => {
    try {
      set({ status: 'pending', currentPrompt: prompt, error: null });

      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      set({ status: 'streaming' });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'audio' || data.type === 'metadata') {
              set((state) => ({
                progress: {
                  progress: data.progress || state.progress?.progress || 0,
                  audioChunksReceived:
                    (state.progress?.audioChunksReceived || 0) + 1,
                  metadata: data.metadata || state.progress?.metadata,
                },
              }));
            } else if (data.type === 'complete') {
              // base64 디코딩
              const audioData = Uint8Array.from(atob(data.audio.data), (c) =>
                c.charCodeAt(0)
              );

              set({
                status: 'completed',
                generatedAudio: {
                  audio: {
                    data: audioData.buffer,
                    sampleRate: data.audio.sampleRate,
                    channels: data.audio.channels,
                    bitDepth: data.audio.bitDepth,
                  },
                  metadata: data.metadata,
                  requestId: data.requestId,
                  generatedAt: data.generatedAt,
                  estimatedCost: data.estimatedCost,
                },
              });
            } else if (data.type === 'error') {
              throw new Error(data.error.message);
            }
          }
        }
      }
    } catch (error) {
      set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  fetchLibrary: async () => {
    try {
      set({ isLoadingLibrary: true });

      const response = await fetch('/api/audio/library');
      if (!response.ok) {
        throw new Error('Failed to fetch library');
      }

      const data = await response.json();
      set({ assets: data.assets, isLoadingLibrary: false });
    } catch (error) {
      console.error('Failed to fetch library:', error);
      set({ isLoadingLibrary: false });
    }
  },

  saveAsset: async (asset) => {
    try {
      const response = await fetch('/api/audio/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });

      if (!response.ok) {
        throw new Error('Failed to save asset');
      }

      get().addAsset(asset);
    } catch (error) {
      console.error('Failed to save asset:', error);
      throw error;
    }
  },

  deleteAsset: async (id) => {
    try {
      const response = await fetch(`/api/audio/library?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      get().removeAsset(id);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      throw error;
    }
  },
}));
