'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

type AppStatus = 'available' | 'coming-soon';
type AppColor = 'blue' | 'purple' | 'pink' | 'cyan' | 'green';

interface AppInfo {
  id: string;
  name: string;
  icon: string;
  color: AppColor;
  category: string;
  description: string;
  status: AppStatus;
  href?: string;
}

const apps: AppInfo[] = [
  {
    id: 'audio-generator',
    name: 'AI Music Generator',
    icon: '🎵',
    color: 'blue',
    category: 'Audio',
    description: 'Gemini Lyria 기반 실시간 게임 음악 생성',
    status: 'available',
    href: '/apps/audio-generator',
  },
  {
    id: 'art-generator',
    name: 'AI Art Generator',
    icon: '🎨',
    color: 'purple',
    category: 'Image',
    description: 'Gemini Flash Image로 2D 게임 아트 생성',
    status: 'available',
    href: '/apps/art-generator',
  },
  {
    id: 'video-generator',
    name: 'AI Video Generator',
    icon: '🎬',
    color: 'pink',
    category: 'Video',
    description: 'AI 기반 게임 트레일러 영상 생성',
    status: 'coming-soon',
  },
  {
    id: 'story-generator',
    name: 'AI Story Generator',
    icon: '📖',
    color: 'cyan',
    category: 'Text',
    description: 'AI가 만드는 게임 스토리 및 대화',
    status: 'coming-soon',
  },
];

const featuredApps = apps.filter((app) => app.status === 'available');

export default function Home() {
  return (
    <main className="min-h-screen relative z-10">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-20 md:py-28 space-y-12 sm:space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text glow-text px-4">
            AI Tools Hub
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-sky-300 font-medium px-4">
            AI 기반 크리에이티브 앱 컬렉션
          </p>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            Gemini AI를 활용한 다양한 크리에이티브 도구들을 만나보세요. 음악,
            아트, 영상 등 AI가 당신의 창작을 돕습니다.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center pt-4 px-4">
            <Link
              href="/onboarding"
              className="btn-primary touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              🚀 시작하기 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/help"
              className="btn-outline touch-target w-full sm:w-auto"
            >
              사용 가이드
            </Link>
            <Link
              href="https://github.com/devlikebear/aiapps"
              className="btn-outline touch-target w-full sm:w-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </section>

        {/* API Key Setup Notice */}
        <section className="mt-8 px-4">
          <div className="app-card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-sm">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  ⚡ Gemini API 키가 필요합니다
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  이 앱을 사용하려면 Google Cloud Console에서 Gemini API 키를
                  생성하고 설정해야 합니다.
                  <strong className="text-amber-300">
                    {' '}
                    API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                  </strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/onboarding"
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all inline-flex items-center justify-center gap-2 touch-target"
                  >
                    API 키 설정 가이드 <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="https://console.cloud.google.com/apis/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg font-medium text-sm transition-all inline-flex items-center justify-center gap-2 touch-target"
                  >
                    Google Cloud Console 열기 ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Apps */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Featured Apps
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              현재 사용 가능한 AI 앱들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {featuredApps.map((app) => (
              <Link
                key={app.id}
                href={app.href || '#'}
                className="app-card-featured group touch-target"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="text-4xl sm:text-5xl">{app.icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                        {app.name}
                      </h3>
                      <span className="feature-badge">{app.category}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Apps */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              All Apps
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              모든 AI 앱 목록
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {apps.map((app) => (
              <div key={app.id} className="app-card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl sm:text-4xl">{app.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {app.name}
                    </h3>
                    <span className="text-xs text-sky-400 font-semibold uppercase">
                      {app.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {app.description}
                </p>

                {app.status === 'available' ? (
                  <Link
                    href={app.href || '#'}
                    className="inline-block px-4 py-2 bg-sky-500/20 border border-sky-500/50 text-sky-300 rounded-lg text-sm font-semibold hover:bg-sky-500/30 hover:border-sky-400 transition-all touch-target w-full sm:w-auto text-center"
                  >
                    앱 실행 →
                  </Link>
                ) : (
                  <div className="inline-block px-4 py-2 bg-gray-700/30 border border-gray-600/50 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed touch-target w-full sm:w-auto text-center">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="app-card text-center">
              <div className="text-3xl sm:text-4xl mb-4">⚡</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                실시간 생성
              </h3>
              <p className="text-gray-400 text-sm">
                Gemini AI의 강력한 성능으로 빠르고 정확한 결과물을 생성합니다
              </p>
            </div>

            <div className="app-card text-center">
              <div className="text-3xl sm:text-4xl mb-4">🎯</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                게임 특화
              </h3>
              <p className="text-gray-400 text-sm">
                게임 개발에 최적화된 에셋 생성 파라미터와 프리셋을 제공합니다
              </p>
            </div>

            <div className="app-card text-center">
              <div className="text-3xl sm:text-4xl mb-4">🔧</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                세밀한 조정
              </h3>
              <p className="text-gray-400 text-sm">
                다양한 파라미터를 통해 원하는 스타일의 결과물을 만들 수 있습니다
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
