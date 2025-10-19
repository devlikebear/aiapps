/**
 * 미디어 생성 완료 이벤트 시스템
 *
 * 비동기 작업 큐에서 생성이 완료되면 해당 이벤트를 발생시켜
 * 생성기 페이지에서 실시간으로 결과를 표시할 수 있게 합니다.
 */

type Listener<T> = (data: T) => void;

interface AudioGenerationEvent {
  id: string;
  audio: string;
  format: 'wav' | 'mp3' | 'm4a' | 'ogg';
  metadata: {
    genre: string;
    mood: string;
    bpm: number;
    instruments: string[];
    duration: number;
    createdAt: string;
  };
}

interface ImageGenerationEvent {
  id: string;
  data: string;
  format: 'png';
  metadata: {
    style: string;
    width: number;
    height: number;
    aspectRatio: number;
    fileSize: number;
    prompt: string;
    quality: string;
    createdAt: string;
    hasWatermark: boolean;
  };
}

interface TweetGenerationEvent {
  id: string;
  text: string;
  metadata: {
    tone: string;
    length: string;
    characterCount: number;
    hasHashtags: boolean;
    hashtagCount: number;
    hasEmoji: boolean;
    emojiCount: number;
    mentionCount: number;
    createdAt: string;
  };
}

/**
 * 이벤트 에미터 클래스
 * 생성 완료 시 리스너들에게 알림
 */
class MediaGenerationEventEmitter {
  private audioListeners: Listener<AudioGenerationEvent>[] = [];
  private imageListeners: Listener<ImageGenerationEvent>[] = [];
  private tweetListeners: Listener<TweetGenerationEvent>[] = [];

  /**
   * 오디오 생성 완료 이벤트 구독
   */
  onAudioGenerated(listener: Listener<AudioGenerationEvent>): () => void {
    this.audioListeners.push(listener);

    // 구독 해제 함수 반환
    return () => {
      this.audioListeners = this.audioListeners.filter((l) => l !== listener);
    };
  }

  /**
   * 이미지 생성 완료 이벤트 구독
   */
  onImageGenerated(listener: Listener<ImageGenerationEvent>): () => void {
    this.imageListeners.push(listener);

    // 구독 해제 함수 반환
    return () => {
      this.imageListeners = this.imageListeners.filter((l) => l !== listener);
    };
  }

  /**
   * 트윗 생성 완료 이벤트 구독
   */
  onTweetGenerated(listener: Listener<TweetGenerationEvent>): () => void {
    this.tweetListeners.push(listener);

    // 구독 해제 함수 반환
    return () => {
      this.tweetListeners = this.tweetListeners.filter((l) => l !== listener);
    };
  }

  /**
   * 오디오 생성 완료 이벤트 발생
   * @internal 작업 큐에서만 호출
   */
  emitAudioGenerated(event: AudioGenerationEvent): void {
    this.audioListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in audio generation listener:', error);
      }
    });
  }

  /**
   * 이미지 생성 완료 이벤트 발생
   * @internal 작업 큐에서만 호출
   */
  emitImageGenerated(event: ImageGenerationEvent): void {
    this.imageListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in image generation listener:', error);
      }
    });
  }

  /**
   * 트윗 생성 완료 이벤트 발생
   * @internal 작업 큐에서만 호출
   */
  emitTweetGenerated(event: TweetGenerationEvent): void {
    this.tweetListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in tweet generation listener:', error);
      }
    });
  }

  /**
   * 모든 리스너 제거
   */
  removeAllListeners(): void {
    this.audioListeners = [];
    this.imageListeners = [];
    this.tweetListeners = [];
  }
}

// 싱글톤 인스턴스
export const mediaGenerationEmitter = new MediaGenerationEventEmitter();

// 타입 내보내기
export type {
  AudioGenerationEvent,
  ImageGenerationEvent,
  TweetGenerationEvent,
  Listener,
};
