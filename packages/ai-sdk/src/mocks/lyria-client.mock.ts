/**
 * Lyria Client 모킹 유틸리티
 */

import { EventEmitter } from 'events';
import {
  LyriaRequest,
  LyriaResponse,
  LyriaStreamResponse,
  ConnectionState,
} from '../types';

export class MockLyriaClient extends EventEmitter {
  private state: ConnectionState = ConnectionState.DISCONNECTED;

  async generate(request: LyriaRequest): Promise<LyriaResponse> {
    this.state = ConnectionState.CONNECTING;
    this.emit('stateChange', this.state);

    // 연결됨 상태로 변경
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.state = ConnectionState.CONNECTED;
    this.emit('stateChange', this.state);

    // 스트리밍 이벤트 발생
    for (let i = 0; i < 3; i++) {
      const streamResponse: LyriaStreamResponse = {
        type: 'audio',
        audio: {
          data: new ArrayBuffer(1024),
          sampleRate: 48000,
          channels: 2,
          bitDepth: 16,
        },
        progress: (i + 1) * 33,
      };

      this.emit('stream', streamResponse);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // 완료 응답 생성
    const response: LyriaResponse = {
      audio: {
        data: new ArrayBuffer(3072),
        sampleRate: 48000,
        channels: 2,
        bitDepth: 16,
      },
      metadata: {
        bpm: request.bpm || 120,
        key: 'C',
        scale: request.scale || 'major',
        duration: 30,
      },
      requestId: `mock_lyria_${Date.now()}`,
      generatedAt: new Date(),
    };

    this.emit('complete', response);
    this.state = ConnectionState.DISCONNECTED;

    return response;
  }

  disconnect(): void {
    this.state = ConnectionState.DISCONNECTED;
    this.emit('stateChange', this.state);
  }

  getState(): ConnectionState {
    return this.state;
  }
}

export function mockLyriaClient(): MockLyriaClient {
  return new MockLyriaClient();
}
