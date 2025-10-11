/**
 * Job Queue Type Definitions
 * For background task management and processing
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobType =
  | 'image-generation'
  | 'image-edit'
  | 'image-compose'
  | 'style-transfer';

export interface BaseJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0-100
  priority: number; // 1-10, higher = more important
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  retryCount: number;
  maxRetries: number;
}

export interface ImageGenerationJob extends BaseJob {
  type: 'image-generation';
  params: {
    prompt: string;
    style: string;
    width: number;
    height: number;
    aspectRatio: string;
    seed?: number;
    referenceImage?: string; // base64
    referenceInfluence?: number;
  };
  result?: {
    imageData: string; // base64
    metadata: {
      id: string;
      prompt: string;
      style: string;
      width: number;
      height: number;
      aspectRatio: string;
      seed?: number;
      createdAt: string;
    };
  };
}

export interface ImageEditJob extends BaseJob {
  type: 'image-edit';
  params: {
    imageData: string; // base64
    prompt: string;
    mask?: string; // base64 mask image
  };
  result?: {
    imageData: string;
    metadata: {
      id: string;
      originalImageId: string;
      editPrompt: string;
      createdAt: string;
    };
  };
}

export interface ImageComposeJob extends BaseJob {
  type: 'image-compose';
  params: {
    images: Array<{
      data: string; // base64
      position?: string;
    }>;
    prompt: string;
    width: number;
    height: number;
  };
  result?: {
    imageData: string;
    metadata: {
      id: string;
      sourceImageIds: string[];
      composePrompt: string;
      createdAt: string;
    };
  };
}

export interface StyleTransferJob extends BaseJob {
  type: 'style-transfer';
  params: {
    baseImage: string; // base64
    styleImage: string; // base64
    intensity: number; // 0-1
  };
  result?: {
    imageData: string;
    metadata: {
      id: string;
      baseImageId: string;
      styleImageId: string;
      intensity: number;
      createdAt: string;
    };
  };
}

export type Job =
  | ImageGenerationJob
  | ImageEditJob
  | ImageComposeJob
  | StyleTransferJob;

export interface JobQueueState {
  jobs: Job[];
  activeJobId: string | null;
}

export interface JobQueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}
