/**
 * Tweet Storage Management
 * IndexedDB를 사용한 트윗 저장 및 관리
 */

import { StoredTweet, TweetPreset } from './types';

const DB_NAME = 'aiapps-tweets';
const DB_VERSION = 1;
const STORE_TWEETS = 'tweets';
const STORE_PRESETS = 'presets';

/**
 * IndexedDB 초기화
 */
function getDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 트윗 저장소
      if (!db.objectStoreNames.contains(STORE_TWEETS)) {
        const tweetsStore = db.createObjectStore(STORE_TWEETS, {
          keyPath: 'id',
        });
        tweetsStore.createIndex('createdAt', 'createdAt', { unique: false });
        tweetsStore.createIndex('tone', 'metadata.tone', { unique: false });
        tweetsStore.createIndex('tags', 'metadata.tags', { multiEntry: true });
      }

      // 프리셋 저장소
      if (!db.objectStoreNames.contains(STORE_PRESETS)) {
        db.createObjectStore(STORE_PRESETS, { keyPath: 'id' });
      }
    };
  });
}

/**
 * 트윗 저장
 */
export async function saveTweet(tweet: StoredTweet): Promise<string> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readwrite');
    const store = transaction.objectStore(STORE_TWEETS);
    const request = store.add(tweet);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string);

    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * 모든 트윗 조회
 */
export async function getAllTweets(): Promise<StoredTweet[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readonly');
    const store = transaction.objectStore(STORE_TWEETS);
    const index = store.index('createdAt');
    const request = index.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const tweets = request.result as StoredTweet[];
      // 최신순으로 정렬
      resolve(tweets.reverse());
    };
  });
}

/**
 * 트윗 조회 (ID로)
 */
export async function getTweet(id: string): Promise<StoredTweet | null> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readonly');
    const store = transaction.objectStore(STORE_TWEETS);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * 트윗 업데이트
 */
export async function updateTweet(tweet: StoredTweet): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readwrite');
    const store = transaction.objectStore(STORE_TWEETS);
    const request = store.put(tweet);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 트윗 삭제
 */
export async function deleteTweet(id: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readwrite');
    const store = transaction.objectStore(STORE_TWEETS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 톤으로 트윗 필터링
 */
export async function getTweetsByTone(tone: string): Promise<StoredTweet[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readonly');
    const store = transaction.objectStore(STORE_TWEETS);
    const index = store.index('tone');
    const request = index.getAll(tone);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const tweets = request.result as StoredTweet[];
      resolve(tweets.reverse());
    };
  });
}

/**
 * 태그로 트윗 필터링
 */
export async function getTweetsByTag(tag: string): Promise<StoredTweet[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readonly');
    const store = transaction.objectStore(STORE_TWEETS);
    const index = store.index('tags');
    const request = index.getAll(tag);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const tweets = request.result as StoredTweet[];
      resolve(tweets.reverse());
    };
  });
}

/**
 * 프리셋 저장
 */
export async function savePreset(preset: TweetPreset): Promise<string> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PRESETS], 'readwrite');
    const store = transaction.objectStore(STORE_PRESETS);
    const request = store.put(preset);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string);
  });
}

/**
 * 모든 프리셋 조회
 */
export async function getAllPresets(): Promise<TweetPreset[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PRESETS], 'readonly');
    const store = transaction.objectStore(STORE_PRESETS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * 프리셋 삭제
 */
export async function deletePreset(id: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PRESETS], 'readwrite');
    const store = transaction.objectStore(STORE_PRESETS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 모든 트윗 삭제
 */
export async function deleteAllTweets(): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TWEETS], 'readwrite');
    const store = transaction.objectStore(STORE_TWEETS);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 모든 프리셋 삭제
 */
export async function deleteAllPresets(): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PRESETS], 'readwrite');
    const store = transaction.objectStore(STORE_PRESETS);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
