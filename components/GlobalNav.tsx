'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Music, ImageIcon, Library } from 'lucide-react';
import { hasApiKey } from '@/lib/api-key/storage';
import ApiKeySettings from './ApiKeySettings';

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

export default function GlobalNav() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setHasKey(hasApiKey('gemini'));
  }, [isSettingsOpen]);

  const filteredApps = APPS.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-2xl group-hover:scale-110 transition-transform">
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
            <div className="hidden md:flex items-center gap-2">
              {/* Audio Generator */}
              <Link
                href="/apps/audio-generator/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/apps/audio-generator')
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Music className="w-4 h-4" />
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
              >
                <ImageIcon className="w-4 h-4" />
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
              >
                <Library className="w-4 h-4" />
                <span className="text-sm font-medium">라이브러리</span>
              </Link>
            </div>

            {/* Right - Search & Settings */}
            <div className="flex items-center gap-3">
              {/* App Search (Desktop) */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                >
                  <Search className="w-4 h-4" />
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
                    <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                      <div className="p-3">
                        <input
                          type="text"
                          placeholder="앱 검색..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                      </div>

                      <div className="border-t border-gray-700">
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
                            >
                              <div className="text-2xl">{app.icon}</div>
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
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            검색 결과가 없습니다
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* API Key Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border">
                {hasKey ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">
                      API 키 등록됨
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-xs text-yellow-400">API 키 필요</span>
                  </>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title="API 키 설정"
              >
                <span className="text-lg">🔑</span>
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
