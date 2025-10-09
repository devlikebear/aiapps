import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          AI Game Audio Generator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Powered by Gemini Lyria RealTime
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audio/create"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            음악 생성하기
          </Link>
          <Link
            href="/audio/library"
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            라이브러리 보기
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🎵</div>
            <h3 className="font-semibold mb-2">실시간 생성</h3>
            <p className="text-sm text-gray-600">
              WebSocket 기반 실시간 스트리밍으로 빠르게 음악을 생성합니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="font-semibold mb-2">게임 음악 특화</h3>
            <p className="text-sm text-gray-600">
              BGM, 효과음 등 게임에 최적화된 오디오를 생성합니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold mb-2">세밀한 조정</h3>
            <p className="text-sm text-gray-600">
              BPM, 밀도, 밝기, 악기 등을 자유롭게 조정할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
