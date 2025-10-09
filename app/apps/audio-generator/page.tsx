'use client';

import Link from 'next/link';

export default function AudioGeneratorPage() {
  return (
    <main className="min-h-screen relative z-10">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-20 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block text-sky-400 hover:text-sky-300 transition-colors mb-4"
          >
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text glow-text">
            🎵 AI Music Generator
          </h1>
          <p className="text-xl text-gray-300">
            Gemini Lyria 기반 실시간 게임 음악 생성
          </p>
        </div>

        {/* Description */}
        <div className="app-card space-y-4">
          <h2 className="text-2xl font-bold text-white">소개</h2>
          <p className="text-gray-300 leading-relaxed">
            AI Music Generator는 Gemini Lyria RealTime을 활용하여 게임에
            최적화된 배경 음악과 효과음을 실시간으로 생성합니다. BPM, 밀도,
            밝기, 악기 등 다양한 파라미터를 조정하여 원하는 분위기의 음악을 만들
            수 있습니다.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="app-card text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">실시간 생성</h3>
            <p className="text-gray-400 text-sm">
              WebSocket 기반 스트리밍으로 빠른 음악 생성
            </p>
          </div>

          <div className="app-card text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-white mb-2">게임 특화</h3>
            <p className="text-gray-400 text-sm">
              BGM, 효과음 등 게임 오디오에 최적화
            </p>
          </div>

          <div className="app-card text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-lg font-bold text-white mb-2">세밀한 조정</h3>
            <p className="text-gray-400 text-sm">
              BPM, 밀도, 밝기, 악기 등 다양한 파라미터
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-8">
          <Link href="/apps/audio-generator/create" className="btn-primary">
            음악 생성하기
          </Link>
          <Link href="/apps/audio-generator/library" className="btn-outline">
            라이브러리
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
                이 앱은 현재 개발 중입니다. 실제 음악 생성 기능은 Gemini Lyria
                API 연동 후 사용 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
