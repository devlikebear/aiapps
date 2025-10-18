'use client';

import Link from 'next/link';
import {
  Sparkles,
  Settings2,
  BarChart3,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function TweetGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              트윗 생성기
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Gemini AI를 사용해 매력적인 트윗을 자동으로 생성하세요.
            <br />
            톤과 길이를 설정해 원하는 스타일의 트윗을 만들어보세요.
          </p>
        </div>

        {/* 주요 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* 빠른 생성 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-sky-500/50 transition-all">
            <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-white font-semibold mb-1">빠른 생성</p>
            <p className="text-sm text-gray-400">
              프롬프트만 입력하면 AI가 즉시 트윗을 생성합니다
            </p>
          </div>

          {/* 톤 설정 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
              <Settings2 className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-white font-semibold mb-1">톤 설정</p>
            <p className="text-sm text-gray-400">
              Casual, Professional, Humorous, Inspirational
            </p>
          </div>

          {/* 프리셋 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-white font-semibold mb-1">프리셋</p>
            <p className="text-sm text-gray-400">
              원하는 설정을 프리셋으로 저장하고 재사용
            </p>
          </div>

          {/* 라이브러리 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-pink-500/50 transition-all">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-white font-semibold mb-1">라이브러리</p>
            <p className="text-sm text-gray-400">
              생성한 트윗을 저장하고 관리합니다
            </p>
          </div>
        </div>

        {/* CTA 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* 생성 시작 */}
          <Link
            href="/apps/tweet-generator/create"
            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            트윗 생성 시작
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* 프리셋 관리 */}
          <Link
            href="/apps/tweet-generator/presets"
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-gray-700"
          >
            <BarChart3 className="w-5 h-5" />
            프리셋 관리
          </Link>

          {/* 라이브러리 */}
          <Link
            href="/apps/tweet-generator/library"
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-gray-700"
          >
            <BookOpen className="w-5 h-5" />내 트윗 라이브러리
          </Link>
        </div>

        {/* 팁 섹션 */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4">✨ 팁</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✓ 구체적인 프롬프트일수록 더 좋은 트윗이 생성됩니다</li>
            <li>✓ 톤을 선택해 원하는 스타일의 트윗을 만들어보세요</li>
            <li>✓ 자주 사용하는 설정은 프리셋으로 저장하면 편합니다</li>
            <li>✓ 생성된 트윗은 언제든 라이브러리에서 확인할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
