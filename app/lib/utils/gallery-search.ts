/**
 * Gallery Search and Filtering Utilities
 * Provides efficient search, filtering, and sorting for image gallery
 */

import type { StoredImage } from '@/lib/types/storage';

export interface GalleryFilters {
  searchText?: string;
  styles?: string[];
  resolutions?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  tags?: string[];
}

export type SortOption = 'date-desc' | 'date-asc' | 'size-desc' | 'size-asc';

export interface GallerySearchOptions {
  filters?: GalleryFilters;
  sortBy?: SortOption;
  limit?: number;
  offset?: number;
}

/**
 * Text search in image metadata (prompt, tags)
 * Uses case-insensitive matching with debounce support
 */
export function searchImages(
  images: StoredImage[],
  searchText: string
): StoredImage[] {
  if (!searchText || searchText.trim().length === 0) {
    return images;
  }

  const query = searchText.toLowerCase().trim();

  return images.filter((image) => {
    // Search in prompt
    if (image.metadata.prompt.toLowerCase().includes(query)) {
      return true;
    }

    // Search in style
    if (image.metadata.style.toLowerCase().includes(query)) {
      return true;
    }

    // Search in tags if available
    if ('tags' in image.metadata && Array.isArray(image.metadata.tags)) {
      return image.metadata.tags.some((tag: string) =>
        tag.toLowerCase().includes(query)
      );
    }

    return false;
  });
}

/**
 * Apply filters to image list
 */
export function filterImages(
  images: StoredImage[],
  filters: GalleryFilters
): StoredImage[] {
  let filtered = [...images];

  // Text search
  if (filters.searchText) {
    filtered = searchImages(filtered, filters.searchText);
  }

  // Style filter
  if (filters.styles && filters.styles.length > 0) {
    filtered = filtered.filter((image) =>
      filters.styles!.includes(image.metadata.style)
    );
  }

  // Resolution filter
  if (filters.resolutions && filters.resolutions.length > 0) {
    filtered = filtered.filter((image) => {
      const resolution = `${image.metadata.width}x${image.metadata.height}`;
      return filters.resolutions!.includes(resolution);
    });
  }

  // Date range filter
  if (filters.dateRange) {
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        (image) => new Date(image.createdAt) >= filters.dateRange!.start!
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(
        (image) => new Date(image.createdAt) <= filters.dateRange!.end!
      );
    }
  }

  // Tag filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((image) => {
      if (!('tags' in image.metadata) || !Array.isArray(image.metadata.tags)) {
        return false;
      }
      return filters.tags!.some((tag) => image.metadata.tags!.includes(tag));
    });
  }

  return filtered;
}

/**
 * Sort images by specified option
 */
export function sortImages(
  images: StoredImage[],
  sortBy: SortOption
): StoredImage[] {
  const sorted = [...images];

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'date-asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    case 'size-desc':
      return sorted.sort((a, b) => {
        const sizeA = a.metadata.width * a.metadata.height;
        const sizeB = b.metadata.width * b.metadata.height;
        return sizeB - sizeA;
      });

    case 'size-asc':
      return sorted.sort((a, b) => {
        const sizeA = a.metadata.width * a.metadata.height;
        const sizeB = b.metadata.width * b.metadata.height;
        return sizeA - sizeB;
      });

    default:
      return sorted;
  }
}

/**
 * Main search and filter function
 * Combines filtering, sorting, and pagination
 */
export function searchAndFilterImages(
  images: StoredImage[],
  options: GallerySearchOptions = {}
): {
  results: StoredImage[];
  total: number;
  hasMore: boolean;
} {
  const { filters = {}, sortBy = 'date-desc', limit, offset = 0 } = options;

  // Apply filters
  let results = filterImages(images, filters);

  // Apply sorting
  results = sortImages(results, sortBy);

  const total = results.length;

  // Apply pagination
  if (limit !== undefined) {
    const start = offset;
    const end = offset + limit;
    results = results.slice(start, end);
  }

  return {
    results,
    total,
    hasMore: limit !== undefined ? offset + limit < total : false,
  };
}

/**
 * Extract unique values for filter options
 */
export function getFilterOptions(images: StoredImage[]): {
  styles: string[];
  resolutions: string[];
  tags: string[];
} {
  const stylesSet = new Set<string>();
  const resolutionsSet = new Set<string>();
  const tagsSet = new Set<string>();

  images.forEach((image) => {
    // Collect styles
    stylesSet.add(image.metadata.style);

    // Collect resolutions
    const resolution = `${image.metadata.width}x${image.metadata.height}`;
    resolutionsSet.add(resolution);

    // Collect tags
    if ('tags' in image.metadata && Array.isArray(image.metadata.tags)) {
      image.metadata.tags.forEach((tag: string) => tagsSet.add(tag));
    }
  });

  return {
    styles: Array.from(stylesSet).sort(),
    resolutions: Array.from(resolutionsSet).sort(),
    tags: Array.from(tagsSet).sort(),
  };
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Convert filters to URL query parameters
 */
export function filtersToQueryParams(filters: GalleryFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.searchText) {
    params.set('q', filters.searchText);
  }

  if (filters.styles && filters.styles.length > 0) {
    params.set('styles', filters.styles.join(','));
  }

  if (filters.resolutions && filters.resolutions.length > 0) {
    params.set('resolutions', filters.resolutions.join(','));
  }

  if (filters.dateRange) {
    if (filters.dateRange.start) {
      params.set('dateStart', filters.dateRange.start.toISOString());
    }
    if (filters.dateRange.end) {
      params.set('dateEnd', filters.dateRange.end.toISOString());
    }
  }

  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }

  return params;
}

/**
 * Parse URL query parameters to filters
 */
export function queryParamsToFilters(
  searchParams: URLSearchParams
): GalleryFilters {
  const filters: GalleryFilters = {};

  const searchText = searchParams.get('q');
  if (searchText) {
    filters.searchText = searchText;
  }

  const styles = searchParams.get('styles');
  if (styles) {
    filters.styles = styles.split(',');
  }

  const resolutions = searchParams.get('resolutions');
  if (resolutions) {
    filters.resolutions = resolutions.split(',');
  }

  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  if (dateStart || dateEnd) {
    filters.dateRange = {};
    if (dateStart) {
      filters.dateRange.start = new Date(dateStart);
    }
    if (dateEnd) {
      filters.dateRange.end = new Date(dateEnd);
    }
  }

  const tags = searchParams.get('tags');
  if (tags) {
    filters.tags = tags.split(',');
  }

  return filters;
}
