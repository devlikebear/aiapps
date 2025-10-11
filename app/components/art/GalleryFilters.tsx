'use client';

import { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { GalleryFilters, SortOption } from '@/lib/utils/gallery-search';
import { debounce } from '@/lib/utils/gallery-search';

interface GalleryFiltersProps {
  filters: GalleryFilters;
  sortBy: SortOption;
  onFiltersChange: (filters: GalleryFilters) => void;
  onSortChange: (sortBy: SortOption) => void;
  filterOptions: {
    styles: string[];
    resolutions: string[];
    tags: string[];
  };
  resultCount: number;
  totalCount: number;
}

export default function GalleryFiltersComponent({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  filterOptions,
  resultCount,
  totalCount,
}: GalleryFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchText || '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search handler
  useEffect(() => {
    const debouncedSearch = debounce((value: string) => {
      onFiltersChange({
        ...filters,
        searchText: value || undefined,
      });
    }, 300);

    debouncedSearch(searchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleStyleToggle = (style: string) => {
    const currentStyles = filters.styles || [];
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter((s: string) => s !== style)
      : [...currentStyles, style];

    onFiltersChange({
      ...filters,
      styles: newStyles.length > 0 ? newStyles : undefined,
    });
  };

  const handleResolutionToggle = (resolution: string) => {
    const currentResolutions = filters.resolutions || [];
    const newResolutions = currentResolutions.includes(resolution)
      ? currentResolutions.filter((r: string) => r !== resolution)
      : [...currentResolutions, resolution];

    onFiltersChange({
      ...filters,
      resolutions: newResolutions.length > 0 ? newResolutions : undefined,
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.searchText ||
    (filters.styles && filters.styles.length > 0) ||
    (filters.resolutions && filters.resolutions.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    filters.dateRange;

  return (
    <div className="space-y-4">
      {/* Search Bar and Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="프롬프트, 스타일, 태그로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
            showFilters
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600'
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">필터</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none px-4 py-2 pr-10 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date-desc">최신순</option>
            <option value="date-asc">오래된순</option>
            <option value="size-desc">큰 이미지순</option>
            <option value="size-asc">작은 이미지순</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {resultCount === totalCount ? (
            <span>총 {totalCount}개의 이미지</span>
          ) : (
            <span>
              {totalCount}개 중 {resultCount}개 표시
            </span>
          )}
        </p>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            필터 초기화
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="app-card p-4 space-y-4">
          {/* Style Filters */}
          {filterOptions.styles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">스타일</h3>
              <div className="flex flex-wrap gap-2">
                {filterOptions.styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleToggle(style)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.styles?.includes(style)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Filters */}
          {filterOptions.resolutions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">해상도</h3>
              <div className="flex flex-wrap gap-2">
                {filterOptions.resolutions.map((resolution) => (
                  <button
                    key={resolution}
                    onClick={() => handleResolutionToggle(resolution)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.resolutions?.includes(resolution)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {resolution}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Filters */}
          {filterOptions.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">태그</h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {filterOptions.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.tags?.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
