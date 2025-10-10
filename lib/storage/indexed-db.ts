/**
 * IndexedDB Storage Utility
 * 생성된 미디어(오디오, 이미지)를 브라우저에 영구 저장
 */

const DB_NAME = 'aiapps-media-library';
const DB_VERSION = 2; // 태그 시스템 추가를 위한 버전 업그레이드
const AUDIO_STORE = 'audio';
const IMAGE_STORE = 'images';

// IndexedDB 데이터베이스 초기화
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
      const oldVersion = event.oldVersion;

      // 오디오 스토어 생성 또는 업그레이드
      let audioStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        audioStore = db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      } else {
        audioStore = (
          event.target as IDBOpenDBRequest
        ).transaction!.objectStore(AUDIO_STORE);
      }

      // 기본 인덱스 생성 (버전 1)
      if (oldVersion < 1) {
        if (!audioStore.indexNames.contains('createdAt')) {
          audioStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!audioStore.indexNames.contains('genre')) {
          audioStore.createIndex('genre', 'metadata.genre', { unique: false });
        }
        if (!audioStore.indexNames.contains('type')) {
          audioStore.createIndex('type', 'metadata.type', { unique: false });
        }
      }

      // 태그 인덱스 추가 (버전 2)
      if (oldVersion < 2) {
        if (!audioStore.indexNames.contains('tags')) {
          audioStore.createIndex('tags', 'tags', {
            unique: false,
            multiEntry: true,
          });
        }
      }

      // 이미지 스토어 생성 또는 업그레이드
      let imageStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        imageStore = db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      } else {
        imageStore = (
          event.target as IDBOpenDBRequest
        ).transaction!.objectStore(IMAGE_STORE);
      }

      // 기본 인덱스 생성 (버전 1)
      if (oldVersion < 1) {
        if (!imageStore.indexNames.contains('createdAt')) {
          imageStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!imageStore.indexNames.contains('style')) {
          imageStore.createIndex('style', 'metadata.style', { unique: false });
        }
      }

      // 태그 인덱스 추가 (버전 2)
      if (oldVersion < 2) {
        if (!imageStore.indexNames.contains('tags')) {
          imageStore.createIndex('tags', 'tags', {
            unique: false,
            multiEntry: true,
          });
        }
      }
    };
  });
}

// 오디오 저장
export async function saveAudio(audio: {
  id: string;
  blobUrl: string;
  data: string; // base64
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  tags?: string[]; // 태그 배열 (옵션)
}): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([AUDIO_STORE], 'readwrite');
  const store = transaction.objectStore(AUDIO_STORE);

  const audioData = {
    id: audio.id,
    data: audio.data,
    metadata: audio.metadata,
    tags: audio.tags || [],
    createdAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(audioData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 이미지 저장
export async function saveImage(image: {
  id: string;
  blobUrl: string;
  data: string; // base64
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  tags?: string[]; // 태그 배열 (옵션)
}): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([IMAGE_STORE], 'readwrite');
  const store = transaction.objectStore(IMAGE_STORE);

  const imageData = {
    id: image.id,
    data: image.data,
    metadata: image.metadata,
    tags: image.tags || [],
    createdAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(imageData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 모든 오디오 가져오기
export async function getAllAudio(): Promise<
  Array<{
    id: string;
    data: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    tags: string[];
    createdAt: Date;
  }>
> {
  const db = await openDB();
  const transaction = db.transaction([AUDIO_STORE], 'readonly');
  const store = transaction.objectStore(AUDIO_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      // 기존 데이터와의 호환성을 위해 tags가 없으면 빈 배열로 설정
      const result = request.result.map((item) => ({
        ...item,
        tags: item.tags || [],
      }));
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

// 모든 이미지 가져오기
export async function getAllImages(): Promise<
  Array<{
    id: string;
    data: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    tags: string[];
    createdAt: Date;
  }>
> {
  const db = await openDB();
  const transaction = db.transaction([IMAGE_STORE], 'readonly');
  const store = transaction.objectStore(IMAGE_STORE);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      // 기존 데이터와의 호환성을 위해 tags가 없으면 빈 배열로 설정
      const result = request.result.map((item) => ({
        ...item,
        tags: item.tags || [],
      }));
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

// 오디오 삭제
export async function deleteAudio(id: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([AUDIO_STORE], 'readwrite');
  const store = transaction.objectStore(AUDIO_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 이미지 삭제
export async function deleteImage(id: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([IMAGE_STORE], 'readwrite');
  const store = transaction.objectStore(IMAGE_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 모든 오디오 삭제
export async function clearAllAudio(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([AUDIO_STORE], 'readwrite');
  const store = transaction.objectStore(AUDIO_STORE);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 모든 이미지 삭제
export async function clearAllImages(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([IMAGE_STORE], 'readwrite');
  const store = transaction.objectStore(IMAGE_STORE);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 스토리지 크기 추정
export async function getStorageSize(): Promise<{
  audioCount: number;
  imageCount: number;
  estimatedSize: number;
}> {
  const [audioList, imageList] = await Promise.all([
    getAllAudio(),
    getAllImages(),
  ]);

  const audioSize = audioList.reduce(
    (sum, item) => sum + (item.data?.length || 0),
    0
  );
  const imageSize = imageList.reduce(
    (sum, item) => sum + (item.data?.length || 0),
    0
  );

  // Base64는 원본의 약 4/3 크기
  const estimatedSize = Math.ceil(((audioSize + imageSize) * 3) / 4);

  return {
    audioCount: audioList.length,
    imageCount: imageList.length,
    estimatedSize,
  };
}
