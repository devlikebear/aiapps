'use client';

import Link from 'next/link';

type AppStatus = 'available' | 'coming-soon';

interface AppInfo {
  id: string;
  name: string;
  icon: string;
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
    category: 'Audio',
    description: 'Gemini Lyria 기반 실시간 게임 음악 생성',
    status: 'available',
    href: '/apps/audio-generator',
  },
  {
    id: 'art-generator',
    name: 'AI Art Generator',
    icon: '🎨',
    category: 'Image',
    description: 'Gemini Flash Image로 2D 게임 아트 생성',
    status: 'available',
    href: '/apps/art-generator',
  },
  {
    id: 'sprite-generator',
    name: 'AI Sprite Generator',
    icon: '🎮',
    category: 'Animation',
    description: '참조 애니메이션에서 캐릭터를 교체하여 스프라이트 생성',
    status: 'available',
    href: '/apps/sprite-generator',
  },
  {
    id: 'video-generator',
    name: 'AI Video Generator',
    icon: '🎬',
    category: 'Video',
    description: 'AI 기반 게임 트레일러 영상 생성',
    status: 'coming-soon',
  },
  {
    id: 'story-generator',
    name: 'AI Story Generator',
    icon: '📖',
    category: 'Text',
    description: 'AI가 만드는 게임 스토리 및 대화',
    status: 'coming-soon',
  },
];

export default function AppsPage() {
  const availableApps = apps.filter((app) => app.status === 'available');
  const comingSoonApps = apps.filter((app) => app.status === 'coming-soon');

  return (
    <main className="min-h-screen relative z-10">
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-20 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block text-sky-400 hover:text-sky-300 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text glow-text">
            All AI Apps
          </h1>
          <p className="text-xl text-gray-300">
            모든 AI 기반 크리에이티브 도구 목록
          </p>
        </div>

        {/* Available Apps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">
            사용 가능한 앱 ({availableApps.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableApps.map((app) => (
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

        {/* Coming Soon */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">
            Coming Soon ({comingSoonApps.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoonApps.map((app) => (
              <div key={app.id} className="app-card opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-5xl grayscale">{app.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-400">
                        {app.name}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-700/50 border border-gray-600 text-gray-400">
                        {app.category}
                      </span>
                    </div>
                    <p className="text-gray-500 leading-relaxed">
                      {app.description}
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-gray-700/30 border border-gray-600/50 text-gray-500 rounded text-sm font-semibold">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
