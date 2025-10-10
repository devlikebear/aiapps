/**
 * 백그라운드 작업 프로세서
 * 작업 큐를 폴링하고 API 요청을 처리하며 결과를 IndexedDB에 저장
 */

import { jobQueue } from './job-queue';
import type { Job, AudioJob, ImageJob } from './types';
import { saveAudio, saveImage } from '@/lib/storage/indexed-db';
import { generateAudioTags, generateImageTags } from '@/lib/utils/tags';
import { getApiKey } from '@/lib/api-key/storage';

const POLL_INTERVAL = 5000; // 5초마다 폴링
const MAX_CONCURRENT_JOBS = 2; // 동시 처리 최대 작업 수
const REQUEST_TIMEOUT = 300000; // 5분 타임아웃

/**
 * 백그라운드 작업 프로세서 클래스
 */
export class JobProcessor {
  private isRunning = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private processingJobs: Set<string> = new Set();

  /**
   * 프로세서 시작
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.poll();

    // eslint-disable-next-line no-console
    console.log('[JobProcessor] Started');
  }

  /**
   * 프로세서 중지
   */
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

  /**
   * 폴링
   */
  private poll(): void {
    if (!this.isRunning) return;

    this.processNextJobs();

    this.pollTimer = setTimeout(() => {
      this.poll();
    }, POLL_INTERVAL);
  }

  /**
   * 다음 작업들 처리
   */
  private async processNextJobs(): Promise<void> {
    // 현재 처리 중인 작업 수 확인
    const currentProcessing = this.processingJobs.size;
    const availableSlots = MAX_CONCURRENT_JOBS - currentProcessing;

    if (availableSlots <= 0) return;

    // 대기 중인 작업 가져오기
    const pendingJobs = jobQueue.getPendingJobs();

    // 이미 처리 중인 작업 제외
    const jobsToProcess = pendingJobs
      .filter((job) => !this.processingJobs.has(job.id))
      .slice(0, availableSlots);

    // 작업 처리
    jobsToProcess.forEach((job) => {
      this.processJob(job);
    });
  }

  /**
   * 작업 처리
   */
  private async processJob(job: Job): Promise<void> {
    // 처리 중 표시
    this.processingJobs.add(job.id);

    try {
      // 작업 상태 업데이트
      jobQueue.updateJob(job.id, {
        status: 'processing',
        startedAt: Date.now(),
      });

      // eslint-disable-next-line no-console
      console.log(`[JobProcessor] Processing job: ${job.id} (${job.type})`);

      // 타입별 처리
      if (job.type === 'audio') {
        await this.processAudioJob(job as AudioJob);
      } else if (job.type === 'image') {
        await this.processImageJob(job as ImageJob);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[JobProcessor] Job failed: ${job.id}`, error);

      // 실패 처리
      jobQueue.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: Date.now(),
      });
    } finally {
      // 처리 중 표시 제거
      this.processingJobs.delete(job.id);
    }
  }

  /**
   * 오디오 작업 처리
   */
  private async processAudioJob(job: AudioJob): Promise<void> {
    // API 요청
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
      const error = await response.json();
      throw new Error(error.error || 'Audio generation failed');
    }

    const result = await response.json();

    // 작업 결과 업데이트
    jobQueue.updateJob(job.id, {
      status: 'completed',
      completedAt: Date.now(),
      result: {
        audioBase64: result.audioBase64,
        metadata: result.metadata,
      },
    });

    // IndexedDB에 저장
    await this.saveAudioToIndexedDB(job, result);

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Audio job completed: ${job.id}`);
  }

  /**
   * 이미지 작업 처리
   */
  private async processImageJob(job: ImageJob): Promise<void> {
    const batchSize = job.params.batchSize || 1;

    // API 요청 (batchSize는 API에서 한 번에 처리)
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
        batchSize: batchSize,
        seed: job.params.seed,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Image generation failed');
    }

    const result = await response.json();

    // API 응답 형식: { images: [{ data: string, metadata: {...} }] }
    const images = result.images.map(
      (img: { data: string; metadata: Record<string, unknown> }) => ({
        data: img.data,
        metadata: img.metadata,
      })
    );

    // 작업 결과 업데이트
    jobQueue.updateJob(job.id, {
      status: 'completed',
      completedAt: Date.now(),
      progress: 100,
      result: { images },
    });

    // IndexedDB에 저장
    await this.saveImagesToIndexedDB(job, images);

    // eslint-disable-next-line no-console
    console.log(`[JobProcessor] Image job completed: ${job.id}`);
  }

  /**
   * 오디오를 IndexedDB에 저장
   */
  private async saveAudioToIndexedDB(
    job: AudioJob,
    result: { audioBase64: string; metadata: Record<string, unknown> }
  ): Promise<void> {
    // 태그 생성
    const tags = generateAudioTags({
      type: job.params.audioType as 'bgm' | 'sfx',
      genre: job.params.genre as 'rpg' | 'fps' | 'puzzle' | 'racing' | 'retro',
      bpm: job.params.bpm,
      duration: job.params.duration,
    });

    // 저장
    await saveAudio({
      id: `${job.id}-${Date.now()}`,
      blobUrl: '', // 나중에 생성
      data: result.audioBase64,
      metadata: {
        ...result.metadata,
        prompt: job.params.prompt,
        genre: job.params.genre,
        type: job.params.audioType,
        createdAt: new Date().toISOString(),
      },
      tags,
    });
  }

  /**
   * 이미지를 IndexedDB에 저장
   */
  private async saveImagesToIndexedDB(
    job: ImageJob,
    images: Array<{ data: string; metadata: Record<string, unknown> }>
  ): Promise<void> {
    // 태그 생성
    const tags = generateImageTags({
      style: job.params.style as
        | 'pixel-art'
        | 'concept-art'
        | 'character-design'
        | 'environment'
        | 'ui-icons',
      resolution: job.params.resolution,
      quality: job.params.quality as 'draft' | 'standard' | 'high' | undefined,
    });

    // 각 이미지 저장
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await saveImage({
        id: `${job.id}-${i}-${Date.now()}`,
        blobUrl: '', // 나중에 생성
        data: image.data,
        metadata: {
          ...image.metadata,
          prompt: job.params.prompt,
          style: job.params.style,
          createdAt: new Date().toISOString(),
        },
        tags,
      });
    }
  }

  /**
   * 타임아웃 지원 fetch
   */
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

  /**
   * 작업 재시도
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = jobQueue.getJob(jobId);
    if (!job) return false;

    // 실패한 작업만 재시도 가능
    if (job.status !== 'failed') return false;

    // 상태를 pending으로 변경
    jobQueue.updateJob(jobId, {
      status: 'pending',
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    });

    return true;
  }
}

/**
 * 싱글톤 인스턴스
 */
export const jobProcessor = new JobProcessor();
