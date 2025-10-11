/**
 * 프롬프트 테마 IndexedDB 저장소
 */

import type {
  PromptTheme,
  CreateThemeInput,
  UpdateThemeInput,
} from './prompt-theme';
import type { PresetBuilderSchema } from './preset-builder-schema';
import { DEFAULT_THEMES } from './default-themes';

const DB_NAME = 'aiapps-prompt-themes';
const DB_VERSION = 1;
const THEME_STORE = 'themes';

/**
 * IndexedDB 연결
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 테마 스토어 생성
      if (!db.objectStoreNames.contains(THEME_STORE)) {
        const themeStore = db.createObjectStore(THEME_STORE, { keyPath: 'id' });
        themeStore.createIndex('usageType', 'usageType', { unique: false });
        themeStore.createIndex('isDefault', 'isDefault', { unique: false });
        themeStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * 기본 테마 초기화
 */
export async function initializeDefaultThemes(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readwrite');
  const store = transaction.objectStore(THEME_STORE);

  // 기본 테마가 없으면 추가
  for (const theme of DEFAULT_THEMES) {
    const existing = await new Promise<PromptTheme | undefined>(
      (resolve, reject) => {
        const request = store.get(theme.id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    );

    if (!existing) {
      await new Promise<void>((resolve, reject) => {
        const request = store.add(theme);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

/**
 * 레거시 프리셋 빌더 구조 (마이그레이션용)
 */
interface LegacyPresetBuilders {
  character?: PresetBuilderSchema;
  item?: PresetBuilderSchema;
  environment?: PresetBuilderSchema;
}

/**
 * 레거시 테마 구조 (마이그레이션용)
 */
interface LegacyTheme {
  id: string;
  name: string;
  usageType: 'game' | 'web' | 'general';
  description: string;
  icon?: string;
  artStyles: PromptTheme['artStyles'];
  presetBuilders: LegacyPresetBuilders | PresetBuilderSchema[];
  isDefault?: boolean;
  isReadOnly?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * presetBuilders를 객체에서 배열로 마이그레이션
 */
function migratePresetBuilders(theme: LegacyTheme): PromptTheme {
  // presetBuilders가 이미 배열이면 그대로 반환
  if (Array.isArray(theme.presetBuilders)) {
    return theme as PromptTheme;
  }

  // 객체 형태인 경우 배열로 변환
  const presetBuilders: PresetBuilderSchema[] = [];

  if (theme.presetBuilders && typeof theme.presetBuilders === 'object') {
    // 이전 객체 구조: { character?: ..., item?: ..., environment?: ... }
    const oldPresets = theme.presetBuilders as LegacyPresetBuilders;

    // 각 프리셋을 배열에 추가 (존재하는 것만)
    if (oldPresets.character) {
      presetBuilders.push(oldPresets.character);
    }
    if (oldPresets.item) {
      presetBuilders.push(oldPresets.item);
    }
    if (oldPresets.environment) {
      presetBuilders.push(oldPresets.environment);
    }
  }

  return {
    ...theme,
    presetBuilders,
  } as PromptTheme;
}

/**
 * 모든 테마 가져오기
 */
export async function getAllThemes(): Promise<PromptTheme[]> {
  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readonly');
  const store = transaction.objectStore(THEME_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const themes = request.result || [];
      // 마이그레이션 적용
      const migratedThemes = themes.map(migratePresetBuilders);
      resolve(migratedThemes);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * ID로 테마 가져오기
 */
export async function getThemeById(
  id: string
): Promise<PromptTheme | undefined> {
  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readonly');
  const store = transaction.objectStore(THEME_STORE);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const theme = request.result;
      // 마이그레이션 적용
      resolve(theme ? migratePresetBuilders(theme) : undefined);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * 사용 목적별 테마 가져오기
 */
export async function getThemesByUsageType(
  usageType: 'game' | 'web' | 'general'
): Promise<PromptTheme[]> {
  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readonly');
  const store = transaction.objectStore(THEME_STORE);
  const index = store.index('usageType');

  return new Promise((resolve, reject) => {
    const request = index.getAll(usageType);
    request.onsuccess = () => {
      const themes = request.result || [];
      // 마이그레이션 적용
      const migratedThemes = themes.map(migratePresetBuilders);
      resolve(migratedThemes);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * 새 테마 생성
 */
export async function createTheme(
  input: CreateThemeInput
): Promise<PromptTheme> {
  const theme: PromptTheme = {
    id: `theme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    isDefault: false,
    isReadOnly: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readwrite');
  const store = transaction.objectStore(THEME_STORE);

  return new Promise((resolve, reject) => {
    const request = store.add(theme);
    request.onsuccess = () => resolve(theme);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 테마 업데이트
 */
export async function updateTheme(
  id: string,
  input: UpdateThemeInput
): Promise<PromptTheme> {
  const existing = await getThemeById(id);
  if (!existing) {
    throw new Error(`Theme not found: ${id}`);
  }

  if (existing.isReadOnly) {
    throw new Error('Cannot update read-only theme');
  }

  const updated: PromptTheme = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readwrite');
  const store = transaction.objectStore(THEME_STORE);

  return new Promise((resolve, reject) => {
    const request = store.put(updated);
    request.onsuccess = () => resolve(updated);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 테마 삭제
 */
export async function deleteTheme(id: string): Promise<void> {
  const existing = await getThemeById(id);
  if (!existing) {
    throw new Error(`Theme not found: ${id}`);
  }

  if (existing.isReadOnly) {
    throw new Error('Cannot delete read-only theme');
  }

  const db = await openDB();
  const transaction = db.transaction([THEME_STORE], 'readwrite');
  const store = transaction.objectStore(THEME_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 테마 복제
 */
export async function duplicateTheme(
  id: string,
  newName?: string
): Promise<PromptTheme> {
  const original = await getThemeById(id);
  if (!original) {
    throw new Error(`Theme not found: ${id}`);
  }

  const duplicate: CreateThemeInput = {
    name: newName || `${original.name} (복사본)`,
    usageType: original.usageType,
    description: original.description,
    artStyles: [...original.artStyles],
    presetBuilders: {
      ...original.presetBuilders,
    },
  };

  return createTheme(duplicate);
}
