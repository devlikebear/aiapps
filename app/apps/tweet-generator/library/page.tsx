'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Trash2,
  Filter,
  BookOpen,
  Search,
  Check,
} from 'lucide-react';
import type { StoredTweet, TweetTone } from '@/lib/tweet/types';
import { getAllTweets, deleteTweet } from '@/lib/tweet/storage';

const TONE_OPTIONS: TweetTone[] = [
  'casual',
  'professional',
  'humorous',
  'inspirational',
];

export default function TweetLibraryPage() {
  const [tweets, setTweets] = useState<StoredTweet[]>([]);
  const [filteredTweets, setFilteredTweets] = useState<StoredTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState<TweetTone | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // 트윗 로드
  useEffect(() => {
    loadTweets();
  }, []);

  // 필터링
  useEffect(() => {
    filterTweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tweets, selectedTone, searchQuery]);

  const loadTweets = async () => {
    try {
      setIsLoading(true);
      const allTweets = await getAllTweets();
      setTweets(allTweets);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTweets = () => {
    let result = tweets;

    // 톤 필터링
    if (selectedTone !== 'all') {
      result = result.filter((t) => t.metadata.tone === selectedTone);
    }

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.tweet.toLowerCase().includes(query) ||
          t.metadata.prompt.toLowerCase().includes(query)
      );
    }

    setFilteredTweets(result);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 트윗을 삭제하시겠습니까?')) return;

    try {
      await deleteTweet(id);
      setTweets((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting tweet:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert('복사에 실패했습니다');
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
            <h1 className="text-3xl font-bold text-white">
              내 트윗 라이브러리
            </h1>
            <p className="text-gray-400">생성한 트윗을 관리하고 재사용하세요</p>
          </div>
        </div>

        {/* 필터 */}
        <div className="space-y-4 mb-8">
          {/* 검색 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 flex gap-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="트윗이나 프롬프트 검색..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* 톤 필터 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-300">톤</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTone('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTone === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                전체
              </button>
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTone === tone
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                      : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 트윗 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">로드 중...</p>
          </div>
        ) : filteredTweets.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">
              {tweets.length === 0
                ? '생성한 트윗이 없습니다'
                : '검색 결과가 없습니다'}
            </p>
            {tweets.length === 0 && (
              <Link
                href="/apps/tweet-generator/create"
                className="text-sky-400 hover:text-sky-300 text-sm font-medium mt-3 inline-block"
              >
                첫 트윗 생성하기 →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTweets.map((tweet) => (
              <div
                key={tweet.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex gap-4">
                  {/* 콘텐츠 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed break-words">
                      {tweet.tweet}
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-1 rounded border border-sky-500/30">
                        {tweet.metadata.tone.charAt(0).toUpperCase() +
                          tweet.metadata.tone.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {tweet.tweet.length}자
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(tweet.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(tweet.tweet, tweet.id)}
                      className={`p-2 rounded-lg transition-all ${
                        copied === tweet.id
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                      }`}
                      title="복사"
                    >
                      {copied === tweet.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(tweet.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 통계 */}
        {tweets.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
              <p className="text-2xl font-bold text-sky-400">{tweets.length}</p>
              <p className="text-xs text-gray-400 mt-1">총 생성된 트윗</p>
            </div>
            {TONE_OPTIONS.map((tone) => {
              const count = tweets.filter(
                (t) => t.metadata.tone === tone
              ).length;
              return (
                <div
                  key={tone}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center"
                >
                  <p className="text-2xl font-bold text-cyan-400">{count}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
