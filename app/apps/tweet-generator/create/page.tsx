'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, AlertCircle, ArrowLeft, Copy, Trash2 } from 'lucide-react';
import { TONE_DESCRIPTIONS } from '@/lib/tweet/types';
import { jobQueue } from '@/lib/queue';
import { useTweetGeneration } from '@/lib/hooks/useMediaGeneration';
import { getAllTweets } from '@/lib/tweet/storage';
import type { StoredTweet } from '@/lib/tweet/types';

const TONE_OPTIONS = [
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

  // 자동 높이 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // 최근 트윗 로드
  useEffect(() => {
    const loadRecentTweets = async () => {
      try {
        const allTweets = await getAllTweets();
        // 최신순 정렬 후 최대 5개만 표시
        const sorted = allTweets.sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
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
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
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
      // 작업 큐에 추가
      jobQueue.addTweetGenerateJob({
        prompt: prompt.trim(),
        tone,
        length,
        hashtags,
        emoji,
        mode: 'standard',
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
              프롬프트와 설정을 선택해 트윗을 생성하세요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 입력 폼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프롬프트 입력 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-semibold text-white mb-2">
                프롬프트 입력
              </label>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 새로운 제품 출시 소식을 흥미롭게 알려주는 트윗..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-2">
                {prompt.length}/500 글자
              </p>
            </div>

            {/* 톤 선택 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <label className="block text-sm font-semibold text-white mb-4">
                톤 선택
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value as typeof tone)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      tone === option.value
                        ? 'border-sky-500 bg-sky-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <p className="font-medium text-white">{option.label}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {TONE_DESCRIPTIONS[option.value as typeof tone].slice(
                        0,
                        30
                      )}
                      ...
                    </p>
                  </button>
                ))}
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
                            navigator.clipboard.writeText(tweet.text);
                          }}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                          title="복사"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
                        </button>
                      </div>
                      <p className="text-white text-xs leading-relaxed break-words line-clamp-3">
                        {tweet.text}
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
      </div>
    </div>
  );
}
