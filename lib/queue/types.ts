/**
 * 백그라운드 작업 큐 타입 정의
 * 미디어 생성 작업을 비동기로 처리하기 위한 시스템
 */

export type JobType = 'audio' | 'image';

export type JobStatus =
  | 'pending' // 대기 중
  | 'processing' // 처리 중
  | 'completed' // 완료
  | 'failed' // 실패
  | 'cancelled'; // 취소됨

export interface BaseJob {
  id: string;
  type: JobType;
  status: JobStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  progress?: number; // 0-100
  error?: string;
}

/**
 * 오디오 생성 작업
 */
export interface AudioJob extends BaseJob {
  type: 'audio';
  params: {
    prompt: string;
    genre: string;
    audioType: string;
    bpm?: number;
    duration?: number;
    density?: number;
    brightness?: number;
    scale?: string;
    mode?: string;
  };
  result?: {
    audioBase64: string;
    metadata: Record<string, unknown>;
  };
}

/**
 * 이미지 생성 작업
 */
export interface ImageJob extends BaseJob {
  type: 'image';
  params: {
    prompt: string;
    style: string;
    resolution: string;
    quality?: string;
    batchSize?: number;
    seed?: number;
  };
  result?: {
    images: Array<{
      data: string; // base64
      metadata: Record<string, unknown>;
    }>;
  };
}

/**
 * 작업 유니온 타입
 */
export type Job = AudioJob | ImageJob;

/**
 * 작업 큐
 */
export interface JobQueue {
  jobs: Job[];
  lastUpdated: number;
}

/**
 * 작업 이벤트
 */
export type JobEventType =
  | 'job:added'
  | 'job:started'
  | 'job:progress'
  | 'job:completed'
  | 'job:failed'
  | 'job:cancelled';

export interface JobEvent {
  type: JobEventType;
  jobId: string;
  job: Job;
  timestamp: number;
}

/**
 * 작업 필터
 */
export interface JobFilter {
  type?: JobType;
  status?: JobStatus;
}

/**
 * 작업 통계
 */
export interface JobStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  byType: {
    audio: number;
    image: number;
  };
}
