'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ART_STYLE_PRESETS, type ArtStyle } from '@/lib/art/types';
import { useArtStore } from '@/lib/stores/art-store';

export default function ArtGeneratorPage() {
  const router = useRouter();
  const setSelectedStyle = useArtStore((state) => state.setSelectedStyle);

  const handleStyleSelect = (style: ArtStyle) => {
    setSelectedStyle(style);
    router.push('/apps/art-generator/create');
  };

  return (
    <main className="min-h-screen relative z-10">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-20 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="inline-block text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← 홈으로 돌아가기
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/apps/art-generator/gallery"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              🖼️ 갤러리
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 glow-text-purple">
            🎨 AI 2D 게임 아트 생성기
          </h1>
          <p className="text-xl text-gray-300">
            원하는 스타일을 선택하고 AI로 게임 아트를 생성하세요
          </p>
        </div>

        {/* Style Presets */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">아트 스타일 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(ART_STYLE_PRESETS).map((preset) => (
              <button
                key={preset.style}
                onClick={() => handleStyleSelect(preset.style)}
                className="app-card text-left hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform">
                    {preset.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>권장: {preset.recommendedResolution}</span>
                      <span>•</span>
                      <span>비율: {preset.aspectRatio}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">예시 프롬프트:</p>
                  <div className="flex flex-wrap gap-2">
                    {preset.examples.slice(0, 2).map((example, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400"
                      >
                        {example.split(' ').slice(0, 4).join(' ')}...
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="app-card bg-purple-900/20 border-purple-500/30">
          <h3 className="text-lg font-bold text-white mb-4">빠른 시작</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/apps/art-generator/create"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="text-2xl">🎨</div>
              <div>
                <div className="font-semibold text-white">직접 생성하기</div>
                <div className="text-sm text-gray-400">
                  스타일 선택 없이 바로 시작
                </div>
              </div>
            </Link>
            <Link
              href="/apps/art-generator/gallery"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="text-2xl">🖼️</div>
              <div>
                <div className="font-semibold text-white">갤러리 보기</div>
                <div className="text-sm text-gray-400">생성된 이미지 확인</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
