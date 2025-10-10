'use client';

import { useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';

function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const {
    currentAudio,
    playerState,
    play,
    pause,
    stop,
    setVolume,
    setCurrentTime,
    setPlayerState,
    toggleMute,
    toggleLoop,
  } = useAudioStore();

  const { isPlaying, currentTime, duration, volume, isMuted, isLooping } =
    playerState;

  // Audio element 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    audio.src = currentAudio.audioUrl;
    audio.volume = isMuted ? 0 : volume;
    audio.loop = isLooping;

    // 메타데이터 로드
    const handleLoadedMetadata = () => {
      setPlayerState({ duration: audio.duration });
    };

    // 재생 시간 업데이트
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // 재생 종료
    const handleEnded = () => {
      if (!isLooping) {
        pause();
        setCurrentTime(0);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [
    currentAudio,
    isLooping,
    isMuted,
    volume,
    pause,
    setCurrentTime,
    setPlayerState,
  ]);

  // 재생/일시정지 제어
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Audio play error:', error);
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, pause]);

  // 볼륨/음소거 제어
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 시간 이동 (useCallback으로 메모이제이션)
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !audioRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration, setCurrentTime]
  );

  // 시간 포맷팅 (useCallback으로 메모이제이션)
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // progress 계산 (useMemo로 메모이제이션) - early return 전에 위치해야 함
  const progress = useMemo(
    () => (duration > 0 ? (currentTime / duration) * 100 : 0),
    [currentTime, duration]
  );

  if (!currentAudio) {
    return (
      <div className="app-card text-center py-12 text-gray-400">
        <div className="text-6xl mb-4">🎵</div>
        <p>생성된 오디오가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="app-card space-y-6">
      {/* 숨겨진 오디오 엘리먼트 */}
      <audio ref={audioRef} />

      {/* 메타데이터 */}
      <div className="flex items-start gap-4">
        <div className="text-6xl">🎼</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">
            {currentAudio.metadata.type === 'bgm' ? '배경 음악' : '효과음'}
          </h3>
          <p className="text-sm text-gray-400">
            {currentAudio.metadata.prompt}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>길이: {formatTime(duration)}</span>
            {currentAudio.metadata.bpm && (
              <span>BPM: {currentAudio.metadata.bpm}</span>
            )}
            {currentAudio.metadata.key && (
              <span>키: {currentAudio.metadata.key}</span>
            )}
            <span>
              크기: {(currentAudio.metadata.fileSize / 1024 / 1024).toFixed(2)}{' '}
              MB
            </span>
          </div>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="space-y-2">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="h-2 bg-slate-700 rounded-full cursor-pointer hover:bg-slate-600 transition-colors"
        >
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-purple-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center justify-between gap-4">
        {/* 재생 컨트롤 */}
        <div className="flex items-center gap-3">
          <button
            onClick={stop}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title="정지"
          >
            ⏹️
          </button>
          <button
            onClick={isPlaying ? pause : play}
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            title={isPlaying ? '일시정지' : '재생'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={toggleLoop}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
              isLooping
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title="반복"
          >
            🔁
          </button>
        </div>

        {/* 볼륨 컨트롤 */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-purple-600"
          />
          <span className="text-xs text-gray-400 w-8">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// React.memo로 컴포넌트 메모이제이션
export default memo(AudioPlayer);
