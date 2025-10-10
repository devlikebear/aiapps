/**
 * Gemini Lyria RealTime 클라이언트
 * @google/genai SDK 사용
 */

import { GoogleGenAI } from '@google/genai';
import type { SDKConfig, LyriaRequest, LyriaResponse } from '../types';
import { logger } from '../utils/logger';

export interface LyriaClientConfig extends SDKConfig {
  model?: string;
}

const DEFAULT_CONFIG: Partial<LyriaClientConfig> = {
  timeout: 60000,
  maxRetries: 3,
  model: 'models/lyria-realtime-exp',
};

export class LyriaClient {
  private config: Required<LyriaClientConfig>;
  private client: GoogleGenAI;

  constructor(config: LyriaClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<LyriaClientConfig>;

    this.client = new GoogleGenAI({
      apiKey: this.config.apiKey,
      apiVersion: 'v1alpha',
    });
  }

  /**
   * 음악 생성 (스트리밍)
   */
  async generate(request: LyriaRequest): Promise<LyriaResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    logger.info('Lyria generate request', {
      requestId,
      prompt: request.prompt,
      bpm: request.bpm,
      duration: request.duration,
    });

    try {
      const audioChunks: ArrayBuffer[] = [];
      let totalDuration = 0;

      // Lyria RealTime 세션 연결
      const session = await this.client.live.music.connect({
        model: this.config.model,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (message: any) => {
            // 오디오 청크 수신
            if (message.serverContent?.audioChunks) {
              for (const chunk of message.serverContent.audioChunks) {
                const audioBuffer = Buffer.from(chunk.data, 'base64');
                audioChunks.push(audioBuffer.buffer);
              }
            }

            // 메타데이터 수신
            if (message.serverContent?.metadata) {
              totalDuration = message.serverContent.metadata.duration || 0;
            }
          },
          onerror: (error: ErrorEvent) => {
            logger.error('Lyria session error', {
              error: error.message || 'Unknown error',
              requestId,
            });
          },
        },
      });

      // 가중치 프롬프트 설정
      await session.setWeightedPrompts({
        weightedPrompts: [
          {
            text: request.prompt,
            weight: 1.0,
          },
        ],
      });

      // 음악 생성 설정
      await session.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: request.bpm || 120,
          density: request.density ?? 0.7,
          brightness: request.brightness ?? 0.6,
          temperature: 1.0,
        },
      });

      // 음악 생성 시작
      await session.play();

      // 지정된 시간만큼 생성 (duration 초)
      await new Promise((resolve) =>
        setTimeout(resolve, (request.duration || 30) * 1000)
      );

      // 생성 중지
      await session.stop();

      // 세션 종료
      await session.close();

      // 오디오 청크 병합
      const totalLength = audioChunks.reduce(
        (acc, chunk) => acc + chunk.byteLength,
        0
      );
      const mergedAudio = new ArrayBuffer(totalLength);
      const view = new Uint8Array(mergedAudio);
      let offset = 0;

      for (const chunk of audioChunks) {
        view.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      logger.info('Lyria generate success', {
        requestId,
        audioSize: mergedAudio.byteLength,
        duration: totalDuration,
      });

      return {
        requestId,
        audio: {
          data: mergedAudio,
          sampleRate: 48000, // Lyria 기본값
          channels: 2, // 스테레오
          bitDepth: 16,
        },
        metadata: {
          duration: totalDuration || request.duration || 30,
          bpm: request.bpm || 120,
          key: 'C', // 기본값
          scale: request.scale || 'major',
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Lyria generate error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * 연결 종료
   */
  async disconnect(): Promise<void> {
    // 필요 시 정리 작업
    logger.info('Lyria client disconnected');
  }
}
