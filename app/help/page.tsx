'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music, Palette, Library, ChevronDown, ArrowLeft } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FeatureGuide {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tips: string[];
  faq: FAQItem[];
}

export default function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string>('audio');

  const features: Record<string, FeatureGuide> = {
    audio: {
      id: 'audio',
      title: '🎵 오디오 생성기',
      icon: Music,
      description:
        'Gemini Lyria를 사용하여 게임 배경음악과 효과음을 생성합니다',
      tips: [
        '프롬프트는 구체적일수록 좋습니다. 예: "Epic orchestral battle music with heroic strings"',
        'BPM (Beats Per Minute): 음악의 템포 조정 (60-200)',
        'Density: 음악의 밀도 (0-1) - 낮을수록 심플, 높을수록 복잡',
        'Brightness: 음악의 밝기 (0-1) - 낮을수록 어두운 분위기',
        'Duration: 생성할 음악의 길이 (최대 30초)',
        '생성된 음악은 .wav 형식으로 다운로드 가능합니다',
        'Google Drive에 저장하여 다른 사람과 공유할 수 있습니다',
      ],
      faq: [
        {
          question: '오디오 생성이 실패하면?',
          answer:
            'API 키가 올바른지 확인하고, Generative Language API가 활성화되어 있는지 확인하세요. 또한 프롬프트가 너무 길거나 부적절한 내용이 아닌지 확인하세요.',
        },
        {
          question: '생성된 오디오를 수정할 수 있나요?',
          answer:
            '현재 앱에서는 직접 수정 기능을 제공하지 않습니다. 다른 파라미터로 다시 생성하거나, 외부 오디오 편집 툴을 사용하세요.',
        },
        {
          question: '생성된 오디오의 저작권은?',
          answer:
            '생성된 오디오는 당신의 소유입니다. Google의 정책에 따라 자유롭게 사용하고 배포할 수 있습니다. 자세한 내용은 Google AI 약관을 확인하세요.',
        },
        {
          question: '최대 생성 길이는?',
          answer: '현재 최대 30초의 오디오를 생성할 수 있습니다.',
        },
      ],
    },
    art: {
      id: 'art',
      title: '🎨 아트 생성기',
      icon: Palette,
      description:
        'Gemini 2.5 Flash Image를 사용하여 2D 게임 아트와 캐릭터를 생성합니다',
      tips: [
        '프롬프트는 구체적이고 상세할수록 좋습니다. 예: "2D pixel art fantasy warrior with blue armor and sword"',
        '스타일을 지정하면 더 일관된 결과를 얻을 수 있습니다 (pixel art, digital art, realistic 등)',
        '해상도를 높게 설정하면 더 정교한 이미지를 얻을 수 있지만 생성 시간이 길어집니다',
        '같은 시드 값으로 여러 번 생성하면 비슷한 결과를 얻을 수 있습니다',
        '생성된 이미지는 PNG 형식으로 저장되며 SynthID 워터마크가 포함됩니다',
        '이미지 편집 기능으로 생성된 이미지를 수정할 수 있습니다',
        '여러 이미지를 합성하여 새로운 이미지를 만들 수 있습니다',
      ],
      faq: [
        {
          question: '원하는 이미지가 생성되지 않으면?',
          answer:
            '프롬프트를 더 자세히 설명해보세요. 스타일, 색상, 세부사항을 명시하면 더 좋은 결과를 얻을 수 있습니다. 여러 번 시도하는 것도 좋습니다.',
        },
        {
          question: '이미지 편집은 어떻게 하나요?',
          answer:
            '생성된 이미지를 선택한 후 "편집" 버튼으로 마스킹 영역을 지정하고 편집할 부분에 대한 프롬프트를 입력하면 됩니다.',
        },
        {
          question: '여러 이미지를 합성하려면?',
          answer:
            '라이브러리에서 여러 이미지를 선택한 후 "합성" 버튼으로 합성할 수 있습니다. 합성을 원하는 스타일에 대한 프롬프트를 입력하세요.',
        },
        {
          question: '생성된 이미지의 저작권은?',
          answer:
            '생성된 이미지는 당신의 소유입니다. 자유롭게 사용하고 배포할 수 있습니다. SynthID 워터마크는 AI 생성 이미지임을 나타냅니다.',
        },
      ],
    },
    library: {
      id: 'library',
      title: '📚 라이브러리',
      icon: Library,
      description: '생성한 모든 오디오와 이미지를 관리하고 공유합니다',
      tips: [
        '라이브러리는 로컬 브라우저 저장소에 저장되므로 같은 브라우저에서만 접근 가능합니다',
        'Google Drive에 미디어를 저장하여 백업 및 공유를 할 수 있습니다',
        '저장된 미디어는 검색 가능하며 필터링할 수 있습니다',
        'SNS (Twitter, Instagram, Email)로 직접 공유할 수 있습니다',
        'Google Drive 링크를 통해 누구나 생성된 미디어에 접근할 수 있습니다',
        '라이브러리에서 미디어를 삭제할 수 있습니다',
        '브라우저 캐시를 삭제하면 로컬 미디어가 사라질 수 있습니다',
      ],
      faq: [
        {
          question: '라이브러리가 비어있으면?',
          answer:
            '로컬 저장소에 저장된 미디어만 표시됩니다. 새로 생성한 오디오나 이미지는 자동으로 라이브러리에 추가됩니다.',
        },
        {
          question: '다른 기기에서 라이브러리 접근 가능?',
          answer:
            'Google Drive에 저장한 미디어는 다른 기기에서도 접근 가능합니다. 로컬 저장소의 미디어는 현재 기기/브라우저에서만 접근 가능합니다.',
        },
        {
          question: '공유 링크를 비활성화할 수 있나요?',
          answer:
            'Google Drive에서 파일의 공유 설정을 변경하면 링크 공유를 비활성화할 수 있습니다.',
        },
        {
          question: '라이브러리에서 미디어를 영구 삭제하려면?',
          answer:
            '라이브러리에서 미디어를 삭제한 후, Google Drive에도 파일을 삭제해야 완전히 제거됩니다.',
        },
      ],
    },
    tweet: {
      id: 'tweet',
      title: '✨ 트윗 생성기',
      icon: Library,
      description: 'AI 기반 트윗 자동 생성 및 톤/길이 설정',
      tips: [
        '프롬프트는 구체적일수록 좋습니다. 예: "Game development update announcement"',
        '톤 선택: Casual (친근함), Professional (격식), Humorous (재미), Inspirational (영감)',
        '길이 선택: Short (140자), Medium (200자), Long (280자)',
        '해시태그 옵션으로 트윗에 자동으로 관련 해시태그를 추가할 수 있습니다',
        '이모지 옵션으로 트윗에 이모지를 포함할 수 있습니다',
        '프리셋을 저장하여 자주 사용하는 설정을 재사용할 수 있습니다',
        '생성된 트윗은 로컬 라이브러리에 자동 저장되며 언제든 다시 사용할 수 있습니다',
      ],
      faq: [
        {
          question: '트윗 생성이 실패하면?',
          answer:
            'API 키가 올바른지 확인하고, 프롬프트가 너무 길지 않은지 확인하세요. 길이 제한을 초과하면 재생성됩니다.',
        },
        {
          question: '트윗 길이를 정확히 조정할 수 있나요?',
          answer:
            '선택한 길이(140/200/280자)를 목표로 생성되며, 정확한 길이는 AI 생성 특성상 약간 달라질 수 있습니다.',
        },
        {
          question: '프리셋을 어떻게 사용하나요?',
          answer:
            '프리셋 관리 페이지에서 자주 사용하는 톤, 길이, 옵션 조합을 저장할 수 있습니다. 생성 페이지에서 프리셋을 선택하면 설정이 자동으로 적용됩니다.',
        },
        {
          question: '생성된 트윗을 편집할 수 있나요?',
          answer:
            '라이브러리에서 생성된 트윗을 확인하고 수동으로 편집할 수 있습니다. 복사 버튼으로 트윗을 클립보드에 복사하여 사용할 수 있습니다.',
        },
      ],
    },
  };

  const currentFeature = features[activeFeature];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 py-12">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent mb-4">
            사용 가이드
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            각 기능의 상세한 사용법과 팁을 확인하세요
          </p>
        </div>
      </div>

      {/* 기능 선택 탭 */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(features).map(([key, feature]) => (
            <button
              key={key}
              onClick={() => setActiveFeature(key)}
              className={`p-4 rounded-lg text-left transition-all ${
                activeFeature === key
                  ? 'bg-gradient-to-r from-sky-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 text-lg font-semibold">
                <feature.icon className="w-6 h-6" />
                {feature.title}
              </div>
              <p className="text-sm mt-1 opacity-90">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 팁 섹션 */}
        <div className="lg:col-span-2">
          <div className="app-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              💡 {currentFeature.title} 팁
            </h2>

            <div className="space-y-4">
              {currentFeature.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ 섹션 */}
          <div className="app-card">
            <h2 className="text-2xl font-bold text-white mb-6">
              ❓ 자주 묻는 질문
            </h2>

            <div className="space-y-3">
              {currentFeature.faq.map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setExpandedFAQ(
                      expandedFAQ === `${activeFeature}-${index}`
                        ? null
                        : `${activeFeature}-${index}`
                    )
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors">
                    <p className="font-semibold text-white flex-1">
                      {item.question}
                    </p>
                    <ChevronDown
                      className={`w-5 h-5 text-sky-400 flex-shrink-0 transition-transform ${
                        expandedFAQ === `${activeFeature}-${index}`
                          ? 'transform rotate-180'
                          : ''
                      }`}
                    />
                  </div>

                  {expandedFAQ === `${activeFeature}-${index}` && (
                    <div className="mt-2 p-4 bg-gray-900 rounded-lg text-gray-300 border-l-2 border-sky-500">
                      {item.answer}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 사이드바 - 빠른 액션 */}
        <div className="space-y-6">
          {/* 시작하기 카드 */}
          <div className="app-card">
            <h3 className="text-xl font-bold text-white mb-4">🚀 시작하기</h3>

            <div className="space-y-3">
              {activeFeature === 'audio' && (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    오디오를 생성해보세요
                  </p>
                  <Link
                    href="/apps/audio-generator/create"
                    className="block w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    오디오 생성 시작
                  </Link>
                </>
              )}

              {activeFeature === 'art' && (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    아트를 생성해보세요
                  </p>
                  <Link
                    href="/apps/art-generator/create"
                    className="block w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    아트 생성 시작
                  </Link>
                </>
              )}

              {activeFeature === 'tweet' && (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    트윗을 생성해보세요
                  </p>
                  <Link
                    href="/apps/tweet-generator/create"
                    className="block w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    트윗 생성 시작
                  </Link>
                </>
              )}

              {activeFeature === 'library' && (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    생성한 미디어를 관리하세요
                  </p>
                  <Link
                    href="/library"
                    className="block w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    라이브러리 열기
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 핵심 정보 카드 */}
          <div className="app-card">
            <h3 className="text-xl font-bold text-white mb-4">📋 핵심 정보</h3>

            <div className="space-y-4 text-sm">
              {activeFeature === 'audio' && (
                <>
                  <div>
                    <p className="text-gray-400 mb-1">최대 길이</p>
                    <p className="text-white font-medium">30초</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">출력 형식</p>
                    <p className="text-white font-medium">
                      WAV (48kHz, Stereo)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">생성 시간</p>
                    <p className="text-white font-medium">30초~3분</p>
                  </div>
                </>
              )}

              {activeFeature === 'art' && (
                <>
                  <div>
                    <p className="text-gray-400 mb-1">해상도 범위</p>
                    <p className="text-white font-medium">
                      256×256 ~ 1024×1024
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">출력 형식</p>
                    <p className="text-white font-medium">
                      PNG (SynthID 워터마크)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">생성 시간</p>
                    <p className="text-white font-medium">10초~1분</p>
                  </div>
                </>
              )}

              {activeFeature === 'tweet' && (
                <>
                  <div>
                    <p className="text-gray-400 mb-1">지원 톤</p>
                    <p className="text-white font-medium">
                      Casual, Professional, Humorous, Inspirational
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">길이 범위</p>
                    <p className="text-white font-medium">140 ~ 280자</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">생성 시간</p>
                    <p className="text-white font-medium">5~10초</p>
                  </div>
                </>
              )}

              {activeFeature === 'library' && (
                <>
                  <div>
                    <p className="text-gray-400 mb-1">저장소</p>
                    <p className="text-white font-medium">
                      브라우저 로컬 + Google Drive
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">공유 방법</p>
                    <p className="text-white font-medium">
                      SNS, Email, Google Drive 링크
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">지원 형식</p>
                    <p className="text-white font-medium">WAV, PNG, Text</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 더 많은 정보 */}
          <div className="app-card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="text-sm text-gray-300 mb-3">
              더 도움이 필요하신가요?
            </p>
            <Link
              href="/onboarding"
              className="text-sky-400 hover:text-sky-300 text-sm font-medium inline-flex items-center gap-1"
            >
              시작 가이드 다시 보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* 전체 FAQ */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="app-card">
          <h2 className="text-2xl font-bold text-white mb-6">💬 일반 질문</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">
                API 키는 안전한가요?
              </h3>
              <p className="text-gray-400 text-sm">
                네, API 키는 100% 당신의 브라우저 로컬 저장소에만 저장되며
                서버로 전송되지 않습니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                비용은 얼마인가요?
              </h3>
              <p className="text-gray-400 text-sm">
                이 앱은 무료입니다. Gemini API 사용 요금은 Google 계정에 따라
                청구됩니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                생성 제한이 있나요?
              </h3>
              <p className="text-gray-400 text-sm">
                Gemini API의 레이트 제한을 따릅니다. 프리 티어는 분당 15개 요청
                제한이 있습니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                오프라인에서 사용 가능?
              </h3>
              <p className="text-gray-400 text-sm">
                아니요, Gemini API를 사용하므로 인터넷 연결이 필수입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
