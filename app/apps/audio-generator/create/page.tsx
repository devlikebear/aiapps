'use client';

import { useState, useEffect } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';
import { GAME_PRESETS } from '@/lib/audio/types';
import type { GameGenre, AudioType } from '@/lib/audio/types';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { downloadAudio } from '@/lib/audio/converter';
import { getApiKey } from '@/lib/api-key/storage';

export default function AudioCreatePage() {
  const {
    isGenerating,
    progress,
    error,
    currentAudio,
    startGeneration,
    setGeneratedAudio,
    setError,
    completeGeneration,
  } = useAudioStore();

  // Form state
  const [type, setType] = useState<AudioType>('bgm');
  const [genre, setGenre] = useState<GameGenre>('rpg');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(60);
  const [customBpm, setCustomBpm] = useState<number | null>(null);

  const preset = GAME_PRESETS[genre];

  // 타입 변경 시 duration 자동 조정
  useEffect(() => {
    setDuration(type === 'bgm' ? 60 : 5);
  }, [type]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요');
      return;
    }

    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      setError(
        'API 키가 설정되지 않았습니다. 헤더의 설정 버튼에서 API 키를 등록해주세요.'
      );
      return;
    }

    startGeneration();

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
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
        throw new Error(errorData.error || '오디오 생성에 실패했습니다');
      }

      const data = await response.json();
      const audioBuffer = Uint8Array.from(atob(data.audio), (c) =>
        c.charCodeAt(0)
      ).buffer;
      setGeneratedAudio(audioBuffer, data.metadata);
      completeGeneration();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '오디오 생성 중 오류가 발생했습니다';
      setError(errorMessage);
    }
  };

  const handleDownload = async (format: 'wav' | 'mp3' | 'ogg') => {
    if (!currentAudio) return;
    await downloadAudio(
      currentAudio.audioData,
      `audio-${currentAudio.id}`,
      format
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🎵 AI 오디오 생성기
          </h1>
          <p className="text-gray-400">
            게임에 딱 맞는 음악과 효과음을 AI로 생성하세요
          </p>
        </div>

        {/* Generation Form */}
        <div className="app-card p-6 md:p-8 space-y-6">
          {/* Type & Genre Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                오디오 타입
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AudioType)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="bgm">🎼 배경 음악 (BGM)</option>
                <option value="sfx">⚡ 효과음 (SFX)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                {type === 'bgm'
                  ? '루프 가능한 배경 음악 (30초~5분)'
                  : '짧은 효과음 (0.1초~3초)'}
              </p>
            </div>

            {/* Game Genre */}
            <div>
              <label className="block text-sm font-medium mb-2">
                게임 장르
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as GameGenre)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                {Object.entries(GAME_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.icon} {preset.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">{preset.description}</p>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">
              프롬프트 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                type === 'bgm'
                  ? '예: 던전 탐험 중 긴장감 넘치는 배경 음악'
                  : '예: 코인 획득 시 밝고 경쾌한 효과음'
              }
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Duration & BPM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                재생 시간 (초): {duration}초
              </label>
              <input
                type="range"
                min={type === 'bgm' ? 30 : 1}
                max={type === 'bgm' ? 300 : 10}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{type === 'bgm' ? '30초' : '1초'}</span>
                <span>{type === 'bgm' ? '5분' : '10초'}</span>
              </div>
            </div>

            {/* BPM */}
            <div>
              <label className="block text-sm font-medium mb-2">
                BPM (기본: {preset.bpm.default})
              </label>
              <input
                type="number"
                min={preset.bpm.min}
                max={preset.bpm.max}
                value={customBpm || preset.bpm.default}
                onChange={(e) => setCustomBpm(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {preset.bpm.min}</span>
                <span>Max: {preset.bpm.max}</span>
              </div>
            </div>
          </div>

          {/* Preset Info */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium mb-2">
              {preset.icon} {preset.name} 프리셋
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-400">
              <div>
                <span className="text-gray-500">밀도:</span>{' '}
                {preset.density * 100}%
              </div>
              <div>
                <span className="text-gray-500">밝기:</span>{' '}
                {preset.brightness * 100}%
              </div>
              <div>
                <span className="text-gray-500">스케일:</span>{' '}
                {preset.scale === 'major' ? '장조' : '단조'}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                생성 중... {progress?.progress || 0}%
              </span>
            ) : (
              '🎵 오디오 생성하기'
            )}
          </button>
        </div>

        {/* Generated Audio Player */}
        {currentAudio && (
          <div className="app-card p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">생성된 오디오</h2>
                <p className="text-gray-400">{currentAudio.metadata.prompt}</p>
              </div>
            </div>

            <AudioPlayer />

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg text-sm">
              <div>
                <div className="text-gray-500 text-xs">타입</div>
                <div className="font-medium">{currentAudio.metadata.type}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">장르</div>
                <div className="font-medium">{currentAudio.metadata.genre}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">BPM</div>
                <div className="font-medium">{currentAudio.metadata.bpm}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">길이</div>
                <div className="font-medium">
                  {currentAudio.metadata.duration}초
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload('wav')}
                className="flex-1 min-w-[120px] px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                💾 WAV 다운로드
              </button>
              <button
                onClick={() => handleDownload('mp3')}
                className="flex-1 min-w-[120px] px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                💾 MP3 다운로드
              </button>
              <button
                onClick={() => handleDownload('ogg')}
                className="flex-1 min-w-[120px] px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                💾 OGG 다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
