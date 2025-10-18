'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Music, ImageIcon, Library } from 'lucide-react';
import { hasApiKey } from '@/lib/api-key/storage';
import ApiKeySettings from '@/components/ApiKeySettings';
import JobQueueButton from '@/components/queue/JobQueueButton';

interface App {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
}

const APPS: App[] = [
  {
    id: 'audio',
    name: '오디오 생성기',
    icon: '🎵',
    path: '/apps/audio-generator/create',
    description: 'AI 게임 음악 및 효과음 생성',
  },
  {
    id: 'art',
    name: '아트 생성기',
    icon: '🎨',
    path: '/apps/art-generator/create',
    description: '2D 게임 아트 생성',
  },
];

function GlobalNav() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setHasKey(hasApiKey('gemini'));
  }, [isSettingsOpen]);

  // 필터링된 앱 목록 (useMemo로 메모이제이션)
  const filteredApps = useMemo(
    () =>
      APPS.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  // isActive 함수 (useCallback으로 메모이제이션)
  const isActive = useCallback(
    (path: string) => pathname?.startsWith(path),
    [pathname]
  );

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 shadow-lg"
        role="navigation"
        aria-label="메인 네비게이션"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="AI Tools Hub 홈으로 이동"
            >
              <div
                className="text-2xl group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                🤖
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  AI Tools Hub
                </div>
                <div className="text-xs text-gray-400">Powered by Gemini</div>
              </div>
            </Link>

            {/* Center - App Navigation */}
            <div
              className="hidden md:flex items-center gap-2"
              role="group"
              aria-label="앱 네비게이션"
            >
              {/* Audio Generator */}
              <Link
                href="/apps/audio-generator/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/apps/audio-generator')
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                aria-label="오디오 생성기로 이동"
                aria-current={
                  isActive('/apps/audio-generator') ? 'page' : undefined
                }
              >
                <Music className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">오디오</span>
              </Link>

              {/* Art Generator */}
              <Link
                href="/apps/art-generator/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/apps/art-generator')
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                aria-label="아트 생성기로 이동"
                aria-current={
                  isActive('/apps/art-generator') ? 'page' : undefined
                }
              >
                <ImageIcon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">아트</span>
              </Link>

              {/* Library */}
              <Link
                href="/library"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/library')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                aria-label="미디어 라이브러리로 이동"
                aria-current={isActive('/library') ? 'page' : undefined}
              >
                <Library className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">라이브러리</span>
              </Link>
            </div>

            {/* Right - Queue, Search & Settings */}
            <div className="flex items-center gap-3">
              {/* Job Queue Button */}
              <JobQueueButton />

              {/* App Search (Desktop) */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                  aria-label="앱 검색 열기"
                  aria-expanded={isSearchOpen}
                  aria-controls="app-search-dropdown"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">앱 검색</span>
                </button>

                {isSearchOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSearchOpen(false)}
                    />

                    {/* Search Dropdown */}
                    <div
                      id="app-search-dropdown"
                      className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
                      role="dialog"
                      aria-label="앱 검색"
                    >
                      <div className="p-3">
                        <label htmlFor="app-search-input" className="sr-only">
                          앱 검색어 입력
                        </label>
                        <input
                          id="app-search-input"
                          type="text"
                          placeholder="앱 검색..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                          role="searchbox"
                          aria-label="앱 검색어 입력"
                        />
                      </div>

                      <div
                        className="border-t border-gray-700"
                        role="list"
                        aria-label="검색 결과"
                      >
                        {filteredApps.length > 0 ? (
                          filteredApps.map((app) => (
                            <Link
                              key={app.id}
                              href={app.path}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-700 transition-colors"
                              role="listitem"
                            >
                              <div className="text-2xl" aria-hidden="true">
                                {app.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white">
                                  {app.name}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {app.description}
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div
                            className="px-4 py-6 text-center text-gray-500 text-sm"
                            role="status"
                          >
                            검색 결과가 없습니다
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* API Key Status */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border"
                role="status"
                aria-label={
                  hasKey ? 'API 키가 등록되어 있습니다' : 'API 키가 필요합니다'
                }
              >
                {hasKey ? (
                  <>
                    <span
                      className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-green-400">
                      API 키 등록됨
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-yellow-400">API 키 필요</span>
                  </>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="API 키 설정 열기"
              >
                <span className="text-lg" aria-hidden="true">
                  🔑
                </span>
                <span className="hidden sm:inline text-sm font-medium text-gray-300">
                  설정
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
            <Link
              href="/apps/audio-generator/create"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                isActive('/apps/audio-generator')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              <Music className="w-4 h-4" />
              오디오
            </Link>

            <Link
              href="/apps/art-generator/create"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                isActive('/apps/art-generator')
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              아트
            </Link>

            <Link
              href="/library"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                isActive('/library')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              <Library className="w-4 h-4" />
              라이브러리
            </Link>
          </div>
        </div>
      </nav>

      {/* API Key Settings Modal */}
      <ApiKeySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Spacer for fixed nav */}
      <div className="h-16 md:h-16" />
    </>
  );
}

// React.memo로 컴포넌트 메모이제이션
export default memo(GlobalNav);
