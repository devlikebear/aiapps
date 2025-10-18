/**
 * 백그라운드 작업 프로세서
 * 큐에 등록된 작업을 순차적으로 처리하고 결과를 IndexedDB에 저장
 */

import { jobQueue } from './job-queue';
import type {
  AudioGenerateJob,
  ImageComposeJob,
  ImageEditJob,
  ImageGenerateJob,
  ImageStyleTransferJob,
  TweetGenerateJob,
  Job,
} from './types';
import { saveAudio, saveImage } from '@/lib/storage/indexed-db';
import { saveTweet } from '@/lib/tweet/storage';
import { generateAudioTags, generateImageTags } from '@/lib/utils/tags';
import { getApiKey } from '@/lib/api-key/storage';
import type { ArtStyle, QualityPreset } from '@/lib/art/types';
import type { AudioMetadata } from '@/lib/audio/types';

const POLL_INTERVAL = 5000; // 5초
const MAX_CONCURRENT_JOBS = 2;
const REQUEST_TIMEOUT = 300000; // 5분

const COMPLETED_IMAGE_WIDTH = 1024;
const COMPLETED_IMAGE_HEIGHT = 1024;

export class JobProcessor {
  private isRunning = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private readonly processingJobs = new Set<string>();

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.poll();
    // eslint-disable-next-line no-console
    console.log('[JobProcessor] Started');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }

    // eslint-disable-next-line no-console
    console.log('[JobProcessor] Stopped');
  }

  private poll(): void {
    if (!this.isRunning) return;

    void this.processNextJobs();

    this.pollTimer = setTimeout(() => {
      this.poll();
    }, POLL_INTERVAL);
  }

  private async processNextJobs(): Promise<void> {
    const slots = MAX_CONCURRENT_JOBS - this.processingJobs.size;
    if (slots <= 0) return;

    const pendingJobs = jobQueue
      .getPendingJobs()
      .filter((job) => !this.processingJobs.has(job.id))
      .slice(0, slots);

    await Promise.all(pendingJobs.map((job) => this.processJob(job)));
  }

  private async processJob(job: Job): Promise<void> {
    this.processingJobs.add(job.id);

    try {
      jobQueue.updateJob(job.id, { status: 'processing', progress: 5 });

      switch (job.type) {
        case 'audio-generate':
          await this.processAudioGenerateJob(job as AudioGenerateJob);
          break;
        case 'image-generate':
          await this.processImageGenerateJob(job as ImageGenerateJob);
          break;
        case 'image-edit':
          await this.processImageEditJob(job as ImageEditJob);
          break;
        case 'image-compose':
          await this.processImageComposeJob(job as ImageComposeJob);
          break;
        case 'image-style-transfer':
          await this.processImageStyleTransferJob(job as ImageStyleTransferJob);
          break;
        case 'tweet-generate':
          await this.processTweetGenerateJob(job as TweetGenerateJob);
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.error(`[JobProcessor] Job failed: ${job.id}`, error);
      jobQueue.updateJob(job.id, {
        status: 'failed',
        progress: 0,
        error: message,
      });
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  private async processAudioGenerateJob(job: AudioGenerateJob): Promise<void> {
    const response = await this.fetchWithTimeout('/api/audio/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey('gemini') || '',
      },
      body: JSON.stringify({
        prompt: job.params.prompt,
        genre: job.params.genre,
        type: job.params.audioType,
        bpm: job.params.bpm,
        duration: job.params.duration,
        density: job.params.density,
        brightness: job.params.brightness,
        scale: job.params.scale,
        mode: job.params.mode,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Audio generation failed');
    }

    const result = await response.json();

    jobQueue.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      result: {
        audioBase64: result.audioBase64,
        metadata: result.metadata,
      },
    });

    await this.saveAudio(job, result);

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Audio job completed: ${job.id}`);
  }

  private async processImageGenerateJob(job: ImageGenerateJob): Promise<void> {
    const response = await this.fetchWithTimeout('/api/art/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey('gemini') || '',
      },
      body: JSON.stringify({
        prompt: job.params.prompt,
        style: job.params.style,
        resolution: job.params.resolution,
        quality: job.params.quality,
        batchSize: job.params.batchSize ?? 1,
        seed: job.params.seed,
        referenceImages: job.params.referenceImages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Image generation failed');
    }

    const result = await response.json();
    const images = Array.isArray(result.images) ? result.images : [];

    jobQueue.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      result: { images },
    });

    await this.saveGeneratedImages(job, images);

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Image generate job completed: ${job.id}`);
  }

  private async processImageEditJob(job: ImageEditJob): Promise<void> {
    const response = await this.fetchWithTimeout('/api/art/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey('gemini') || '',
      },
      body: JSON.stringify({
        imageData: job.params.imageData,
        prompt: job.params.prompt,
        mask: job.params.mask,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Image edit failed');
    }

    const result = await response.json();
    const imageData = result.data as string;
    const metadata =
      (result.metadata as Record<string, unknown>) ??
      ({} as Record<string, unknown>);

    const completedJob = jobQueue.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      result: {
        imageData,
        metadata,
      },
    });

    if (completedJob) {
      await this.saveDerivedImage({
        jobId: job.id,
        imageData,
        metadata,
        prompt: job.params.prompt,
        tags: ['edited', 'image-edit'],
      });
    }

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Image edit job completed: ${job.id}`);
  }

  private async processImageComposeJob(job: ImageComposeJob): Promise<void> {
    const response = await this.fetchWithTimeout('/api/art/compose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey('gemini') || '',
      },
      body: JSON.stringify({
        images: job.params.images,
        prompt: job.params.prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Image composition failed');
    }

    const result = await response.json();
    const imageData = result.data as string;
    const metadata =
      (result.metadata as Record<string, unknown>) ??
      ({} as Record<string, unknown>);

    const completedJob = jobQueue.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      result: {
        imageData,
        metadata,
      },
    });

    if (completedJob) {
      await this.saveDerivedImage({
        jobId: job.id,
        imageData,
        metadata,
        prompt: job.params.prompt,
        tags: ['composed', 'image-compose'],
      });
    }

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Image compose job completed: ${job.id}`);
  }

  private async processImageStyleTransferJob(
    job: ImageStyleTransferJob
  ): Promise<void> {
    const stylePrompt = job.params.referenceImage
      ? `${job.params.stylePrompt}. Reference style image provided.`
      : job.params.stylePrompt;

    const response = await this.fetchWithTimeout('/api/art/style-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey('gemini') || '',
      },
      body: JSON.stringify({
        baseImage: job.params.baseImage,
        stylePrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Style transfer failed');
    }

    const result = await response.json();
    const imageData = result.data as string;
    const metadata =
      (result.metadata as Record<string, unknown>) ??
      ({} as Record<string, unknown>);

    const completedJob = jobQueue.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      result: {
        imageData,
        metadata,
      },
    });

    if (completedJob) {
      await this.saveDerivedImage({
        jobId: job.id,
        imageData,
        metadata,
        prompt: job.params.stylePrompt,
        tags: ['style-transfer', 'image-style-transfer'],
      });
    }

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Style transfer job completed: ${job.id}`);
  }

  private async processTweetGenerateJob(job: TweetGenerateJob): Promise<void> {
    const response = await this.fetchWithTimeout('/api/tweet/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey('gemini') || '',
      },
      body: JSON.stringify({
        prompt: job.params.prompt,
        tone: job.params.tone,
        length: job.params.length,
        hashtags: job.params.hashtags,
        emoji: job.params.emoji,
        mode: job.params.mode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Tweet generation failed');
    }

    const result = await response.json();
    const tweet = result.tweet as string;

    const tweetMetadata = {
      id: job.id,
      prompt: job.params.prompt,
      tone: job.params.tone,
      length: job.params.length,
      hasHashtags: job.params.hashtags,
      hasEmoji: job.params.emoji,
      createdAt: new Date().toISOString(),
    };

    const completedJob = jobQueue.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      result: {
        tweet,
        metadata: tweetMetadata,
      },
    });

    if (completedJob) {
      // IndexedDB에 저장
      await saveTweet({
        id: job.id,
        tweet,
        metadata: tweetMetadata,
        createdAt: new Date().toISOString(),
      });

      // Google Drive에 자동 저장
      try {
        await this.saveTweetToGoogleDrive(job.id, tweet, tweetMetadata);
      } catch (error) {
        // Google Drive 저장 실패해도 작업은 완료 (IndexedDB는 저장됨)
        // eslint-disable-next-line no-console
        console.warn(
          `[JobProcessor] Failed to save tweet to Google Drive: ${job.id}`,
          error
        );
      }
    }

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Tweet generation job completed: ${job.id}`);
  }

  private async saveTweetToGoogleDrive(
    tweetId: string,
    tweetContent: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      const { useGoogleDriveStore } = await import(
        '@/lib/stores/google-drive-store'
      );
      const { uploadFileToGoogleDrive, optimizeMetadataForGoogleDrive } =
        await import('@/lib/google-drive/client');

      const store = useGoogleDriveStore.getState();

      // 인증 확인
      if (
        !store.isAuthenticated ||
        !store.accessToken ||
        !store.tweetsFolderId
      ) {
        // eslint-disable-next-line no-console
        console.log(
          '[JobProcessor] Google Drive not authenticated or tweets folder not found, skipping upload'
        );
        return;
      }

      // 트윗을 텍스트 파일로 저장
      const tweetBlob = new Blob([tweetContent], { type: 'text/plain' });
      const filename = `tweet-${tweetId}.txt`;

      // 메타데이터 최적화
      const optimizedMetadata = optimizeMetadataForGoogleDrive({
        tweetId,
        tone: String(metadata.tone || ''),
        length: String(metadata.length || ''),
        prompt: String(metadata.prompt || '').substring(0, 50),
        createdAt: String(metadata.createdAt || ''),
      });

      const uploadedFile = await uploadFileToGoogleDrive(
        store.accessToken,
        tweetBlob,
        filename,
        store.tweetsFolderId,
        optimizedMetadata
      );

      // Store에 추가
      store.addTweetFile(uploadedFile);

      // eslint-disable-next-line no-console
      console.log(
        `[JobProcessor] Tweet saved to Google Drive: ${uploadedFile.id}`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[JobProcessor] Error saving tweet to Google Drive:',
        error
      );
      throw error;
    }
  }

  private async saveAudio(
    job: AudioGenerateJob,
    result: { audioBase64: string; metadata: Record<string, unknown> }
  ): Promise<void> {
    const tags = generateAudioTags({
      type: job.params.audioType as 'bgm' | 'sfx',
      genre: job.params.genre as 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro',
      bpm: job.params.bpm,
      duration: job.params.duration,
    });

    // AudioMetadata 구성 (필수 필드 포함)
    const audioMetadata: AudioMetadata = {
      id: job.id,
      type: job.params.audioType as 'bgm' | 'sfx',
      genre: job.params.genre as 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro',
      format: 'wav',
      duration: job.params.duration ?? 30,
      fileSize: 0, // Base64 크기는 정확하지 않으므로 0으로 설정
      sampleRate: 48000, // Gemini 기본값
      bitDepth: 16,
      channels: 2,
      bpm: job.params.bpm,
      scale: job.params.scale,
      prompt: job.params.prompt,
      createdAt: new Date() as unknown as Date,
      isCompressed: false,
    };

    // Base64 문자열을 ArrayBuffer로 변환
    const binaryString = atob(result.audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    // IndexedDB에 저장
    await saveAudio({
      id: job.id,
      blobUrl: '',
      data: result.audioBase64,
      metadata: audioMetadata,
      tags,
    });

    // audioStore에도 업데이트 (재생용)
    try {
      const { useAudioStore } = await import('@/lib/stores/audio-store');
      const audioStore = useAudioStore.getState();
      audioStore.setGeneratedAudio(arrayBuffer, audioMetadata);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[JobProcessor] Failed to update audio store:', err);
    }
  }

  private async saveGeneratedImages(
    job: ImageGenerateJob,
    images: Array<{ data: string; metadata: Record<string, unknown> }>
  ): Promise<void> {
    const tags = generateImageTags({
      style: job.params.style as ArtStyle,
      resolution: job.params.resolution,
      quality: job.params.quality as QualityPreset | undefined,
    });

    await Promise.all(
      images.map((image, index) =>
        saveImage({
          id: `${job.id}-${index}-${Date.now()}`,
          blobUrl: '',
          data: image.data,
          metadata: {
            ...image.metadata,
            prompt: job.params.prompt,
            style: job.params.style,
            resolution: job.params.resolution,
            quality: job.params.quality,
            createdAt: new Date().toISOString(),
          },
          tags,
        })
      )
    );
  }

  private async saveDerivedImage({
    jobId,
    imageData,
    metadata,
    prompt,
    tags,
  }: {
    jobId: string;
    imageData: string;
    metadata: Record<string, unknown>;
    prompt: string;
    tags: string[];
  }): Promise<void> {
    const id =
      (metadata?.id as string | undefined) ?? `derived-${jobId}-${Date.now()}`;
    const baseMetadata = {
      id,
      prompt,
      style: metadata?.style ?? 'custom',
      width: metadata?.width ?? COMPLETED_IMAGE_WIDTH,
      height: metadata?.height ?? COMPLETED_IMAGE_HEIGHT,
      aspectRatio:
        metadata?.aspectRatio ??
        `${COMPLETED_IMAGE_WIDTH}x${COMPLETED_IMAGE_HEIGHT}`,
      createdAt: metadata?.createdAt ?? new Date().toISOString(),
    };

    await saveImage({
      id,
      blobUrl: '',
      data: imageData,
      metadata: baseMetadata,
      tags,
    });
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async retryJob(jobId: string): Promise<boolean> {
    const job = jobQueue.getJob(jobId);
    if (!job) return false;
    if (job.status !== 'failed' && job.status !== 'cancelled') return false;

    const updated = jobQueue.retryJob(jobId);
    return Boolean(updated);
  }
}

export const jobProcessor = new JobProcessor();
