/**
 * 미디어 생성 이벤트 시스템 테스트
 *
 * MediaGenerationEventEmitter의 구독, 구독 해제, 이벤트 발생 기능을 검증합니다.
 */

import {
  mediaGenerationEmitter,
  type AudioGenerationEvent,
  type ImageGenerationEvent,
  type TweetGenerationEvent,
} from '@/lib/events/mediaGenerationEvents';

describe('MediaGenerationEventEmitter', () => {
  // 각 테스트 후 모든 리스너 제거
  afterEach(() => {
    mediaGenerationEmitter.removeAllListeners();
  });

  describe('Audio Generation Events', () => {
    it('should subscribe to audio generation events', () => {
      const callback = jest.fn();

      mediaGenerationEmitter.onAudioGenerated(callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should emit audio generation event to subscribed listeners', () => {
      const callback = jest.fn();
      mediaGenerationEmitter.onAudioGenerated(callback);

      const event: AudioGenerationEvent = {
        id: 'audio-001',
        audio: 'data:audio/wav;base64,UklGRi4...',
        format: 'wav',
        metadata: {
          genre: 'ambient',
          mood: 'relaxing',
          bpm: 120,
          instruments: ['piano', 'strings'],
          duration: 180,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitAudioGenerated(event);

      expect(callback).toHaveBeenCalledWith(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple audio listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      mediaGenerationEmitter.onAudioGenerated(callback1);
      mediaGenerationEmitter.onAudioGenerated(callback2);

      const event: AudioGenerationEvent = {
        id: 'audio-002',
        audio: 'data:audio/mp3;base64,ID3...',
        format: 'mp3',
        metadata: {
          genre: 'jazz',
          mood: 'upbeat',
          bpm: 140,
          instruments: ['saxophone'],
          duration: 240,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitAudioGenerated(event);

      expect(callback1).toHaveBeenCalledWith(event);
      expect(callback2).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe audio listener correctly', () => {
      const callback = jest.fn();
      const unsubscribe = mediaGenerationEmitter.onAudioGenerated(callback);

      const event: AudioGenerationEvent = {
        id: 'audio-003',
        audio: 'data:audio/ogg;base64,OggS...',
        format: 'ogg',
        metadata: {
          genre: 'electronic',
          mood: 'energetic',
          bpm: 160,
          instruments: ['synth', 'drums'],
          duration: 200,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitAudioGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);

      // 구독 해제
      unsubscribe();

      // 다시 이벤트 발생
      mediaGenerationEmitter.emitAudioGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1); // 여전히 1번만 호출됨
    });
  });

  describe('Image Generation Events', () => {
    it('should emit image generation event', () => {
      const callback = jest.fn();
      mediaGenerationEmitter.onImageGenerated(callback);

      const event: ImageGenerationEvent = {
        id: 'img-001',
        data: 'data:image/png;base64,iVBORw0KG...',
        format: 'png',
        metadata: {
          style: 'pixel-art',
          width: 512,
          height: 512,
          aspectRatio: 1,
          fileSize: 125000,
          prompt: 'a beautiful landscape',
          quality: 'high',
          createdAt: new Date().toISOString(),
          hasWatermark: false,
        },
      };

      mediaGenerationEmitter.emitImageGenerated(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should support multiple image listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      mediaGenerationEmitter.onImageGenerated(callback1);
      mediaGenerationEmitter.onImageGenerated(callback2);

      const event: ImageGenerationEvent = {
        id: 'img-002',
        data: 'data:image/png;base64,iVBORw0KG...',
        format: 'png',
        metadata: {
          style: '3d-render',
          width: 1024,
          height: 1024,
          aspectRatio: 1,
          fileSize: 250000,
          prompt: 'futuristic city',
          quality: 'high',
          createdAt: new Date().toISOString(),
          hasWatermark: false,
        },
      };

      mediaGenerationEmitter.emitImageGenerated(event);

      expect(callback1).toHaveBeenCalledWith(event);
      expect(callback2).toHaveBeenCalledWith(event);
    });

    it('should handle image listener unsubscription', () => {
      const callback = jest.fn();
      const unsubscribe = mediaGenerationEmitter.onImageGenerated(callback);

      const event: ImageGenerationEvent = {
        id: 'img-003',
        data: 'data:image/png;base64,iVBORw0KG...',
        format: 'png',
        metadata: {
          style: 'watercolor',
          width: 768,
          height: 768,
          aspectRatio: 1,
          fileSize: 180000,
          prompt: 'abstract art',
          quality: 'standard',
          createdAt: new Date().toISOString(),
          hasWatermark: false,
        },
      };

      mediaGenerationEmitter.emitImageGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      mediaGenerationEmitter.emitImageGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tweet Generation Events', () => {
    it('should emit tweet generation event', () => {
      const callback = jest.fn();
      mediaGenerationEmitter.onTweetGenerated(callback);

      const event: TweetGenerationEvent = {
        id: 'tweet-001',
        text: '이것은 생성된 트윗입니다! 🚀 #AI #생성',
        metadata: {
          tone: 'casual',
          length: 'medium',
          characterCount: 25,
          hasHashtags: true,
          hashtagCount: 2,
          hasEmoji: true,
          emojiCount: 1,
          mentionCount: 0,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitTweetGenerated(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should support multiple tweet listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      mediaGenerationEmitter.onTweetGenerated(callback1);
      mediaGenerationEmitter.onTweetGenerated(callback2);

      const event: TweetGenerationEvent = {
        id: 'tweet-002',
        text: '새로운 제품 출시! @brand와 함께합니다 💼 #productlaunch',
        metadata: {
          tone: 'professional',
          length: 'short',
          characterCount: 36,
          hasHashtags: true,
          hashtagCount: 1,
          hasEmoji: true,
          emojiCount: 1,
          mentionCount: 1,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitTweetGenerated(event);

      expect(callback1).toHaveBeenCalledWith(event);
      expect(callback2).toHaveBeenCalledWith(event);
    });

    it('should handle tweet listener unsubscription', () => {
      const callback = jest.fn();
      const unsubscribe = mediaGenerationEmitter.onTweetGenerated(callback);

      const event: TweetGenerationEvent = {
        id: 'tweet-003',
        text: '오늘도 화이팅! 💪 #motivation',
        metadata: {
          tone: 'inspirational',
          length: 'short',
          characterCount: 16,
          hasHashtags: true,
          hashtagCount: 1,
          hasEmoji: true,
          emojiCount: 1,
          mentionCount: 0,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitTweetGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      mediaGenerationEmitter.emitTweetGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cross-type Event Handling', () => {
    it('should handle different event types independently', () => {
      const audioCallback = jest.fn();
      const imageCallback = jest.fn();
      const tweetCallback = jest.fn();

      mediaGenerationEmitter.onAudioGenerated(audioCallback);
      mediaGenerationEmitter.onImageGenerated(imageCallback);
      mediaGenerationEmitter.onTweetGenerated(tweetCallback);

      const audioEvent: AudioGenerationEvent = {
        id: 'audio-cross-001',
        audio: 'data:audio/wav;base64,UklGRi4...',
        format: 'wav',
        metadata: {
          genre: 'ambient',
          mood: 'relaxing',
          bpm: 120,
          instruments: ['piano'],
          duration: 180,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitAudioGenerated(audioEvent);

      expect(audioCallback).toHaveBeenCalledWith(audioEvent);
      expect(imageCallback).not.toHaveBeenCalled();
      expect(tweetCallback).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should continue processing other listeners when one throws error', () => {
      const callback1 = jest.fn(() => {
        throw new Error('Listener 1 error');
      });
      const callback2 = jest.fn();

      mediaGenerationEmitter.onAudioGenerated(callback1);
      mediaGenerationEmitter.onAudioGenerated(callback2);

      const event: AudioGenerationEvent = {
        id: 'audio-error-001',
        audio: 'data:audio/wav;base64,UklGRi4...',
        format: 'wav',
        metadata: {
          genre: 'ambient',
          mood: 'relaxing',
          bpm: 120,
          instruments: ['piano'],
          duration: 180,
          createdAt: new Date().toISOString(),
        },
      };

      // 첫 번째 콜백이 에러를 발생해도 두 번째 콜백은 실행되어야 함
      expect(() => {
        mediaGenerationEmitter.emitAudioGenerated(event);
      }).not.toThrow();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(event);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners', () => {
      const audioCallback = jest.fn();
      const imageCallback = jest.fn();
      const tweetCallback = jest.fn();

      mediaGenerationEmitter.onAudioGenerated(audioCallback);
      mediaGenerationEmitter.onImageGenerated(imageCallback);
      mediaGenerationEmitter.onTweetGenerated(tweetCallback);

      mediaGenerationEmitter.removeAllListeners();

      const audioEvent: AudioGenerationEvent = {
        id: 'audio-clear-001',
        audio: 'data:audio/wav;base64,UklGRi4...',
        format: 'wav',
        metadata: {
          genre: 'ambient',
          mood: 'relaxing',
          bpm: 120,
          instruments: ['piano'],
          duration: 180,
          createdAt: new Date().toISOString(),
        },
      };

      const imageEvent: ImageGenerationEvent = {
        id: 'img-clear-001',
        data: 'data:image/png;base64,iVBORw0KG...',
        format: 'png',
        metadata: {
          style: 'pixel-art',
          width: 512,
          height: 512,
          aspectRatio: 1,
          fileSize: 125000,
          prompt: 'landscape',
          quality: 'high',
          createdAt: new Date().toISOString(),
          hasWatermark: false,
        },
      };

      const tweetEvent: TweetGenerationEvent = {
        id: 'tweet-clear-001',
        text: 'Test tweet',
        metadata: {
          tone: 'casual',
          length: 'short',
          characterCount: 10,
          hasHashtags: false,
          hashtagCount: 0,
          hasEmoji: false,
          emojiCount: 0,
          mentionCount: 0,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitAudioGenerated(audioEvent);
      mediaGenerationEmitter.emitImageGenerated(imageEvent);
      mediaGenerationEmitter.emitTweetGenerated(tweetEvent);

      expect(audioCallback).not.toHaveBeenCalled();
      expect(imageCallback).not.toHaveBeenCalled();
      expect(tweetCallback).not.toHaveBeenCalled();
    });
  });
});
