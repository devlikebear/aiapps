import { create } from 'zustand';
import type {
  ImagePrompt,
  ImageEdit,
  ImageCompose,
  StyleTransfer,
  ImageAsset,
  LibraryQuery,
} from '../lib/schemas/image';

interface ImageState {
  // Status
  status:
    | 'idle'
    | 'generating'
    | 'editing'
    | 'composing'
    | 'transferring'
    | 'error';
  error: string | null;

  // Generated image
  generatedImage: string | null;
  tokenCost: number | null;

  // Library
  library: ImageAsset[];
  filteredLibrary: ImageAsset[];

  // Actions
  generateImage: (prompt: ImagePrompt) => Promise<void>;
  editImage: (edit: ImageEdit) => Promise<void>;
  composeImages: (compose: ImageCompose) => Promise<void>;
  transferStyle: (transfer: StyleTransfer) => Promise<void>;
  saveToLibrary: (asset: Omit<ImageAsset, 'id' | 'createdAt'>) => Promise<void>;
  loadLibrary: (query?: LibraryQuery) => Promise<void>;
  deleteFromLibrary: (id: string) => Promise<void>;
  filterLibrary: (query: LibraryQuery) => void;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  // Initial state
  status: 'idle',
  error: null,
  generatedImage: null,
  tokenCost: null,
  library: [],
  filteredLibrary: [],

  // Generate image
  generateImage: async (prompt) => {
    set({
      status: 'generating',
      error: null,
      generatedImage: null,
      tokenCost: null,
    });

    try {
      const response = await fetch('/api/art/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      set({
        status: 'idle',
        generatedImage: `data:${result.data.mimeType};base64,${result.data.imageData}`,
        tokenCost: result.data.tokenCost,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Edit image
  editImage: async (edit) => {
    set({
      status: 'editing',
      error: null,
      generatedImage: null,
      tokenCost: null,
    });

    try {
      const response = await fetch('/api/art/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to edit image');
      }

      set({
        status: 'idle',
        generatedImage: `data:${result.data.mimeType};base64,${result.data.imageData}`,
        tokenCost: result.data.tokenCost,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Compose images
  composeImages: async (compose) => {
    set({
      status: 'composing',
      error: null,
      generatedImage: null,
      tokenCost: null,
    });

    try {
      const response = await fetch('/api/art/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compose),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to compose images');
      }

      set({
        status: 'idle',
        generatedImage: `data:${result.data.mimeType};base64,${result.data.imageData}`,
        tokenCost: result.data.tokenCost,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Transfer style
  transferStyle: async (transfer) => {
    set({
      status: 'transferring',
      error: null,
      generatedImage: null,
      tokenCost: null,
    });

    try {
      const response = await fetch('/api/art/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to transfer style');
      }

      set({
        status: 'idle',
        generatedImage: `data:${result.data.mimeType};base64,${result.data.imageData}`,
        tokenCost: result.data.tokenCost,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Save to library
  saveToLibrary: async (asset) => {
    try {
      const response = await fetch('/api/art/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save to library');
      }

      // Reload library
      await get().loadLibrary();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Load library
  loadLibrary: async (query) => {
    try {
      const params = new URLSearchParams();
      if (query?.tags) params.set('tags', query.tags.join(','));
      if (query?.style) params.set('style', query.style);
      if (query?.artType) params.set('artType', query.artType);
      if (query?.mood) params.set('mood', query.mood);

      const response = await fetch(`/api/art/library?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load library');
      }

      set({
        library: result.data,
        filteredLibrary: result.data,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Delete from library
  deleteFromLibrary: async (id) => {
    try {
      const response = await fetch(`/api/art/library?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete from library');
      }

      // Reload library
      await get().loadLibrary();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Filter library locally
  filterLibrary: (query) => {
    const { library } = get();
    let filtered = [...library];

    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter((asset) =>
        query.tags!.some((tag) => asset.tags.includes(tag))
      );
    }

    if (query.style) {
      filtered = filtered.filter((asset) => asset.style === query.style);
    }

    if (query.artType) {
      filtered = filtered.filter((asset) => asset.artType === query.artType);
    }

    if (query.mood) {
      filtered = filtered.filter((asset) => asset.mood === query.mood);
    }

    set({ filteredLibrary: filtered });
  },

  // Reset state
  reset: () => {
    set({
      status: 'idle',
      error: null,
      generatedImage: null,
      tokenCost: null,
    });
  },
}));
