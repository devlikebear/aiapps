'use client';

import { useState, useEffect } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';
import { GAME_PRESETS } from '@/lib/audio/types';
import type { GameGenre, AudioType } from '@/lib/audio/types';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { downloadAudio } from '@/lib/audio/converter';
import { getApiKey } from '@/lib/api-key/storage';
import { jobQueue } from '@/lib/queue';
import { getAllAudio } from '@/lib/storage/indexed-db';
import { generateAudioTags } from '@/lib/utils/tags';
import { Play, Pause, Download } from 'lucide-react';

interface StoredAudio {
  id: string;
  data: string;
  metadata: {
    prompt: string;
    genre?: string;
    type?: string;
    [key: string]: unknown;
  };
  tags: string[];
  createdAt: Date;
}

export default function AudioCreatePage() {
  const { error, currentAudio, setError } = useAudioStore();

  // Form state
  const [type, setType] = useState<AudioType>('bgm');
  const [genre, setGenre] = useState<GameGenre>('rpg');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(60);
  const [customBpm, setCustomBpm] = useState<number | null>(null);

  // Related audio state
  const [relatedAudio, setRelatedAudio] = useState<StoredAudio[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Map<string, HTMLAudioElement>
  >(new Map());

  const preset = GAME_PRESETS[genre];

  // 타입 변경 시 duration 자동 조정
  useEffect(() => {
    setDuration(type === 'bgm' ? 60 : 5);
  }, [type]);

  // 관련 오디오 로드 및 필터링
  useEffect(() => {
    const loadRelatedAudio = async () => {
      try {
        const allAudio = await getAllAudio();

        // 현재 설정에서 태그 생성
        const currentTags = generateAudioTags({
          type,
          genre,
          bpm: customBpm || preset.bpm.default,
          duration,
        });

        // 태그가 일치하는 오디오 필터링
        const filtered = allAudio.filter((audio) =>
          currentTags.some((tag) => audio.tags?.includes(tag))
        );

        // 최신순 정렬
        filtered.sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setRelatedAudio(filtered.slice(0, 6)); // 최대 6개만 표시
      } catch (error) {
        console.error('Failed to load related audio:', error);
      }
    };

    loadRelatedAudio();
  }, [type, genre, customBpm, preset.bpm.default, duration]);

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

    // 작업 큐에 추가
    try {
      jobQueue.addAudioJob({
        prompt: prompt.trim(),
        genre,
        audioType: type,
        bpm: customBpm || preset.bpm.default,
        duration,
        density: preset.density,
        brightness: preset.brightness,
        scale: preset.scale,
      });

      // 폼 초기화 (선택적)
      setPrompt('');
      setError('');

      // 성공 메시지 표시 (토스트가 알려주지만 추가 피드백)
      alert(
        '✅ 오디오 생성 작업이 큐에 추가되었습니다.\n완료되면 알림을 받게 됩니다.'
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '작업 큐 추가 중 오류가 발생했습니다';
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

  // 관련 오디오 재생 토글
  const togglePlayRelated = (audioId: string, audioData: string) => {
    // 현재 재생 중인 오디오가 있으면 정지
    if (playingAudioId && playingAudioId !== audioId) {
      const prevAudio = audioElements.get(playingAudioId);
      if (prevAudio) {
        prevAudio.pause();
        prevAudio.currentTime = 0;
      }
    }

    // 같은 오디오를 다시 클릭하면 정지
    if (playingAudioId === audioId) {
      const audio = audioElements.get(audioId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudioId(null);
      return;
    }

    // 새 오디오 재생
    let audio = audioElements.get(audioId);
    if (!audio) {
      // Base64 데이터에서 오디오 엘리먼트 생성
      const dataUrl = audioData.startsWith('data:')
        ? audioData
        : `data:audio/wav;base64,${audioData}`;
      audio = new Audio(dataUrl);
      audio.addEventListener('ended', () => {
        setPlayingAudioId(null);
      });
      setAudioElements((prev) => new Map(prev).set(audioId, audio!));
    }

    audio.play();
    setPlayingAudioId(audioId);
  };

  // 관련 오디오 다운로드
  const handleDownloadRelated = async (
    audioData: string,
    audioId: string,
    format: 'wav' | 'mp3' | 'ogg'
  ) => {
    // Base64 string을 ArrayBuffer로 변환
    const base64 = audioData.startsWith('data:')
      ? audioData.split(',')[1]
      : audioData;
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    await downloadAudio(bytes.buffer, `audio-${audioId}`, format);
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
            disabled={!prompt.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            🎵 작업 큐에 추가하기
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

        {/* Related Audio Section */}
        {relatedAudio.length > 0 && (
          <div className="app-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">🎵 관련 오디오</h2>
              <p className="text-sm text-gray-400">
                현재 설정과 유사한 오디오 {relatedAudio.length}개
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedAudio.map((audio) => (
                <div
                  key={audio.id}
                  className="app-card p-4 space-y-3 hover:ring-2 hover:ring-blue-500/50 transition-all"
                >
                  {/* Prompt */}
                  <p className="text-sm line-clamp-2 font-medium">
                    {audio.metadata.prompt}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>
                      <span className="text-gray-500">타입:</span>{' '}
                      {audio.metadata.type === 'bgm' ? '🎼 BGM' : '⚡ SFX'}
                    </div>
                    <div>
                      <span className="text-gray-500">장르:</span>{' '}
                      {String(audio.metadata.genre)}
                    </div>
                    {typeof audio.metadata.bpm === 'number' && (
                      <div>
                        <span className="text-gray-500">BPM:</span>{' '}
                        {audio.metadata.bpm}
                      </div>
                    )}
                    {typeof audio.metadata.duration === 'number' && (
                      <div>
                        <span className="text-gray-500">길이:</span>{' '}
                        {audio.metadata.duration}초
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {audio.tags && audio.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {audio.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {audio.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{audio.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePlayRelated(audio.id, audio.data)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {playingAudioId === audio.id ? (
                        <>
                          <Pause className="w-4 h-4" />
                          정지
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          재생
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadRelated(audio.data, audio.id, 'wav')
                      }
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      title="WAV 다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 text-right">
                    {new Date(audio.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
