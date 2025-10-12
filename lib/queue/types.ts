/**
 * 백그라운드 작업 큐 타입 정의
 * 미디어 생성/편집 작업을 비동기로 관리하기 위한 시스템
 */

import type { ArtStyle, QualityPreset, ReferenceUsage } from '@/lib/art/types';

export type JobType =
  | 'audio-generate'
  | 'image-generate'
  | 'image-edit'
  | 'image-compose'
  | 'image-style-transfer';

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
  progress: number; // 0-100
  error?: string;
  retryCount: number;
  maxRetries: number;
  priority: number; // 1-10, 높을수록 먼저 처리
}

/**
 * 오디오 생성 작업
 */
export interface AudioGenerateJob extends BaseJob {
  type: 'audio-generate';
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
export interface ImageGenerateJob extends BaseJob {
  type: 'image-generate';
  params: {
    prompt: string;
    style: ArtStyle;
    resolution: string;
    quality?: QualityPreset;
    batchSize?: number;
    seed?: number;
    referenceImages?: {
      images: string[];
      usages: ReferenceUsage[];
      influence: number;
    };
  };
  result?: {
    images: Array<{
      data: string; // base64
      metadata: Record<string, unknown>;
    }>;
  };
}

/**
 * 이미지 편집 작업
 */
export interface ImageEditJob extends BaseJob {
  type: 'image-edit';
  params: {
    prompt: string;
    imageData: string; // base64
    mask?: string; // base64
    originalImageId?: string;
  };
  result?: {
    imageData: string;
    metadata: Record<string, unknown>;
  };
}

/**
 * 이미지 합성 작업
 */
export interface ImageComposeJob extends BaseJob {
  type: 'image-compose';
  params: {
    images: string[]; // base64 data url
    prompt: string;
  };
  result?: {
    imageData: string;
    metadata: Record<string, unknown>;
  };
}

/**
 * 이미지 스타일 전이 작업
 */
export interface ImageStyleTransferJob extends BaseJob {
  type: 'image-style-transfer';
  params: {
    baseImage: string; // base64 data url
    stylePrompt: string;
    referenceImage?: string; // optional 추가 참조 이미지
  };
  result?: {
    imageData: string;
    metadata: Record<string, unknown>;
  };
}

/**
 * 작업 유니온 타입
 */
export type Job =
  | AudioGenerateJob
  | ImageGenerateJob
  | ImageEditJob
  | ImageComposeJob
  | ImageStyleTransferJob;

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
  | 'job:updated'
  | 'job:completed'
  | 'job:failed'
  | 'job:cancelled'
  | 'job:removed';

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
  byType: Record<JobType, number>;
}
