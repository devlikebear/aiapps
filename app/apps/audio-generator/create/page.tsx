'use client';

import { useState, useEffect } from 'react';
import { Button, Select, Input, RangeSlider } from '@aiapps/ui';
import { useAudioStore } from '@/lib/stores/audio-store';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import { useAudioGeneration } from '@/lib/hooks/useMediaGeneration';
import { useGoogleDriveUpload } from '@/lib/google-drive/hooks';
import { GAME_PRESETS } from '@/lib/audio/types';
import type { GameGenre, AudioType } from '@/lib/audio/types';
import AudioPlayer from '@/components/audio/AudioPlayer';
import PresetSelector from '@/components/audio/PresetSelector';
import AudioPromptBuilder from '@/components/audio/AudioPromptBuilder';
import { downloadAudio } from '@/lib/audio/converter';
import { getApiKey } from '@/lib/api-key/storage';
import { jobQueue } from '@/lib/queue';
import { getAllAudio } from '@/lib/storage/indexed-db';
import { generateAudioTags } from '@/lib/utils/tags';
import { getBuiltinAudioPresetsByType } from '@/lib/audio/builtin-presets';
import type { AudioPresetBuilderSchema } from '@/lib/audio/preset-builder-schema';
import { Play, Pause, Download, Cloud } from 'lucide-react';

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
  const { isAuthenticated } = useGoogleDriveStore();
  const uploadFile = useGoogleDriveUpload();

  // Form state
  const [type, setType] = useState<AudioType>('bgm');
  const [genre, setGenre] = useState<GameGenre>('rpg');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(60);
  const [customBpm, setCustomBpm] = useState<number | null>(null);

  // Preset builder state
  const [usePresetBuilder, setUsePresetBuilder] = useState(false);
  const [selectedPreset, setSelectedPreset] =
    useState<AudioPresetBuilderSchema | null>(null);

  // Related audio state
  const [relatedAudio, setRelatedAudio] = useState<StoredAudio[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Map<string, HTMLAudioElement>
  >(new Map());

  // Google Drive save state
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  const preset = GAME_PRESETS[genre];

  // 타입 변경 시 duration 자동 조정
  useEffect(() => {
    setDuration(type === 'bgm' ? 60 : 5);
  }, [type]);

  // 프리셋 모드 변경 시 초기화
  useEffect(() => {
    if (usePresetBuilder) {
      // 프리셋 빌더 모드 활성화 시 기본 프리셋 선택
      const presets = getBuiltinAudioPresetsByType(type);
      if (presets.length > 0) {
        setSelectedPreset(presets[0]);
      }
    } else {
      // 자유형 모드로 전환 시 프리셋 초기화
      setSelectedPreset(null);
    }
  }, [usePresetBuilder, type]);

  // 관련 오디오 로드 및 필터링
  useEffect(() => {
    const loadRelatedAudio = async () => {
      try {
        const allAudio = await getAllAudio();

        // 현재 설정에서 태그 생성
        const currentBpm = customBpm || preset.bpm.default;
        const currentTags = generateAudioTags({
          type,
          genre,
          bpm: currentBpm,
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
        // eslint-disable-next-line no-console
        console.error('Failed to load related audio:', error);
      }
    };

    loadRelatedAudio();
  }, [type, genre, customBpm, preset.bpm.default, duration, preset]);

  // 오디오 생성 완료 이벤트 리스너
  useAudioGeneration((event) => {
    // eslint-disable-next-line no-console
    console.log('[AudioGenerator] Audio generation completed:', event);

    // 관련 오디오 새로 고침
    void (async () => {
      try {
        const allAudio = await getAllAudio();

        // 현재 설정에서 태그 생성
        const currentBpm = customBpm || preset.bpm.default;
        const currentTags = generateAudioTags({
          type,
          genre,
          bpm: currentBpm,
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
        // eslint-disable-next-line no-console
        console.error('Failed to refresh related audio:', error);
      }
    })();
  });

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
      jobQueue.addAudioGenerateJob({
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

  // Google Drive 저장 핸들러
  const handleSaveToGoogleDrive = async () => {
    if (!currentAudio) return;
    if (!isAuthenticated) {
      setError('Google Drive에 저장하려면 먼저 로그인해주세요');
      return;
    }

    setIsSavingToDrive(true);
    try {
      // ArrayBuffer를 Blob으로 변환
      const audioBlob = new Blob([currentAudio.audioData], {
        type: 'audio/wav',
      });

      // 파일명 생성
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-');
      const filename = `audio-${timestamp}.wav`;

      // 메타데이터
      const metadata: Record<string, string> = {
        prompt: currentAudio.metadata.prompt || '',
        type: currentAudio.metadata.type || '',
        genre: currentAudio.metadata.genre || '',
        bpm: String(currentAudio.metadata.bpm || ''),
        duration: String(currentAudio.metadata.duration || ''),
      };

      // Google Drive 업로드
      const result = await uploadFile(audioBlob, filename, 'audio', metadata);

      if (result) {
        setError('');
        // 성공 메시지
        alert('✅ 오디오가 Google Drive에 저장되었습니다!');
      } else {
        setError('Google Drive 저장에 실패했습니다');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Google Drive 저장 중 오류 발생';
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('Google Drive save error:', err);
    } finally {
      setIsSavingToDrive(false);
    }
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
              <Select
                label="오디오 타입"
                value={type}
                onChange={(e) => setType(e.target.value as AudioType)}
                options={[
                  { value: 'bgm', label: '🎼 배경 음악 (BGM)' },
                  { value: 'sfx', label: '⚡ 효과음 (SFX)' },
                ]}
                helperText={
                  type === 'bgm'
                    ? '루프 가능한 배경 음악 (30초~5분)'
                    : '짧은 효과음 (0.1초~3초)'
                }
                fullWidth
              />
            </div>

            {/* Game Genre */}
            <div>
              <Select
                label="게임 장르"
                value={genre}
                onChange={(e) => setGenre(e.target.value as GameGenre)}
                options={Object.entries(GAME_PRESETS).map(([key, preset]) => ({
                  value: key,
                  label: `${preset.icon} ${preset.name}`,
                }))}
                helperText={preset.description}
                fullWidth
              />
            </div>
          </div>

          {/* Prompt Input Mode Toggle */}
          <div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUsePresetBuilder(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !usePresetBuilder
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ✍️ 자유형 입력
              </button>
              <button
                onClick={() => setUsePresetBuilder(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  usePresetBuilder
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🎛️ 프리셋 빌더
              </button>
            </div>
          </div>

          {/* Prompt - Free Form Mode */}
          {!usePresetBuilder && (
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
          )}

          {/* Prompt - Preset Builder Mode */}
          {usePresetBuilder && selectedPreset && (
            <div className="space-y-4">
              {/* Preset Selector */}
              <PresetSelector
                onPresetSelect={(preset) => setSelectedPreset(preset)}
                selectedPreset={selectedPreset}
              />

              {/* Prompt Builder */}
              <AudioPromptBuilder
                preset={selectedPreset}
                onPromptChange={(generatedPrompt) => setPrompt(generatedPrompt)}
              />
            </div>
          )}

          {/* Duration & BPM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <RangeSlider
              label="재생 시간"
              min={type === 'bgm' ? 30 : 1}
              max={type === 'bgm' ? 300 : 10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              helperText={`${type === 'bgm' ? '30초 ~ 5분' : '1초 ~ 10초'}`}
              fullWidth
            />

            {/* BPM */}
            <div>
              <Input
                type="number"
                label={`BPM (기본: ${preset.bpm.default})`}
                min={preset.bpm.min}
                max={preset.bpm.max}
                value={customBpm || preset.bpm.default}
                onChange={(e) => setCustomBpm(Number(e.target.value))}
                helperText={`Min: ${preset.bpm.min}, Max: ${preset.bpm.max}`}
                fullWidth
              />
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
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            variant="primary"
            size="lg"
            fullWidth
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            🎵 작업 큐에 추가하기
          </Button>
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

            {/* Download & Save Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleDownload('wav')}
                variant="primary"
                size="md"
                className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700"
              >
                💾 WAV 다운로드
              </Button>
              <Button
                onClick={() => handleDownload('mp3')}
                variant="primary"
                size="md"
                className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                💾 MP3 다운로드
              </Button>
              <Button
                onClick={() => handleDownload('ogg')}
                variant="primary"
                size="md"
                className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700"
              >
                💾 OGG 다운로드
              </Button>
              <Button
                onClick={handleSaveToGoogleDrive}
                disabled={isSavingToDrive || !isAuthenticated}
                variant="primary"
                size="md"
                className="flex-1 min-w-[120px] bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
              >
                {isSavingToDrive ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-cyan-200 mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-1" />
                    Google Drive에 저장
                  </>
                )}
              </Button>
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
                    <Button
                      onClick={() => togglePlayRelated(audio.id, audio.data)}
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownloadRelated(audio.data, audio.id, 'wav')
                      }
                      variant="secondary"
                      size="sm"
                      title="WAV 다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
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
