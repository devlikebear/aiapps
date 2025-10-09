import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          AI 2D Game Art Generator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Powered by Gemini 2.5 Flash Image
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/art/create"
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            아트 생성하기
          </Link>
          <Link
            href="/art/library"
            className="px-8 py-4 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            라이브러리 보기
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold mb-2">Text-to-Image</h3>
            <p className="text-sm text-gray-600">
              프롬프트로 원하는 게임 아트를 즉시 생성합니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">✏️</div>
            <h3 className="font-semibold mb-2">이미지 편집</h3>
            <p className="text-sm text-gray-600">
              기존 이미지를 AI로 편집하고 개선합니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🖼️</div>
            <h3 className="font-semibold mb-2">이미지 합성</h3>
            <p className="text-sm text-gray-600">
              여러 이미지를 하나로 합성합니다
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🎭</div>
            <h3 className="font-semibold mb-2">스타일 전이</h3>
            <p className="text-sm text-gray-600">
              원하는 스타일을 이미지에 적용합니다
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
