'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import StepCard from '@/components/onboarding/StepCard';
import SecurityBadge from '@/components/onboarding/SecurityBadge';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 py-12">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent mb-4">
            AI Apps 시작하기
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Gemini API를 사용하여 AI 오디오와 아트를 생성해보세요. API 키는
            당신의 브라우저에만 저장되며, 서버에 전송되지 않습니다.
          </p>
        </div>

        {/* 보안 안내 */}
        <SecurityBadge message="✅ API 키는 브라우저 로컬 저장소에만 저장되며, 서버로 전송되지 않습니다." />
      </div>

      {/* 단계별 가이드 */}
      <div className="max-w-4xl mx-auto px-4 space-y-6 mb-12">
        {/* Step 1 */}
        <StepCard
          step={1}
          title="Google Cloud Console 접속"
          description="Google Cloud 콘솔에서 Gemini API를 활성화합니다"
        >
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">1.</span>
              <span>
                아래 링크에서 Google Cloud Console 접속
                <br />
                <Link
                  href="https://console.cloud.google.com/apis/dashboard"
                  target="_blank"
                  className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 mt-1"
                >
                  console.cloud.google.com/apis/dashboard
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">2.</span>
              <span>Google 계정으로 로그인</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">3.</span>
              <span>새 프로젝트를 생성하거나 기존 프로젝트 선택</span>
            </li>
          </ol>
        </StepCard>

        {/* Step 2 */}
        <StepCard
          step={2}
          title="Gemini API 활성화"
          description="프로젝트에서 필요한 API들을 활성화합니다"
        >
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">1.</span>
              <span>
                상단 검색창에
                <code className="bg-gray-800 px-2 py-1 rounded text-sky-300 mx-1">
                  Gemini
                </code>
                검색
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">2.</span>
              <span>검색 결과에서 각 API 활성화:</span>
            </li>
            <li className="ml-8 space-y-2">
              <div>✓ Generative Language API (오디오/이미지 생성)</div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">3.</span>
              <span>각 API마다 &quot;활성화&quot; 버튼 클릭</span>
            </li>
          </ol>
        </StepCard>

        {/* Step 3 */}
        <StepCard
          step={3}
          title="API 키 생성"
          description="애플리케이션에서 사용할 API 키를 생성합니다"
        >
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">1.</span>
              <span>
                좌측 사이드바에서
                <code className="bg-gray-800 px-2 py-1 rounded text-sky-300 mx-1">
                  사용자 인증 정보
                </code>
                클릭
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">2.</span>
              <span>
                <code className="bg-gray-800 px-2 py-1 rounded text-sky-300">
                  + 사용자 인증 정보 만들기
                </code>
                클릭
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">3.</span>
              <span>
                드롭다운에서
                <code className="bg-gray-800 px-2 py-1 rounded text-sky-300 mx-1">
                  API 키
                </code>
                선택
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-sky-400 font-bold">4.</span>
              <span>새로운 API 키가 생성됩니다 (자동 복사됨)</span>
            </li>
          </ol>
        </StepCard>

        {/* Step 4 */}
        <StepCard
          step={4}
          title="API 키 앱에 저장"
          description="생성한 API 키를 AI Apps에 저장합니다"
        >
          <div className="space-y-4 text-gray-300">
            <div>
              <p className="font-semibold text-white mb-2">
                방법 1: 설정 페이지에서
              </p>
              <ol className="space-y-2 ml-4">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-sky-400">→</span>
                  <span>우측 상단 ⚙️ 버튼 클릭</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-sky-400">→</span>
                  <span>&quot;API 키 설정&quot; 섹션에 API 키 입력</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-sky-400">→</span>
                  <span>&quot;저장&quot; 버튼 클릭</span>
                </li>
              </ol>
            </div>

            {/* 보안 알림 */}
            <SecurityBadge
              variant="secure"
              message="🔒 입력한 API 키는 100% 로컬 저장소에만 저장되며, 서버로 전송되지 않습니다."
            />
          </div>
        </StepCard>

        {/* Step 5 */}
        <StepCard
          step={5}
          title="앱 사용 시작"
          description="이제 AI 컨텐츠 생성을 시작할 수 있습니다"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">
                  🎵 오디오 생성기
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  프롬프트를 입력하여 게임 배경음악과 효과음을 생성하세요
                </p>
                <Link
                  href="/apps/audio-generator/create"
                  className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium"
                >
                  시작하기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">🎨 아트 생성기</p>
                <p className="text-sm text-gray-400 mb-3">
                  프롬프트로 2D 게임 아트와 캐릭터를 생성하세요
                </p>
                <Link
                  href="/apps/art-generator/create"
                  className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium"
                >
                  시작하기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                💡 <strong>팁:</strong> 처음 사용하신다면{' '}
                <Link
                  href="/help"
                  className="text-sky-400 hover:text-sky-300 underline"
                >
                  상세 가이드
                </Link>
                를 확인해보세요!
              </p>
            </div>
          </div>
        </StepCard>
      </div>

      {/* FAQ 섹션 */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="app-card">
          <h2 className="text-2xl font-bold text-white mb-6">
            자주 묻는 질문 (FAQ)
          </h2>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                🔒 API 키가 안전한가요?
              </h3>
              <p className="text-gray-400 text-sm">
                네, 완전히 안전합니다. API 키는 당신의 브라우저 로컬 저장소에만
                저장되며, 서버로 전송되지 않습니다. 따라서 이 앱의 서버는 API
                키에 접근할 수 없으며, 당신의 API 키는 100% 당신의 컴퓨터에
                의해서만 사용됩니다.
              </p>
            </div>

            {/* FAQ 2 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                💰 비용이 드나요?
              </h3>
              <p className="text-gray-400 text-sm">
                이 앱 자체는 무료입니다. 하지만 Gemini API 사용에는 요금이
                발생할 수 있습니다. Google Cloud 콘솔에서 프리 티어 한도와 현재
                사용량을 확인할 수 있습니다.
                <Link
                  href="https://ai.google.dev/pricing"
                  target="_blank"
                  className="text-sky-400 hover:text-sky-300 ml-1 inline-flex items-center gap-1"
                >
                  가격 정보 확인
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
            </div>

            {/* FAQ 3 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🗑️ API 키를 삭제하려면?
              </h3>
              <p className="text-gray-400 text-sm">
                설정 페이지에서 API 키 입력 필드를 비우고 저장하면 됩니다. 또는
                브라우저의 로컬 저장소를 지우면 됩니다.
              </p>
            </div>

            {/* FAQ 4 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🚨 API 키를 실수로 공개했다면?
              </h3>
              <p className="text-gray-400 text-sm">
                Google Cloud 콘솔에서 해당 API 키를 즉시 삭제하고 새 API 키를
                생성하세요. 새 API 키를 이 앱에 저장하면 됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="flex gap-4 justify-center">
          <Link
            href="/help"
            className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
          >
            상세 가이드 보기
          </Link>
          <Link
            href="/apps/audio-generator/create"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white font-medium transition-colors inline-flex items-center gap-2"
          >
            오디오 생성 시작 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
