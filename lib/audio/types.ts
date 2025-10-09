/**
 * Audio Generator 앱 타입 정의
 */

/**
 * 게임 장르 타입
 */
export type GameGenre = 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro';

/**
 * 오디오 타입
 */
export type AudioType = 'bgm' | 'sfx';

/**
 * 오디오 파일 포맷
 */
export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'flac' | 'aac' | 'm4a';

/**
 * 압축 품질 레벨
 */
export type CompressionQuality = 'low' | 'medium' | 'high' | 'lossless';

/**
 * 게임 프리셋 설정
 */
export interface GamePreset {
  genre: GameGenre;
  name: string;
  description: string;
  bpm: {
    min: number;
    max: number;
    default: number;
  };
  density: number; // 0.0-1.0
  brightness: number; // 0.0-1.0
  scale: 'major' | 'minor';
  promptTemplate: string;
  icon: string;
}

/**
 * Audio Generator 요청 파라미터
 */
export interface AudioGenerateRequest {
  // 기본 설정
  type: AudioType; // BGM 또는 SFX
  genre: GameGenre; // 게임 장르

  // 프롬프트
  prompt: string;

  // 음악 파라미터 (선택적 - 프리셋에서 오버라이드 가능)
  bpm?: number; // 60-200
  duration?: number; // 초 단위 (5-300)
  density?: number; // 0.0-1.0
  brightness?: number; // 0.0-1.0
  scale?: 'major' | 'minor';

  // 생성 모드
  mode?: 'quality' | 'diversity';
}

/**
 * 오디오 변환 요청
 */
export interface AudioConversionRequest {
  sourceFormat: AudioFormat;
  targetFormat: AudioFormat;
  quality?: CompressionQuality;

  // 최적화 옵션
  normalize?: boolean; // 볼륨 정규화
  trimSilence?: boolean; // 무음 제거
  fadeIn?: number; // 페이드인 (초)
  fadeOut?: number; // 페이드아웃 (초)

  // 비트레이트 (MP3, AAC, OGG)
  bitrate?: number; // kbps (64-320)

  // 샘플레이트 변환
  sampleRate?: number; // Hz (8000-96000)
}

/**
 * 오디오 압축 옵션
 */
export interface AudioCompressionOptions {
  quality: CompressionQuality;
  targetSizeKB?: number; // 목표 파일 크기
  bitrate?: number; // 비트레이트 (kbps)
  sampleRate?: number; // 샘플레이트 (Hz)
  channels?: 1 | 2; // 모노 또는 스테레오
}

/**
 * 생성된 오디오 메타데이터
 */
export interface AudioMetadata {
  id: string;
  type: AudioType;
  genre: GameGenre;

  // 파일 정보
  format: AudioFormat;
  duration: number; // 초
  fileSize: number; // bytes
  sampleRate: number; // Hz
  bitDepth: number; // bits
  channels: number; // 1 or 2
  bitrate?: number; // kbps (압축 포맷용)

  // 음악 정보
  bpm?: number;
  key?: string;
  scale?: string;

  // 생성 정보
  prompt: string;
  createdAt: Date;

  // 최적화 정보
  isCompressed: boolean;
  compressionRatio?: number; // 압축 비율 (%)
  originalSize?: number; // 원본 크기 (bytes)
}

/**
 * Audio Generator 응답
 */
export interface AudioGenerateResponse {
  audio: {
    data: ArrayBuffer;
    format: AudioFormat;
  };
  metadata: AudioMetadata;
}

/**
 * 오디오 변환 응답
 */
export interface AudioConversionResponse {
  audio: {
    data: ArrayBuffer;
    format: AudioFormat;
  };
  metadata: {
    originalSize: number;
    convertedSize: number;
    compressionRatio: number;
    format: AudioFormat;
    sampleRate: number;
    channels: number;
    bitrate?: number;
  };
}

/**
 * 오디오 라이브러리 아이템
 */
export interface AudioLibraryItem {
  id: string;
  name: string;
  type: AudioType;
  genre: GameGenre;

  // 파일 정보
  url: string; // 다운로드 URL
  format: AudioFormat;
  fileSize: number;
  duration: number;

  // 메타데이터
  metadata: AudioMetadata;

  // 관리
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  favorite?: boolean;
}

/**
 * 오디오 생성 진행 상태
 */
export interface AudioGenerationProgress {
  status:
    | 'pending'
    | 'generating'
    | 'converting'
    | 'optimizing'
    | 'complete'
    | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // 초
}

