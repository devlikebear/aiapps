'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAudioStore } from '@/lib/stores/audio-store';
import { GAME_PRESETS } from '@/lib/audio/types';
import type { GameGenre, AudioType, AudioFormat } from '@/lib/audio/types';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { downloadAudio } from '@/lib/audio/converter';

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as AudioType | null;
  const genre = searchParams.get('genre') as GameGenre | null;

  const {
    isGenerating,
    progress,
    error,
    currentAudio,
    setRequest,
    updateRequest,
    startGeneration,
    setGeneratedAudio,
    setError,
    completeGeneration,
  } = useAudioStore();

  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(60);
  const [customBpm, setCustomBpm] = useState<number | null>(null);

  // URL 파라미터 검증 및 초기화
  useEffect(() => {
    if (!type || !genre) {
      router.push('/apps/audio-generator');
      return;
    }

    const preset = GAME_PRESETS[genre];
    if (!preset) {
      router.push('/apps/audio-generator');
      return;
    }

    // 초기 요청 설정
    setRequest({
      type,
      genre,
      prompt: '',
      duration: type === 'bgm' ? 60 : 5,
      bpm: preset.bpm.default,
    });

    setDuration(type === 'bgm' ? 60 : 5);
  }, [type, genre, router, setRequest]);

  if (!type || !genre) {
    return null;
  }

  const preset = GAME_PRESETS[genre];

  // 생성 시작
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    startGeneration();

    try {
      // API 요청
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          genre,
          prompt: prompt.trim(),
          duration,
          bpm: customBpm || preset.bpm.default,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Audio generation failed');
      }

      const data = await response.json();

      // Base64 디코딩
      const audioBuffer = Uint8Array.from(atob(data.audioBase64), (c) =>
        c.charCodeAt(0)
      ).buffer;

      setGeneratedAudio(audioBuffer, data.metadata);
      completeGeneration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio generation failed');
    }
  };

  // 다운로드 핸들러
  const handleDownload = async (format: AudioFormat) => {
    if (!currentAudio) return;

    try {
      const filename = `${preset.name}_${type}_${Date.now()}`;

      if (format === 'wav') {
        // WAV는 직접 다운로드
        downloadAudio(currentAudio.audioData, filename, format);
      } else {
        // 다른 포맷은 변환 API 호출
        const formData = new FormData();
        const audioBlob = new Blob([currentAudio.audioData], {
          type: 'audio/wav',
        });
        formData.append('audio', audioBlob);
        formData.append(
          'options',
          JSON.stringify({
            sourceFormat: 'wav',
            targetFormat: format,
            quality: 'high',
          })
        );

        const response = await fetch('/api/audio/convert', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Conversion failed');
        }

        const data = await response.json();
        const convertedBuffer = Uint8Array.from(atob(data.audioBase64), (c) =>
          c.charCodeAt(0)
        ).buffer;

        downloadAudio(convertedBuffer, filename, format);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  return (
    <main className="min-h-screen relative z-10">
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-8">
        {/* 헤더 */}
        <div className="space-y-4">
          <Link
            href="/apps/audio-generator"
            className="inline-block text-gray-400 hover:text-white transition-colors"
          >
            ← 뒤로 가기
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{preset.icon}</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text glow-text">
                {preset.name} {type === 'bgm' ? 'BGM' : 'SFX'} 생성
              </h1>
              <p className="text-gray-300 mt-2">{preset.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 입력 폼 */}
          <div className="space-y-6">
            {/* 프롬프트 입력 */}
            <div className="app-card space-y-4">
              <h2 className="text-xl font-bold text-white">1️⃣ 프롬프트</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  원하는 분위기나 느낌을 설명하세요
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    updateRequest({ prompt: e.target.value });
                  }}
                  placeholder="예: epic battle, calm exploration, mysterious dungeon..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {preset.promptTemplate.replace('{mood}', prompt || '...')}
                </p>
              </div>
            </div>

            {/* 파라미터 조정 */}
            <div className="app-card space-y-4">
              <h2 className="text-xl font-bold text-white">2️⃣ 파라미터</h2>

              {/* 길이 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  길이: {duration}초 ({(duration / 60).toFixed(1)}분)
                </label>
                <input
                  type="range"
                  min={type === 'bgm' ? 30 : 1}
                  max={type === 'bgm' ? 300 : 10}
                  step={type === 'bgm' ? 5 : 0.5}
                  value={duration}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDuration(val);
                    updateRequest({ duration: val });
                  }}
                  className="w-full accent-purple-600"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{type === 'bgm' ? '30초' : '1초'}</span>
                  <span>{type === 'bgm' ? '5분' : '10초'}</span>
                </div>
              </div>

              {/* BPM */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">
                    BPM: {customBpm || preset.bpm.default}
                  </label>
                  <button
                    onClick={() => setCustomBpm(null)}
                    className="text-xs text-sky-400 hover:text-sky-300"
                    disabled={isGenerating}
                  >
                    기본값 ({preset.bpm.default})
                  </button>
                </div>
                <input
                  type="range"
                  min={preset.bpm.min}
                  max={preset.bpm.max}
                  step={5}
                  value={customBpm || preset.bpm.default}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCustomBpm(val);
                    updateRequest({ bpm: val });
                  }}
                  className="w-full accent-purple-600"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{preset.bpm.min}</span>
                  <span>{preset.bpm.max}</span>
                </div>
              </div>

              {/* 프리셋 정보 */}
              <div className="pt-4 border-t border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">밀도</span>
                  <span className="text-white">{preset.density * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">밝기</span>
                  <span className="text-white">{preset.brightness * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">스케일</span>
                  <span className="text-white">
                    {preset.scale === 'major' ? '장조' : '단조'}
                  </span>
                </div>
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/50'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  생성 중... {progress?.progress || 0}%
                </span>
              ) : (
                '🎵 음악 생성하기'
              )}
            </button>

            {/* 에러 표시 */}
            {error && (
              <div className="app-card bg-red-900/20 border-red-500/30">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">❌</div>
                  <div>
                    <h3 className="text-lg font-bold text-red-300 mb-1">
                      에러 발생
                    </h3>
                    <p className="text-sm text-gray-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 진행 상태 */}
            {progress && (
              <div className="app-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {progress.message}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {progress.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 플레이어 */}
          <div className="space-y-6">
            <AudioPlayer />

            {/* 다운로드 버튼 */}
            {currentAudio && (
              <div className="app-card space-y-3">
                <h3 className="text-lg font-bold text-white">다운로드</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownload('wav')}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    📥 WAV (무손실)
                  </button>
                  <button
                    onClick={() => handleDownload('mp3')}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    📥 MP3 (범용)
                  </button>
                  <button
                    onClick={() => handleDownload('ogg')}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    📥 OGG (오픈)
                  </button>
                  <button
                    onClick={() => handleDownload('flac')}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    📥 FLAC (압축)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AudioGeneratorCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🎵</div>
            <p className="text-gray-400">로딩 중...</p>
          </div>
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}
