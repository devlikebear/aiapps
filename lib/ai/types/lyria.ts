/**
 * Gemini Lyria RealTime 관련 타입 정의
 */

/**
 * 음악 스케일 타입
 */
export type MusicalScale =
  | 'major'
  | 'minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

/**
 * 생성 모드
 */
export type GenerationMode = 'quality' | 'diversity';

/**
 * Lyria 요청 파라미터
 */
export interface LyriaRequest {
  prompt: string;
  weightedPrompts?: Array<{ prompt: string; weight: number }>;
  bpm?: number; // 60-200
  density?: number; // 0.0-1.0
  brightness?: number; // 0.0-1.0
  scale?: MusicalScale;
  guidanceLevel?: number; // 0.0-1.0
  mode?: GenerationMode;
  duration?: number; // 초 단위
}

/**
 * PCM 오디오 데이터
 */
export interface PCMAudioData {
  data: ArrayBuffer;
  sampleRate: number; // 48000 Hz
  channels: number; // 2 (스테레오)
  bitDepth: number; // 16-bit
}

/**
 * Lyria 스트리밍 응답
 */
export interface LyriaStreamResponse {
  type: 'audio' | 'metadata' | 'error' | 'complete';
  audio?: PCMAudioData;
  metadata?: {
    bpm?: number;
    key?: string;
    scale?: MusicalScale;
    duration?: number;
  };
  error?: {
    message: string;
    code: string;
  };
  progress?: number; // 0-100
}

/**
 * Lyria 최종 응답
 */
export interface LyriaResponse {
  audio: PCMAudioData;
  metadata: {
    bpm: number;
    key: string;
    scale: MusicalScale;
    duration: number;
  };
  requestId: string;
  generatedAt: Date;
}

/**
 * WebSocket 연결 상태
 */
export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

/**
 * Lyria 클라이언트 이벤트
 */
export interface LyriaClientEvents {
  stateChange: (state: ConnectionState) => void;
  stream: (response: LyriaStreamResponse) => void;
  complete: (response: LyriaResponse) => void;
  error: (error: Error) => void;
}
