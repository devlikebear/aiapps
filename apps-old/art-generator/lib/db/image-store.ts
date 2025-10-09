import type { ImageAsset, LibraryQuery } from '../schemas/image';

/**
 * In-memory image store for prototyping
 * TODO: Replace with persistent storage (Vercel Blob, Supabase, etc.)
 */
class ImageStore {
  private assets: Map<string, ImageAsset> = new Map();

  /**
   * Add a new image asset
   */
  add(asset: ImageAsset): void {
    this.assets.set(asset.id, asset);
  }

  /**
   * Get all image assets
   */
  getAll(): ImageAsset[] {
    return Array.from(this.assets.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get a specific image asset by ID
   */
  get(id: string): ImageAsset | undefined {
    return this.assets.get(id);
  }

  /**
   * Search image assets with filters
   */
  search(query: LibraryQuery): ImageAsset[] {
    let results = this.getAll();

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter((asset) =>
        query.tags!.some((tag) => asset.tags.includes(tag))
      );
    }

    // Filter by style
    if (query.style) {
      results = results.filter((asset) => asset.style === query.style);
    }

    // Filter by art type
    if (query.artType) {
      results = results.filter((asset) => asset.artType === query.artType);
    }

    // Filter by mood
    if (query.mood) {
      results = results.filter((asset) => asset.mood === query.mood);
    }

    return results;
  }

  /**
   * Delete an image asset
   */
  delete(id: string): boolean {
    return this.assets.delete(id);
  }

  /**
   * Clear all image assets
   */
  clear(): void {
    this.assets.clear();
  }

  /**
   * Get total count
   */
  count(): number {
    return this.assets.size;
  }
}

// Singleton instance
export const imageStore = new ImageStore();
