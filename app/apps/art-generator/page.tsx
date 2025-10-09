'use client';

import Link from 'next/link';

export default function ArtGeneratorPage() {
  return (
    <main className="min-h-screen relative z-10">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-20 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 glow-text-purple">
            🎨 AI Art Generator
          </h1>
          <p className="text-xl text-gray-300">
            Gemini 2.5 Flash Image로 2D 게임 아트 생성
          </p>
        </div>

        {/* Description */}
        <div className="app-card space-y-4">
          <h2 className="text-2xl font-bold text-white">소개</h2>
          <p className="text-gray-300 leading-relaxed">
            AI Art Generator는 Gemini 2.5 Flash Image를 활용하여 2D 게임에
            필요한 다양한 아트 에셋을 생성합니다. 캐릭터, 배경, 아이템 등 원하는
            스타일의 픽셀 아트, 애니메이션 스타일 이미지를 손쉽게 만들 수
            있습니다.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="app-card text-center">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-white mb-2">Text-to-Image</h3>
            <p className="text-gray-400 text-sm">프롬프트로 즉시 이미지 생성</p>
          </div>

          <div className="app-card text-center">
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-lg font-bold text-white mb-2">이미지 편집</h3>
            <p className="text-gray-400 text-sm">AI로 이미지 편집 및 개선</p>
          </div>

          <div className="app-card text-center">
            <div className="text-4xl mb-3">🖼️</div>
            <h3 className="text-lg font-bold text-white mb-2">이미지 합성</h3>
            <p className="text-gray-400 text-sm">여러 이미지를 하나로 합성</p>
          </div>

          <div className="app-card text-center">
            <div className="text-4xl mb-3">🎭</div>
            <h3 className="text-lg font-bold text-white mb-2">스타일 전이</h3>
            <p className="text-gray-400 text-sm">원하는 스타일 적용</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-8">
          <Link href="/apps/art-generator/create" className="btn-secondary">
            아트 생성하기
          </Link>
          <Link href="/apps/art-generator/gallery" className="btn-outline">
            갤러리
          </Link>
        </div>

        {/* Coming Soon Notice */}
        <div className="app-card bg-yellow-900/20 border-yellow-500/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-yellow-300 mb-1">
                개발 중
              </h3>
              <p className="text-gray-300 text-sm">
                이 앱은 현재 개발 중입니다. 실제 이미지 생성 기능은 Gemini Flash
                Image API 연동 후 사용 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
