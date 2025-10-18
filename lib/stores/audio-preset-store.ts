/**
 * 오디오 프리셋 스토어
 * 사용자가 저장한 커스텀 프리셋을 관리합니다
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioPresetBuilderSchema } from '@/lib/audio/preset-builder-schema';

interface AudioPresetStore {
  // 상태
  customPresets: AudioPresetBuilderSchema[];

  // 액션
  addPreset: (preset: AudioPresetBuilderSchema) => void;
  updatePreset: (id: string, preset: Partial<AudioPresetBuilderSchema>) => void;
  deletePreset: (id: string) => void;
  getPreset: (id: string) => AudioPresetBuilderSchema | undefined;
  getPresetsByType: (type: 'bgm' | 'sfx') => AudioPresetBuilderSchema[];
  exportPresets: () => string;
  importPresets: (json: string) => boolean;
  clearAllPresets: () => void;
}

/**
 * 오디오 프리셋 Zustand 스토어
 * localStorage에 자동으로 저장됩니다
 */
export const useAudioPresetStore = create<AudioPresetStore>()(
  persist(
    (set, get) => ({
      customPresets: [],

      /**
       * 새로운 커스텀 프리셋 추가
       */
      addPreset: (preset) => {
        const now = new Date().toISOString();
        const newPreset: AudioPresetBuilderSchema = {
          ...preset,
          isBuiltIn: false,
          createdAt: preset.createdAt || now,
          updatedAt: now,
        };

        set((state) => ({
          customPresets: [...state.customPresets, newPreset],
        }));
      },

      /**
       * 기존 프리셋 업데이트
       */
      updatePreset: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          customPresets: state.customPresets.map((preset) =>
            preset.id === id
              ? {
                  ...preset,
                  ...updates,
                  updatedAt: now,
                }
              : preset
          ),
        }));
      },

      /**
       * 프리셋 삭제
       */
      deletePreset: (id) => {
        set((state) => ({
          customPresets: state.customPresets.filter((p) => p.id !== id),
        }));
      },

      /**
       * ID로 프리셋 조회
       */
      getPreset: (id) => {
        return get().customPresets.find((p) => p.id === id);
      },

      /**
       * 타입별 프리셋 조회
       */
      getPresetsByType: (type) => {
        return get().customPresets.filter((p) => p.type === type);
      },

      /**
       * 프리셋 내보내기 (JSON)
       */
      exportPresets: () => {
        const presets = get().customPresets;
        return JSON.stringify(presets, null, 2);
      },

      /**
       * 프리셋 가져오기 (JSON)
       */
      importPresets: (json) => {
        try {
          const imported = JSON.parse(json) as AudioPresetBuilderSchema[];

          // 검증: 배열인지 확인
          if (!Array.isArray(imported)) {
            return false;
          }

          // 검증: 각 항목이 프리셋 구조인지 확인
          const isValid = imported.every(
            (p) =>
              typeof p.id === 'string' &&
              typeof p.name === 'string' &&
              typeof p.type === 'string' &&
              Array.isArray(p.groups)
          );

          if (!isValid) {
            return false;
          }

          // ID 충돌 방지: 새로운 ID 생성
          const now = new Date().toISOString();
          const validPresets: AudioPresetBuilderSchema[] = imported.map(
            (p) => ({
              ...p,
              id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              isBuiltIn: false,
              createdAt: now,
              updatedAt: now,
            })
          );

          set((state) => ({
            customPresets: [...state.customPresets, ...validPresets],
          }));

          return true;
        } catch {
          return false;
        }
      },

      /**
       * 모든 커스텀 프리셋 삭제
       */
      clearAllPresets: () => {
        set({ customPresets: [] });
      },
    }),
    {
      name: 'audio-preset-store',
      version: 1,
    }
  )
);
