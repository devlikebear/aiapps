'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, AlertCircle, ArrowLeft, Copy, X, Eye } from 'lucide-react';
import { TONE_DESCRIPTIONS } from '@/lib/tweet/types';
import { buildTweetPrompt } from '@/lib/tweet/client';
import { jobQueue } from '@/lib/queue';
import { useTweetGeneration } from '@/lib/hooks/useMediaGeneration';
import { getAllTweets, getPreset, getAllPresets } from '@/lib/tweet/storage';
import type { StoredTweet, TweetPreset, TweetTone } from '@/lib/tweet/types';

const TONE_OPTIONS: Array<{ value: TweetTone; label: string }> = [
  { value: 'casual', label: '캐주얼' },
  { value: 'professional', label: '비즈니스' },
  { value: 'humorous', label: '유머' },
  { value: 'inspirational', label: '영감' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: '짧음 (140자)' },
  { value: 'medium', label: '중간 (200자)' },
  { value: 'long', label: '긴 (280자)' },
];

export default function TweetGeneratePage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

  // 폼 상태
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<
    'casual' | 'professional' | 'humorous' | 'inspirational'
  >('casual');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [hashtags, setHashtags] = useState(true);
  const [emoji, setEmoji] = useState(true);

  // 생성 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTweet, setGeneratedTweet] = useState<string | null>(null);
  const [recentTweets, setRecentTweets] = useState<StoredTweet[]>([]);
  const [presetName, setPresetName] = useState<string | null>(null);
  const [presets, setPresets] = useState<TweetPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TweetPreset | null>(
    null
  );

  // 자동 높이 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // 쿼리 파라미터에서 프리셋 로드
  useEffect(() => {
    const loadPresetFromQuery = async () => {
      const presetId = searchParams.get('preset');
      if (!presetId) return;

      try {
        const preset = await getPreset(presetId);
        if (preset) {
          // 프리셋 설정 적용
          setTone(preset.tone);
          setLength(preset.length);
          setHashtags(preset.hashtags);
          setEmoji(preset.emoji);
          setPresetName(preset.name);

          // eslint-disable-next-line no-console
          console.log('[TweetGenerator] Preset loaded:', preset.name);
        } else {
          // eslint-disable-next-line no-console
          console.warn('[TweetGenerator] Preset not found:', presetId);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[TweetGenerator] Error loading preset:', error);
      }
    };

    loadPresetFromQuery();
  }, [searchParams]);

  // 최근 트윗 로드
  useEffect(() => {
    const loadRecentTweets = async () => {
      try {
        const allTweets = await getAllTweets();
        // 최신순 정렬 후 최대 5개만 표시
        const sorted = allTweets.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setRecentTweets(sorted.slice(0, 5));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load recent tweets:', error);
      }
    };

    loadRecentTweets();
  }, []);

  // 프리셋 목록 로드
  useEffect(() => {
    const loadPresetsData = async () => {
      try {
        const allPresets = await getAllPresets();
        setPresets(allPresets);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load presets:', error);
      }
    };

    loadPresetsData();
  }, []);

  // 프리셋 선택 핸들러
  const handlePresetChange = async (presetId: string) => {
    if (!presetId) return;

    setSelectedPresetId(presetId);
    try {
      const preset = await getPreset(presetId);
      if (preset) {
        setTone(preset.tone);
        setLength(preset.length);
        setHashtags(preset.hashtags);
        setEmoji(preset.emoji);
        setPresetName(preset.name);
        setSelectedPreset(preset);
        // eslint-disable-next-line no-console
        console.log('[TweetGenerator] Preset selected:', preset.name);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[TweetGenerator] Error applying preset:', error);
    }
  };

  // 트윗 생성 완료 이벤트 구독
  useTweetGeneration((event) => {
    // eslint-disable-next-line no-console
    console.log('[TweetGenerator] Tweet generation completed:', event);

    // 생성된 트윗 표시
    setGeneratedTweet(event.text);

    // 최근 트윗 새로고침
    const loadRecentTweets = async () => {
      try {
        const allTweets = await getAllTweets();
        const sorted = allTweets.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setRecentTweets(sorted.slice(0, 5));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load recent tweets:', error);
      }
    };

    void loadRecentTweets();

    // 3초 후 자동 초기화 (사용자가 라이브러리로 이동할 수 있도록)
    setTimeout(() => {
      setGeneratedTweet(null);
    }, 5000);
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 작업 큐에 추가 (커스텀 톤 또는 기본 톤 상세 정보 포함)
      const toneDetails = selectedPreset?.customToneDescription
        ? {
            label: TONE_DESCRIPTIONS[tone].label,
            brief: TONE_DESCRIPTIONS[tone].brief,
            detailed: selectedPreset.customToneDescription,
            promptImpact: `🎯 ${selectedPreset.customToneDescription}`,
            examples: [],
          }
        : TONE_DESCRIPTIONS[tone];

      jobQueue.addTweetGenerateJob({
        prompt: prompt.trim(),
        tone,
        length,
        hashtags,
        emoji,
        mode: 'standard',
        toneDetails,
      });

      // 폼 초기화
      setPrompt('');
      setError('');

      // 성공 메시지 표시
      alert(
        '✅ 트윗 생성 작업이 큐에 추가되었습니다.\n완료되면 라이브러리에서 확인할 수 있습니다.'
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '작업 큐 추가 중 오류가 발생했습니다';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/apps/tweet-generator"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">트윗 생성</h1>
            <p className="text-gray-400">
              {presetName ? (
                <>
                  프리셋{' '}
                  <span className="text-sky-400 font-semibold">
                    &quot;{presetName}&quot;
                  </span>
                  을(를) 사용 중입니다
                </>
              ) : (
                '프롬프트와 설정을 선택해 트윗을 생성하세요'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 입력 폼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프롬프트 입력 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <label className="block text-sm font-semibold text-white">
                  프롬프트 입력
                </label>
                <div className="text-xs bg-sky-500/20 border border-sky-500/50 rounded px-2 py-1 text-sky-300">
                  톤:{' '}
                  <span className="font-semibold">
                    {TONE_DESCRIPTIONS[tone].label}
                  </span>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 새로운 제품 출시 소식을 흥미롭게 알려주는 트윗..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                rows={3}
              />
              <div className="mt-2 flex items-start justify-between">
                <p className="text-xs text-gray-400">
                  {prompt.length}/500 글자
                </p>
                <p className="text-xs text-gray-500 italic max-w-xs text-right">
                  {TONE_DESCRIPTIONS[tone].promptImpact}
                </p>
              </div>
            </div>

            {/* 프리셋 선택 */}
            {presets.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-sm font-semibold text-white mb-3">
                  💾 저장된 프리셋 선택
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">프리셋을 선택하세요</option>
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                      {preset.isDefault ? ' ⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 톤 선택 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-semibold text-white mb-4">
                톤 선택 (트윗의 스타일 결정)
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      tone === option.value
                        ? 'border-sky-500 bg-sky-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <p className="font-medium text-white">
                      {TONE_DESCRIPTIONS[option.value].label}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      {TONE_DESCRIPTIONS[option.value].brief}
                    </p>
                  </button>
                ))}
              </div>

              {/* 선택된 톤의 상세 설명 */}
              <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-sky-400 mb-1">
                    상세 설명
                  </p>
                  <p className="text-sm text-gray-300">
                    {TONE_DESCRIPTIONS[tone].detailed}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sky-400 mb-1">
                    프롬프트 영향
                  </p>
                  <p className="text-sm text-gray-300">
                    {TONE_DESCRIPTIONS[tone].promptImpact}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sky-400 mb-2">
                    예시
                  </p>
                  <div className="space-y-1">
                    {TONE_DESCRIPTIONS[tone].examples.map((example, idx) => (
                      <p key={idx} className="text-xs text-gray-400 italic">
                        {example}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 길이 선택 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-semibold text-white mb-4">
                길이 선택
              </label>
              <div className="flex gap-3">
                {LENGTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLength(option.value as typeof length)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      length === option.value
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <p className="text-sm font-medium text-white">
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 추가 옵션 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-semibold text-white mb-4">
                추가 옵션
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hashtags}
                    onChange={(e) => setHashtags(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">해시태그 포함</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emoji}
                    onChange={(e) => setEmoji(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">이모지 포함</span>
                </label>
              </div>
            </div>

            {/* 프롬프트 미리보기 버튼 */}
            <button
              onClick={() => setShowPromptPreview(true)}
              disabled={!prompt.trim()}
              className="w-full bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-800 text-gray-300 disabled:text-gray-500 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border border-gray-600 hover:border-gray-500"
            >
              <Eye className="w-4 h-4" />
              📋 생성될 프롬프트 미리보기
            </button>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  트윗 생성하기
                </>
              )}
            </button>
          </div>

          {/* 결과 영역 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 최근 생성된 트윗 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                ✨ 최근 생성 (최대 5개)
              </h2>

              {recentTweets.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentTweets.map((tweet, index) => (
                    <div
                      key={tweet.id}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-gray-400">
                          #{index + 1} •{' '}
                          {new Date(tweet.createdAt).toLocaleDateString(
                            'ko-KR',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tweet.tweet);
                          }}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                          title="복사"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
                        </button>
                      </div>
                      <p className="text-white text-xs leading-relaxed break-words line-clamp-3">
                        {tweet.tweet}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-400 text-xs">
                    생성된 트윗이 없습니다
                  </p>
                </div>
              )}
            </div>

            {/* 현재 생성 상태 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                생성 상태
              </h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {generatedTweet ? (
                <div className="bg-gradient-to-r from-sky-900/30 to-cyan-900/30 border border-sky-500/50 rounded-lg p-4 animate-pulse">
                  <p className="text-sm text-white font-medium mb-3">
                    ✨ 방금 생성됨!
                  </p>
                  <p className="text-white text-sm leading-relaxed break-words">
                    {generatedTweet}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    자동으로 리스트에 추가됩니다.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-300 text-sm">대기 중</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 프롬프트 미리보기 모달 */}
        {showPromptPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white">
                  📋 생성될 프롬프트 미리보기
                </h3>
                <button
                  onClick={() => setShowPromptPreview(false)}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 현재 설정 요약 */}
              <div className="px-6 pt-4 pb-3 bg-gray-700/30 border-b border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">톤</p>
                    <p className="text-white font-medium">
                      {TONE_DESCRIPTIONS[tone].label}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">길이</p>
                    <p className="text-white font-medium">
                      {length === 'short'
                        ? '짧음'
                        : length === 'medium'
                          ? '중간'
                          : '긴'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">해시태그</p>
                    <p className="text-white font-medium">
                      {hashtags ? '포함' : '미포함'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">이모지</p>
                    <p className="text-white font-medium">
                      {emoji ? '포함' : '미포함'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 프롬프트 내용 */}
              <div className="flex-1 overflow-auto px-6 py-4 bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-2 font-semibold">
                  AI에 전송될 프롬프트:
                </p>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words font-mono">
                    {buildTweetPrompt({
                      prompt,
                      tone,
                      length,
                      hashtags,
                      emoji,
                      toneDetails: selectedPreset?.customToneDescription
                        ? {
                            label: TONE_DESCRIPTIONS[tone].label,
                            brief: TONE_DESCRIPTIONS[tone].brief,
                            detailed: selectedPreset.customToneDescription,
                            promptImpact: `🎯 ${selectedPreset.customToneDescription}`,
                            examples: [],
                          }
                        : TONE_DESCRIPTIONS[tone],
                    })}
                  </pre>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 p-6 border-t border-gray-700 flex-shrink-0 bg-gray-800">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      buildTweetPrompt({
                        prompt,
                        tone,
                        length,
                        hashtags,
                        emoji,
                        toneDetails: selectedPreset?.customToneDescription
                          ? {
                              label: TONE_DESCRIPTIONS[tone].label,
                              brief: TONE_DESCRIPTIONS[tone].brief,
                              detailed: selectedPreset.customToneDescription,
                              promptImpact: `🎯 ${selectedPreset.customToneDescription}`,
                              examples: [],
                            }
                          : TONE_DESCRIPTIONS[tone],
                      })
                    );
                    alert('프롬프트가 복사되었습니다');
                  }}
                  className="flex-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 px-4 py-2 rounded-lg font-medium transition-all border border-sky-500/50 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  복사
                </button>
                <button
                  onClick={() => setShowPromptPreview(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
