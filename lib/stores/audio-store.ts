/**
 * Audio Generator Zustand Store
 * 오디오 생성 상태 관리
 */

import { create } from 'zustand';
import type {
  AudioGenerateRequest,
  AudioMetadata,
  AudioGenerationProgress,
  AudioPlayerState,
  GameGenre,
  AudioType,
} from '@/lib/audio/types';
import { saveAudio } from '@/lib/storage/indexed-db';

interface GeneratedAudio {
  id: string;
  audioData: ArrayBuffer;
  audioUrl: string; // Blob URL
  metadata: AudioMetadata;
  createdAt: Date;
}

interface AudioStore {
  // 생성 요청 파라미터
  request: Partial<AudioGenerateRequest> | null;
  setRequest: (request: Partial<AudioGenerateRequest>) => void;
  updateRequest: (updates: Partial<AudioGenerateRequest>) => void;

  // 생성 상태
  isGenerating: boolean;
  progress: AudioGenerationProgress | null;
  error: string | null;

  // 생성된 오디오
  currentAudio: GeneratedAudio | null;
  audioHistory: GeneratedAudio[];

  // 플레이어 상태
  playerState: AudioPlayerState;

  // Actions
  startGeneration: () => void;
  setProgress: (progress: AudioGenerationProgress) => void;
  setGeneratedAudio: (audio: ArrayBuffer, metadata: AudioMetadata) => void;
  setError: (error: string) => void;
  completeGeneration: () => void;
  resetGeneration: () => void;

  // Player actions
  setPlayerState: (state: Partial<AudioPlayerState>) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;

  // History actions
  addToHistory: (audio: GeneratedAudio) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  request: null,
  isGenerating: false,
  progress: null,
  error: null,
  currentAudio: null,
  audioHistory: [],
  playerState: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLooping: false,
  },

  // Request management
  setRequest: (request) => set({ request }),
  updateRequest: (updates) =>
    set((state) => ({
      request: state.request ? { ...state.request, ...updates } : updates,
    })),

  // Generation actions
  startGeneration: () =>
    set({
      isGenerating: true,
      progress: {
        status: 'pending',
        progress: 0,
        message: '생성 준비 중...',
      },
      error: null,
    }),

  setProgress: (progress) => set({ progress }),

  setGeneratedAudio: (audioData, metadata) => {
    try {
      // ArrayBuffer → Uint8Array 검증
      if (!(audioData instanceof ArrayBuffer)) {
        throw new Error(
          `Invalid audioData type: expected ArrayBuffer, got ${typeof audioData}`
        );
      }

      // Blob URL 생성 (재생용)
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      // eslint-disable-next-line no-console
      console.log(
        '[AudioStore] Generated Blob URL:',
        audioUrl.substring(0, 50)
      );

      const generatedAudio: GeneratedAudio = {
        id: metadata.id,
        audioData,
        audioUrl,
        metadata,
        createdAt: new Date(),
      };

      // ArrayBuffer → Base64 변환 (브라우저 환경, IndexedDB 저장용)
      const bytes = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // eslint-disable-next-line no-console
      console.log('[AudioStore] Base64 encoded, size:', base64.length, 'bytes');

      saveAudio({
        id: metadata.id,
        blobUrl: audioUrl,
        data: base64,
        metadata,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[AudioStore] Failed to save audio to IndexedDB:', err);
      });

      set({
        currentAudio: generatedAudio,
        playerState: {
          ...get().playerState,
          duration: metadata.duration,
          currentTime: 0,
        },
      });

      // eslint-disable-next-line no-console
      console.log('[AudioStore] Audio ready for playback:', {
        id: metadata.id,
        duration: metadata.duration,
        audioUrlValid: audioUrl.startsWith('blob:'),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AudioStore] setGeneratedAudio error:', err);
      set({
        error: `Audio data processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  },

  setError: (error) => set({ error, isGenerating: false }),

  completeGeneration: () => {
    const { currentAudio, audioHistory } = get();

    set({
      isGenerating: false,
      progress: {
        status: 'complete',
        progress: 100,
        message: '생성 완료!',
      },
    });

    // Add to history
    if (currentAudio) {
      set({
        audioHistory: [currentAudio, ...audioHistory].slice(0, 10), // Keep last 10
      });
    }
  },

  resetGeneration: () =>
    set({
      isGenerating: false,
      progress: null,
      error: null,
    }),

  // Player actions
  setPlayerState: (state) =>
    set((prev) => ({
      playerState: { ...prev.playerState, ...state },
    })),

  play: () =>
    set((state) => ({
      playerState: { ...state.playerState, isPlaying: true },
    })),

  pause: () =>
    set((state) => ({
      playerState: { ...state.playerState, isPlaying: false },
    })),

  stop: () =>
    set((state) => ({
      playerState: {
        ...state.playerState,
        isPlaying: false,
        currentTime: 0,
      },
    })),

  setVolume: (volume) =>
    set((state) => ({
      playerState: { ...state.playerState, volume, isMuted: false },
    })),

  setCurrentTime: (currentTime) =>
    set((state) => ({
      playerState: { ...state.playerState, currentTime },
    })),

  toggleMute: () =>
    set((state) => ({
      playerState: {
        ...state.playerState,
        isMuted: !state.playerState.isMuted,
      },
    })),

  toggleLoop: () =>
    set((state) => ({
      playerState: {
        ...state.playerState,
        isLooping: !state.playerState.isLooping,
      },
    })),

  // History actions
  addToHistory: (audio) =>
    set((state) => ({
      audioHistory: [audio, ...state.audioHistory].slice(0, 10),
    })),

  removeFromHistory: (id) =>
    set((state) => {
      const audio = state.audioHistory.find((a) => a.id === id);
      if (audio) {
        URL.revokeObjectURL(audio.audioUrl);
      }
      return {
        audioHistory: state.audioHistory.filter((a) => a.id !== id),
      };
    }),

  clearHistory: () => {
    const { audioHistory } = get();
    audioHistory.forEach((audio) => {
      URL.revokeObjectURL(audio.audioUrl);
    });
    set({ audioHistory: [] });
  },
}));

// Preset helper
export function createPresetRequest(
  type: AudioType,
  genre: GameGenre,
  prompt: string
): AudioGenerateRequest {
  return {
    type,
    genre,
    prompt,
    // 나머지는 서버에서 프리셋 적용
  };
}