/**
 * 오디오 플레이어 상태
 */
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number; // 초
  duration: number; // 초
  volume: number; // 0-1
  isMuted: boolean;
  isLooping: boolean;
}

/**
 * 게임 프리셋 목록
 */
export const GAME_PRESETS: Record<GameGenre, GamePreset> = {
  rpg: {
    genre: 'rpg',
    name: 'RPG 어드벤처',
    description: '웅장한 오케스트라와 판타지 분위기',
    bpm: { min: 80, max: 140, default: 110 },
    density: 0.7,
    brightness: 0.6,
    scale: 'major',
    promptTemplate: 'Epic orchestral fantasy music with {mood} atmosphere',
    icon: '⚔️',
  },
  fps: {
    genre: 'fps',
    name: 'FPS 액션',
    description: '긴장감 넘치는 전자 음악',
    bpm: { min: 140, max: 180, default: 160 },
    density: 0.8,
    brightness: 0.7,
    scale: 'minor',
    promptTemplate: 'Intense electronic action music with {mood} energy',
    icon: '🎯',
  },
  puzzle: {
    genre: 'puzzle',
    name: '퍼즐 게임',
    description: '집중력을 높이는 차분한 선율',
    bpm: { min: 60, max: 100, default: 80 },
    density: 0.4,
    brightness: 0.5,
    scale: 'major',
    promptTemplate: 'Calm ambient puzzle music with {mood} melody',
    icon: '🧩',
  },
  racing: {
    genre: 'racing',
    name: '레이싱 게임',
    description: '속도감 있는 에너제틱 사운드',
    bpm: { min: 150, max: 200, default: 170 },
    density: 0.9,
    brightness: 0.8,
    scale: 'major',
    promptTemplate: 'Energetic racing music with {mood} drive',
    icon: '🏎️',
  },
  retro: {
    genre: 'retro',
    name: '레트로 8비트',
    description: '향수를 자극하는 칩튠 사운드',
    bpm: { min: 100, max: 160, default: 130 },
    density: 0.6,
    brightness: 0.7,
    scale: 'major',
    promptTemplate: '8-bit chiptune retro game music with {mood} vibe',
    icon: '👾',
  },
};

/**
 * 오디오 포맷 정보
 */
export const AUDIO_FORMAT_INFO: Record<
  AudioFormat,
  {
    name: string;
    extension: string;
    mimeType: string;
    quality: 'lossy' | 'lossless';
    description: string;
  }
> = {
  wav: {
    name: 'WAV',
    extension: '.wav',
    mimeType: 'audio/wav',
    quality: 'lossless',
    description: '무손실 고품질 (용량 큼)',
  },
  mp3: {
    name: 'MP3',
    extension: '.mp3',
    mimeType: 'audio/mpeg',
    quality: 'lossy',
    description: '범용적 호환성 (중간 용량)',
  },
  ogg: {
    name: 'OGG Vorbis',
    extension: '.ogg',
    mimeType: 'audio/ogg',
    quality: 'lossy',
    description: '오픈소스 (MP3 대체)',
  },
  flac: {
    name: 'FLAC',
    extension: '.flac',
    mimeType: 'audio/flac',
    quality: 'lossless',
    description: '무손실 압축 (WAV보다 작음)',
  },
  aac: {
    name: 'AAC',
    extension: '.aac',
    mimeType: 'audio/aac',
    quality: 'lossy',
    description: 'MP3보다 고품질 (iOS 최적화)',
  },
  m4a: {
    name: 'M4A',
    extension: '.m4a',
    mimeType: 'audio/mp4',
    quality: 'lossy',
    description: 'Apple 기기 최적화',
  },
};

/**
 * 압축 품질 프리셋
 */
export const COMPRESSION_PRESETS: Record<
  CompressionQuality,
  {
    name: string;
    bitrate: number; // kbps
    sampleRate: number; // Hz
    description: string;
  }
> = {
  low: {
    name: '저품질 (최소 용량)',
    bitrate: 96,
    sampleRate: 22050,
    description: '~1MB/분 (모바일 최적화)',
  },
  medium: {
    name: '중품질 (균형)',
    bitrate: 160,
    sampleRate: 44100,
    description: '~2MB/분 (웹 권장)',
  },
  high: {
    name: '고품질',
    bitrate: 256,
    sampleRate: 48000,
    description: '~3MB/분 (고품질)',
  },
  lossless: {
    name: '무손실',
    bitrate: 1411, // CD quality
    sampleRate: 48000,
    description: '~10MB/분 (원본 품질)',
  },
};
