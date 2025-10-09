/**
 * 오디오 생성 페이지
 */

'use client';

import { useState } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import { AudioPrompt, GENRES, MOODS, INSTRUMENTS, SCALES } from '@/lib/schemas/audio';
import { estimateTokenCost, formatTokenCost } from '@/lib/utils/token-estimator';
import { pcmToWav, normalizePCM, applyFade, wavToBlob, downloadAudio } from '@/lib/utils/audio-converter';

export default function CreateAudioPage() {
  const {
    status,
    progress,
    generatedAudio,
    error,
    generateAudio,
    resetGeneration,
  } = useAudioStore();

  const [prompt, setPrompt] = useState<Partial<AudioPrompt>>({
    prompt: '',
    bpm: 120,
    density: 0.5,
    brightness: 0.5,
    scale: 'major',
    duration: 30,
    instruments: [],
  });

  const tokenCost = estimateTokenCost(prompt as AudioPrompt);

  const handleGenerate = async () => {
    if (!prompt.prompt) {
      alert('Please enter a prompt');
      return;
    }

    await generateAudio(prompt as AudioPrompt);
  };

  const handleDownload = () => {
    if (!generatedAudio) return;

    // PCM → WAV 변환
    let audioData = generatedAudio.audio.data;

    // 노멀라이징
    audioData = normalizePCM(audioData);

    // 페이드 적용
    audioData = applyFade(audioData, 100, 100, generatedAudio.audio.sampleRate);

    // WAV 변환
    const wavData = pcmToWav(
      audioData,
      generatedAudio.audio.sampleRate,
      generatedAudio.audio.channels,
      generatedAudio.audio.bitDepth
    );

    const blob = wavToBlob(wavData);
    downloadAudio(blob, `audio_${generatedAudio.requestId}.wav`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">AI 게임 오디오 생성기</h1>

        {/* 프롬프트 입력 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">프롬프트</h2>

          <textarea
            className="w-full p-3 border rounded-lg mb-4"
            rows={3}
            placeholder="예: Epic orchestral battle music with drums and strings"
            value={prompt.prompt}
            onChange={(e) => setPrompt({ ...prompt, prompt: e.target.value })}
          />

          {/* 장르 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">장르</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={prompt.genre || ''}
              onChange={(e) => setPrompt({ ...prompt, genre: e.target.value as any })}
            >
              <option value="">선택 안함</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* 무드 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">무드</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={prompt.mood || ''}
              onChange={(e) => setPrompt({ ...prompt, mood: e.target.value as any })}
            >
              <option value="">선택 안함</option>
              {MOODS.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </div>

          {/* BPM 슬라이더 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              BPM: {prompt.bpm}
            </label>
            <input
              type="range"
              min="60"
              max="200"
              value={prompt.bpm}
              onChange={(e) => setPrompt({ ...prompt, bpm: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Density 슬라이더 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Density: {prompt.density?.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={prompt.density}
              onChange={(e) => setPrompt({ ...prompt, density: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Brightness 슬라이더 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Brightness: {prompt.brightness?.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={prompt.brightness}
              onChange={(e) => setPrompt({ ...prompt, brightness: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 악기 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">악기</label>
            <div className="grid grid-cols-3 gap-2">
              {INSTRUMENTS.map((instrument) => (
                <label key={instrument} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={prompt.instruments?.includes(instrument)}
                    onChange={(e) => {
                      const instruments = prompt.instruments || [];
                      if (e.target.checked) {
                        setPrompt({
                          ...prompt,
                          instruments: [...instruments, instrument],
                        });
                      } else {
                        setPrompt({
                          ...prompt,
                          instruments: instruments.filter((i) => i !== instrument),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  {instrument}
                </label>
              ))}
            </div>
          </div>

          {/* 길이 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">길이 (초)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={prompt.duration}
              onChange={(e) => setPrompt({ ...prompt, duration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* 토큰 비용 */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              예상 토큰 비용: {formatTokenCost(tokenCost)}
            </p>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={status === 'pending' || status === 'streaming'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {status === 'pending' && '준비 중...'}
            {status === 'streaming' && '생성 중...'}
            {status !== 'pending' && status !== 'streaming' && '음악 생성'}
          </button>
        </div>

        {/* 진행률 표시 */}
        {progress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">생성 진행 중</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {progress.progress}% - {progress.audioChunksReceived} 청크 수신됨
            </p>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={resetGeneration}
              className="mt-2 text-red-600 underline"
            >
              재시도
            </button>
          </div>
        )}

        {/* 생성 완료 */}
        {generatedAudio && status === 'completed' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">생성 완료!</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                BPM: {generatedAudio.metadata.bpm} |
                Key: {generatedAudio.metadata.key} |
                Scale: {generatedAudio.metadata.scale} |
                Duration: {generatedAudio.metadata.duration}s
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              WAV 다운로드
            </button>

            <button
              onClick={resetGeneration}
              className="w-full mt-2 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              새로 생성
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
