'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { hasApiKey } from '@/lib/api-key/storage';
import ApiKeySettings from './ApiKeySettings';

export default function AppHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // 마운트 시 API 키 존재 여부 확인
    setHasKey(hasApiKey('gemini'));
  }, [isSettingsOpen]); // 설정 모달이 닫힐 때마다 재확인

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl">🤖</div>
            <div>
              <h1 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                AI Tools Hub
              </h1>
              <p className="text-xs text-gray-400">Powered by Gemini AI</p>
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-4">
            {/* API 키 상태 표시 */}
            {!hasKey && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <span className="text-yellow-400 text-xs">⚠️</span>
                <span className="text-xs text-yellow-300">API 키 필요</span>
              </div>
            )}

            {hasKey && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-xs text-green-300">API 키 등록됨</span>
              </div>
            )}

            {/* API 키 설정 버튼 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700
                       border border-gray-700 rounded-lg transition-colors"
              title="API 키 설정"
            >
              <span className="text-lg">🔑</span>
              <span className="hidden sm:inline text-sm font-medium">
                API 키 설정
              </span>
            </button>

            {/* 앱 목록 버튼 */}
            <Link
              href="/apps"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500
                       rounded-lg transition-colors"
            >
              <span className="text-lg">🎨</span>
              <span className="hidden sm:inline text-sm font-medium">
                앱 목록
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* API 키 설정 모달 */}
      <ApiKeySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
