'use client';

import Link from 'next/link';

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
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold gradient-text glow-text">
            AI Tools Hub
          </h1>
          <p className="text-xl md:text-2xl text-sky-300 font-medium">
            AI 기반 크리에이티브 앱 컬렉션
          </p>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Gemini AI를 활용한 다양한 크리에이티브 도구들을 만나보세요. 음악,
            아트, 영상 등 AI가 당신의 창작을 돕습니다.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/apps" className="btn-primary">
              앱 둘러보기
            </Link>
            <Link
              href="https://github.com/devlikebear/aiapps"
              className="btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </section>

        {/* Featured Apps */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Featured Apps
            </h2>
            <p className="text-gray-400">현재 사용 가능한 AI 앱들</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredApps.map((app) => (
              <Link
                key={app.id}
                href={app.href || '#'}
                className="app-card-featured group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{app.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                        {app.name}
                      </h3>
                      <span className="feature-badge">{app.category}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Apps */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              All Apps
            </h2>
            <p className="text-gray-400">모든 AI 앱 목록</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div key={app.id} className="app-card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">{app.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
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
                    className="inline-block px-4 py-2 bg-sky-500/20 border border-sky-500/50 text-sky-300 rounded-lg text-sm font-semibold hover:bg-sky-500/30 hover:border-sky-400 transition-all"
                  >
                    앱 실행 →
                  </Link>
                ) : (
                  <div className="inline-block px-4 py-2 bg-gray-700/30 border border-gray-600/50 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="app-card text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">실시간 생성</h3>
              <p className="text-gray-400 text-sm">
                Gemini AI의 강력한 성능으로 빠르고 정확한 결과물을 생성합니다
              </p>
            </div>

            <div className="app-card text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">게임 특화</h3>
              <p className="text-gray-400 text-sm">
                게임 개발에 최적화된 에셋 생성 파라미터와 프리셋을 제공합니다
              </p>
            </div>

            <div className="app-card text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-white mb-2">세밀한 조정</h3>
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
