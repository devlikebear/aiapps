'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Download, Trash2, Music } from 'lucide-react';
import {
  getAllAudio,
  deleteAudio,
  getStorageSize,
} from '@/lib/storage/indexed-db';

interface StoredAudio {
  id: string;
  data: string; // base64
  metadata: {
    id: string;
    type: string;
    genre: string;
    prompt: string;
    duration: number;
    bpm?: number;
    createdAt: string;
  };
  createdAt: Date;
}

export default function AudioLibraryPage() {
  const [audioList, setAudioList] = useState<StoredAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{
    audioCount: number;
    imageCount: number;
    estimatedSize: number;
  } | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    loadAudioLibrary();
    loadStorageInfo();
  }, []);

  const loadAudioLibrary = async () => {
    try {
      setIsLoading(true);
      const audios = await getAllAudio();
      // 최신순으로 정렬
      const sorted = audios.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAudioList(sorted);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load audio library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageSize();
      setStorageInfo(info);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load storage info:', error);
    }
  };

  const handlePlay = (audio: StoredAudio) => {
    // 기존 재생 중인 오디오 정지
    if (playingId && playingId !== audio.id) {
      const prevAudio = audioElements.get(playingId);
      if (prevAudio) {
        prevAudio.pause();
      }
    }

    // 오디오 엘리먼트 가져오기 또는 생성
    let audioElement = audioElements.get(audio.id);
    if (!audioElement) {
      // Base64를 Blob으로 변환
      const byteCharacters = atob(audio.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const blobUrl = URL.createObjectURL(blob);

      audioElement = new Audio(blobUrl);
      audioElement.addEventListener('ended', () => {
        setPlayingId(null);
      });
      audioElements.set(audio.id, audioElement);
    }

    if (playingId === audio.id) {
      // 현재 재생 중이면 일시정지
      audioElement.pause();
      setPlayingId(null);
    } else {
      // 재생
      audioElement.play();
      setPlayingId(audio.id);
    }
  };

  const handleDownload = (audio: StoredAudio) => {
    // Base64를 Blob으로 변환
    const byteCharacters = atob(audio.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-${audio.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 오디오를 삭제하시겠습니까?')) return;

    try {
      await deleteAudio(id);
      setAudioList((prev) => prev.filter((audio) => audio.id !== id));

      // 오디오 엘리먼트 정리
      const audioElement = audioElements.get(id);
      if (audioElement) {
        audioElement.pause();
        const blobUrl = audioElement.src;
        if (blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
        audioElements.delete(id);
      }

      if (playingId === id) {
        setPlayingId(null);
      }

      // 저장소 정보 업데이트
      loadStorageInfo();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete audio:', error);
      alert('오디오 삭제에 실패했습니다.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/apps/audio-generator"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">오디오 라이브러리</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                생성된 오디오를 탐색하고 관리하세요
              </p>
            </div>
          </div>

          {storageInfo && (
            <div className="app-card p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>오디오: {storageInfo.audioCount}개</div>
                <div>저장소: {formatFileSize(storageInfo.estimatedSize)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                라이브러리 로딩 중...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && audioList.length === 0 && (
          <div className="text-center py-20">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">
              저장된 오디오가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              오디오를 생성하면 여기에 자동으로 저장됩니다
            </p>
            <Link
              href="/apps/audio-generator/create"
              className="app-button inline-flex items-center gap-2"
            >
              <Music className="w-5 h-5" />
              오디오 생성하기
            </Link>
          </div>
        )}

        {/* Audio List */}
        {!isLoading && audioList.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {audioList.map((audio) => (
              <div
                key={audio.id}
                className="app-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Audio Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {audio.metadata.type}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        {audio.metadata.genre}
                      </span>
                      {audio.metadata.bpm && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {audio.metadata.bpm} BPM
                        </span>
                      )}
                    </div>

                    <p className="text-lg font-medium mb-2 break-words">
                      {audio.metadata.prompt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatDuration(audio.metadata.duration)}</span>
                      <span>•</span>
                      <span>{formatDate(audio.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlay(audio)}
                      className="p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      title={playingId === audio.id ? '일시정지' : '재생'}
                    >
                      {playingId === audio.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload(audio)}
                      className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="다운로드"
                    >
                      <Download className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(audio.id)}
                      className="p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
