'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Save,
  RotateCw,
  ArrowLeft,
} from 'lucide-react';
import type { TweetGenerateRequest, TweetMetadata } from '@/lib/tweet/types';
import { TONE_DESCRIPTIONS, LENGTH_DESCRIPTIONS } from '@/lib/tweet/types';
import { saveTweet } from '@/lib/tweet/storage';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import { useGoogleDriveUpload } from '@/lib/google-drive/hooks';

interface GeneratedTweet {
  tweet: string;
  metadata: TweetMetadata;
}

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
  const { isAuthenticated } = useGoogleDriveStore();
  const uploadFile = useGoogleDriveUpload();

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
  const [generatedTweet, setGeneratedTweet] = useState<GeneratedTweet | null>(
    null
  );
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  // 자동 높이 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedTweet(null);

    try {
      const request: TweetGenerateRequest = {
        prompt,
        tone,
        length,
        hashtags,
        emoji,
        mode: 'standard',
      };

      const response = await fetch('/api/tweet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '트윗 생성에 실패했습니다');
      }

      const result = await response.json();
      setGeneratedTweet(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedTweet) return;

    try {
      await navigator.clipboard.writeText(generatedTweet.tweet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('복사에 실패했습니다');
    }
  };

  const handleSave = async () => {
    if (!generatedTweet) return;

    try {
      setError('');

      // 1. IndexedDB에 저장
      const storedTweet = {
        id: generatedTweet.metadata.id,
        tweet: generatedTweet.tweet,
        metadata: generatedTweet.metadata,
        createdAt: generatedTweet.metadata.createdAt,
      };

      await saveTweet(storedTweet);

      // 2. Google Drive에 저장 (인증된 경우)
      if (isAuthenticated) {
        setIsSavingToDrive(true);
        try {
          const tweetContent = `${generatedTweet.tweet}\n\n---\n톤: ${generatedTweet.metadata.tone}\n길이: ${generatedTweet.metadata.length}\n생성 날짜: ${new Date(generatedTweet.metadata.createdAt).toLocaleString('ko-KR')}`;

          const blob = new Blob([tweetContent], { type: 'text/plain' });
          const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, '-');
          const filename = `tweet-${timestamp}.txt`;

          const metadata: Record<string, string> = {
            tone: generatedTweet.metadata.tone || '',
            length: generatedTweet.metadata.length || '',
          };

          const result = await uploadFile(blob, filename, 'audio', metadata);
          if (result) {
            // 메타데이터에 Google Drive ID 업데이트
            storedTweet.metadata.googleDriveId = result.id;
          }
        } catch (driveError) {
          // eslint-disable-next-line no-console
          console.error('Google Drive 저장 실패:', driveError);
          // Google Drive 저장 실패해도 IndexedDB에는 저장되었으므로 계속 진행
        } finally {
          setIsSavingToDrive(false);
        }
      }

      alert('✓ 트윗이 라이브러리에 저장되었습니다');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다');
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
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">
                생성된 트윗
              </h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {generatedTweet ? (
                <div className="space-y-4">
                  {/* 트윗 텍스트 */}
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <p className="text-white text-sm leading-relaxed">
                      {generatedTweet.tweet}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      {generatedTweet.tweet.length}/
                      {LENGTH_DESCRIPTIONS[generatedTweet.metadata.length].char}
                      자
                    </p>
                  </div>

                  {/* 메타데이터 */}
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>톤: {TONE_DESCRIPTIONS[generatedTweet.metadata.tone]}</p>
                    <p>
                      생성:{' '}
                      {new Date(
                        generatedTweet.metadata.createdAt
                      ).toLocaleString('ko-KR')}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCopy}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        copied
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/50 hover:bg-sky-500/30'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          복사됨!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          복사
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isSavingToDrive}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {isSavingToDrive ? (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          저장
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setGeneratedTweet(null);
                        setError('');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-all"
                    >
                      <RotateCw className="w-4 h-4" />
                      다시 생성
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400 text-sm">
                    프롬프트를 입력하고
                    <br />
                    생성하기 버튼을 클릭하세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
