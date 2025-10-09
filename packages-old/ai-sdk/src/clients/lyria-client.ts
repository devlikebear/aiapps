/**
 * Gemini Lyria RealTime 클라이언트
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import {
  SDKConfig,
  LyriaRequest,
  LyriaResponse,
  LyriaStreamResponse,
  ConnectionState,
  NetworkError,
  ValidationError,
} from '../types';
import { withRetry } from '../utils/retry';
import { RateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

export interface LyriaClientConfig extends SDKConfig {
  wsUrl?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

const DEFAULT_CONFIG: Partial<LyriaClientConfig> = {
  timeout: 60000,
  maxRetries: 3,
  reconnectAttempts: 5,
  reconnectDelay: 2000,
  wsUrl:
    'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.StreamGenerateContent',
};

export class LyriaClient extends EventEmitter {
  private config: Required<LyriaClientConfig>;
  private ws: WebSocket | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private rateLimiter: RateLimiter;
  private requestId: string = '';
  private audioChunks: ArrayBuffer[] = [];

  constructor(config: LyriaClientConfig) {
    super();
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<LyriaClientConfig>;

    // 레이트 리미터: 분당 60회 요청
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 60,
      interval: 60000,
      maxTokens: 60,
    });
  }

  /**
   * 연결 상태 변경
   */
  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.emit('stateChange', newState);
      logger.info(`Lyria connection state changed to ${newState}`);
    }
  }

  /**
   * WebSocket 연결
   */
  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.setState(ConnectionState.CONNECTING);

      const wsUrl = `${this.config.wsUrl}?key=${this.config.apiKey}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.setState(ConnectionState.CONNECTED);
        logger.info('Lyria WebSocket connected');
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error) => {
        logger.error('Lyria WebSocket error', { error: error.message });
        this.emit('error', new NetworkError(error.message));
        reject(error);
      });

      this.ws.on('close', () => {
        this.setState(ConnectionState.DISCONNECTED);
        logger.info('Lyria WebSocket closed');
      });

      // 타임아웃 설정
      setTimeout(() => {
        if (this.state !== ConnectionState.CONNECTED) {
          reject(new NetworkError('Connection timeout'));
        }
      }, this.config.timeout);
    });
  }

  /**
   * 메시지 처리
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'audio') {
        // PCM 오디오 데이터 수신
        const audioData = Buffer.from(message.data, 'base64');
        this.audioChunks.push(audioData.buffer);

        const streamResponse: LyriaStreamResponse = {
          type: 'audio',
          audio: {
            data: audioData.buffer,
            sampleRate: 48000,
            channels: 2,
            bitDepth: 16,
          },
          progress: message.progress,
        };

        this.emit('stream', streamResponse);
      } else if (message.type === 'metadata') {
        const streamResponse: LyriaStreamResponse = {
          type: 'metadata',
          metadata: message.metadata,
        };
        this.emit('stream', streamResponse);
      } else if (message.type === 'complete') {
        this.handleComplete();
      } else if (message.type === 'error') {
        this.emit('error', new Error(message.error.message));
      }
    } catch (error) {
      logger.error('Failed to parse WebSocket message', { error });
      this.emit('error', error as Error);
    }
  }

  /**
   * 생성 완료 처리
   */
  private handleComplete(): void {
    // 모든 오디오 청크 병합
    const totalLength = this.audioChunks.reduce(
      (sum, chunk) => sum + chunk.byteLength,
      0
    );
    const mergedAudio = new ArrayBuffer(totalLength);
    const view = new Uint8Array(mergedAudio);

    let offset = 0;
    for (const chunk of this.audioChunks) {
      view.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    const response: LyriaResponse = {
      audio: {
        data: mergedAudio,
        sampleRate: 48000,
        channels: 2,
        bitDepth: 16,
      },
      metadata: {
        bpm: 120, // 실제 메타데이터에서 가져와야 함
        key: 'C',
        scale: 'major',
        duration: mergedAudio.byteLength / (48000 * 2 * 2), // 초 단위
      },
      requestId: this.requestId,
      generatedAt: new Date(),
    };

    this.emit('complete', response);
    this.cleanup();
  }

  /**
   * 요청 검증
   */
  private validateRequest(request: LyriaRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ValidationError('Prompt is required');
    }

    if (request.bpm !== undefined && (request.bpm < 60 || request.bpm > 200)) {
      throw new ValidationError('BPM must be between 60 and 200');
    }

    if (
      request.density !== undefined &&
      (request.density < 0 || request.density > 1)
    ) {
      throw new ValidationError('Density must be between 0 and 1');
    }

    if (
      request.brightness !== undefined &&
      (request.brightness < 0 || request.brightness > 1)
    ) {
      throw new ValidationError('Brightness must be between 0 and 1');
    }
  }

  /**
   * 음악 생성
   */
  async generate(request: LyriaRequest): Promise<LyriaResponse> {
    // 검증
    this.validateRequest(request);

    // 레이트 리밋 체크
    await this.rateLimiter.acquire();

    // 요청 ID 생성
    this.requestId = `lyria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.audioChunks = [];

    logger.info('Starting Lyria music generation', {
      requestId: this.requestId,
    });

    return new Promise((resolve, reject) => {
      const initializeConnection = async () => {
        try {
          // WebSocket 연결
          await withRetry(() => this.connect(), {
            maxRetries: this.config.reconnectAttempts,
            initialDelay: this.config.reconnectDelay,
          });

          // complete 이벤트 리스너
          this.once('complete', (response: LyriaResponse) => {
            resolve(response);
          });

          // error 이벤트 리스너
          this.once('error', (error: Error) => {
            this.cleanup();
            reject(error);
          });

          // 요청 전송
          this.ws!.send(
            JSON.stringify({
              prompt: request.prompt,
              weightedPrompts: request.weightedPrompts,
              config: {
                bpm: request.bpm || 120,
                density: request.density || 0.5,
                brightness: request.brightness || 0.5,
                scale: request.scale || 'major',
                guidanceLevel: request.guidanceLevel || 0.5,
                mode: request.mode || 'quality',
              },
              duration: request.duration || 30,
            })
          );
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      initializeConnection();
    });
  }

  /**
   * 정리
   */
  private cleanup(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.audioChunks = [];
  }

  /**
   * 연결 종료
   */
  disconnect(): void {
    this.cleanup();
    this.setState(ConnectionState.DISCONNECTED);
  }

  /**
   * 현재 상태 반환
   */
  getState(): ConnectionState {
    return this.state;
  }
}
