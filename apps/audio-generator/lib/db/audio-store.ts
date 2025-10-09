/**
 * 오디오 에셋 인메모리 스토어 (프로토타입용)
 * 프로덕션에서는 Vercel Blob 또는 Supabase로 교체
 */

import { AudioAsset } from '../schemas/audio';

class AudioStore {
  private assets: Map<string, AudioAsset> = new Map();

  /**
   * 에셋 추가
   */
  add(asset: AudioAsset): void {
    this.assets.set(asset.id, asset);
  }

  /**
   * 에셋 조회 (ID)
   */
  get(id: string): AudioAsset | undefined {
    return this.assets.get(id);
  }

  /**
   * 모든 에셋 조회
   */
  getAll(): AudioAsset[] {
    return Array.from(this.assets.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * 에셋 검색 (태그, 장르, 무드)
   */
  search(query: {
    tags?: string[];
    genre?: string;
    mood?: string;
  }): AudioAsset[] {
    let results = this.getAll();

    if (query.tags && query.tags.length > 0) {
      results = results.filter((asset) =>
        query.tags!.some((tag) => asset.tags.includes(tag))
      );
    }

    if (query.genre) {
      results = results.filter((asset) => asset.genre === query.genre);
    }

    if (query.mood) {
      results = results.filter((asset) => asset.mood === query.mood);
    }

    return results;
  }

  /**
   * 에셋 삭제
   */
  delete(id: string): boolean {
    return this.assets.delete(id);
  }

  /**
   * 에셋 업데이트
   */
  update(id: string, updates: Partial<AudioAsset>): AudioAsset | undefined {
    const asset = this.assets.get(id);
    if (!asset) return undefined;

    const updated = { ...asset, ...updates };
    this.assets.set(id, updated);
    return updated;
  }
}

// 싱글톤 인스턴스
export const audioStore = new AudioStore();
