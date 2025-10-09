'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GAME_PRESETS } from '@/lib/audio/types';
import type { GameGenre, AudioType } from '@/lib/audio/types';

export default function AudioGeneratorPage() {
  const [selectedType, setSelectedType] = useState<AudioType | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<GameGenre | null>(null);

  const handleStartCreation = () => {
    if (selectedType && selectedGenre) {
      window.location.href = `/apps/audio-generator/create?type=${selectedType}&genre=${selectedGenre}`;
    }
  };

  return (
    <main className="min-h-screen relative z-10">
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-12">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-block text-gray-400 hover:text-white transition-colors mb-4"
          >
            ← 홈으로
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold gradient-text glow-text">
            🎵 AI Music Generator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gemini Lyria로 게임에 딱 맞는 음악과 효과음을 AI가 생성합니다
          </p>
        </div>

        {/* 단계 1: 오디오 타입 선택 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">1️⃣ 오디오 타입 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedType('bgm')}
              className={`app-card text-left transition-all ${
                selectedType === 'bgm'
                  ? 'border-sky-500 shadow-xl shadow-sky-500/30'
                  : ''
              }`}
            >
              <div className="text-6xl mb-4">🎼</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                배경 음악 (BGM)
              </h3>
              <p className="text-gray-400 mb-4">
                게임 플레이 중 반복되는 배경 음악을 생성합니다
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 긴 재생 시간 (30초~5분)</li>
                <li>• 루프 가능한 구조</li>
                <li>• 분위기와 몰입감 조성</li>
              </ul>
            </button>

            <button
              onClick={() => setSelectedType('sfx')}
              className={`app-card text-left transition-all ${
                selectedType === 'sfx'
                  ? 'border-sky-500 shadow-xl shadow-sky-500/30'
                  : ''
              }`}
            >
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                효과음 (SFX)
              </h3>
              <p className="text-gray-400 mb-4">
                액션, UI, 수집 등 짧은 효과음을 생성합니다
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 짧은 재생 시간 (0.1초~3초)</li>
                <li>• 즉각적인 피드백</li>
                <li>• 게임 이벤트 강조</li>
              </ul>
            </button>
          </div>
        </section>

        {/* 단계 2: 게임 장르 선택 */}
        {selectedType && (
          <section className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">2️⃣ 게임 장르 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(GAME_PRESETS).map((preset) => (
                <button
                  key={preset.genre}
                  onClick={() => setSelectedGenre(preset.genre)}
                  className={`app-card text-left transition-all ${
                    selectedGenre === preset.genre
                      ? 'border-purple-500 shadow-xl shadow-purple-500/30'
                      : ''
                  }`}
                >
                  <div className="text-5xl mb-3">{preset.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {preset.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {preset.description}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      BPM: {preset.bpm.min}-{preset.bpm.max}
                    </div>
                    <div>밀도: {preset.density * 100}%</div>
                    <div>밝기: {preset.brightness * 100}%</div>
                    <div>
                      스케일: {preset.scale === 'major' ? '장조' : '단조'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 시작 버튼 */}
        {selectedType && selectedGenre && (
          <div className="flex justify-center animate-fade-in">
            <button
              onClick={handleStartCreation}
              className="px-12 py-5 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white text-xl font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
            >
              ▶️ 생성 시작하기
            </button>
          </div>
        )}

        {/* 주요 기능 소개 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-700/50">
          <div className="space-y-3">
            <div className="text-4xl">🎯</div>
            <h3 className="text-lg font-bold text-white">게임 특화 프리셋</h3>
            <p className="text-sm text-gray-400">
              RPG, FPS, 퍼즐, 레이싱, 레트로 장르별 최적화된 음악 생성
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-4xl">🔄</div>
            <h3 className="text-lg font-bold text-white">포맷 변환</h3>
            <p className="text-sm text-gray-400">
              WAV, MP3, OGG, FLAC 등 다양한 포맷으로 변환 지원
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-4xl">⚙️</div>
            <h3 className="text-lg font-bold text-white">최적화</h3>
            <p className="text-sm text-gray-400">
              압축, 정규화, 무음 제거 등 자동 최적화 기능
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
