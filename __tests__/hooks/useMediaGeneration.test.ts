/**
 * useMediaGeneration 훅 테스트
 *
 * 미디어 생성 완료 이벤트 구독 훅의 기능을 검증합니다.
 */

import { renderHook } from '@testing-library/react';
import {
  useAudioGeneration,
  useImageGeneration,
  useTweetGeneration,
  useMediaGenerationAll,
} from '@/lib/hooks/useMediaGeneration';
import { mediaGenerationEmitter } from '@/lib/events/mediaGenerationEvents';
import type {
  AudioGenerationEvent,
  ImageGenerationEvent,
  TweetGenerationEvent,
} from '@/lib/events/mediaGenerationEvents';

describe('useMediaGeneration Hooks', () => {
  // 각 테스트 후 모든 리스너 제거
  afterEach(() => {
    mediaGenerationEmitter.removeAllListeners();
  });

  describe('useAudioGeneration', () => {
    it('should subscribe to audio generation events', () => {
      const callback = jest.fn();

      renderHook(() => useAudioGeneration(callback));

      const event: AudioGenerationEvent = {
        id: 'audio-hook-001',
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

      mediaGenerationEmitter.emitAudioGenerated(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe when component unmounts', () => {
      const callback = jest.fn();

      const { unmount } = renderHook(() => useAudioGeneration(callback));

      const event: AudioGenerationEvent = {
        id: 'audio-hook-002',
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

      mediaGenerationEmitter.emitAudioGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);

      unmount();

      mediaGenerationEmitter.emitAudioGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1); // 여전히 1번만 호출됨
    });

    it('should handle multiple hook instances', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      renderHook(() => useAudioGeneration(callback1));
      renderHook(() => useAudioGeneration(callback2));

      const event: AudioGenerationEvent = {
        id: 'audio-hook-003',
        audio: 'data:audio/wav;base64,UklGRi4...',
        format: 'wav',
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
  });

  describe('useImageGeneration', () => {
    it('should subscribe to image generation events', () => {
      const callback = jest.fn();

      renderHook(() => useImageGeneration(callback));

      const event: ImageGenerationEvent = {
        id: 'img-hook-001',
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

      mediaGenerationEmitter.emitImageGenerated(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe when component unmounts', () => {
      const callback = jest.fn();

      const { unmount } = renderHook(() => useImageGeneration(callback));

      const event: ImageGenerationEvent = {
        id: 'img-hook-002',
        data: 'data:image/png;base64,iVBORw0KG...',
        format: 'png',
        metadata: {
          style: 'watercolor',
          width: 768,
          height: 768,
          aspectRatio: 1,
          fileSize: 180000,
          prompt: 'abstract',
          quality: 'standard',
          createdAt: new Date().toISOString(),
          hasWatermark: false,
        },
      };

      mediaGenerationEmitter.emitImageGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);

      unmount();

      mediaGenerationEmitter.emitImageGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('useTweetGeneration', () => {
    it('should subscribe to tweet generation events', () => {
      const callback = jest.fn();

      renderHook(() => useTweetGeneration(callback));

      const event: TweetGenerationEvent = {
        id: 'tweet-hook-001',
        text: '방금 생성된 트윗입니다! 🚀',
        metadata: {
          tone: 'casual',
          length: 'short',
          characterCount: 19,
          hasHashtags: false,
          hashtagCount: 0,
          hasEmoji: true,
          emojiCount: 1,
          mentionCount: 0,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitTweetGenerated(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe when component unmounts', () => {
      const callback = jest.fn();

      const { unmount } = renderHook(() => useTweetGeneration(callback));

      const event: TweetGenerationEvent = {
        id: 'tweet-hook-002',
        text: '오늘도 화이팅! 💪',
        metadata: {
          tone: 'inspirational',
          length: 'short',
          characterCount: 15,
          hasHashtags: false,
          hashtagCount: 0,
          hasEmoji: true,
          emojiCount: 1,
          mentionCount: 0,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitTweetGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);

      unmount();

      mediaGenerationEmitter.emitTweetGenerated(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMediaGenerationAll', () => {
    it('should subscribe to all media generation events', () => {
      const audioCallback = jest.fn();
      const imageCallback = jest.fn();
      const tweetCallback = jest.fn();

      renderHook(() =>
        useMediaGenerationAll({
          onAudio: audioCallback,
          onImage: imageCallback,
          onTweet: tweetCallback,
        })
      );

      const audioEvent: AudioGenerationEvent = {
        id: 'audio-all-001',
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
        id: 'img-all-001',
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
        id: 'tweet-all-001',
        text: '모든 이벤트를 받습니다! 📢',
        metadata: {
          tone: 'casual',
          length: 'short',
          characterCount: 17,
          hasHashtags: false,
          hashtagCount: 0,
          hasEmoji: true,
          emojiCount: 1,
          mentionCount: 0,
          createdAt: new Date().toISOString(),
        },
      };

      mediaGenerationEmitter.emitAudioGenerated(audioEvent);
      mediaGenerationEmitter.emitImageGenerated(imageEvent);
      mediaGenerationEmitter.emitTweetGenerated(tweetEvent);

      expect(audioCallback).toHaveBeenCalledWith(audioEvent);
      expect(imageCallback).toHaveBeenCalledWith(imageEvent);
      expect(tweetCallback).toHaveBeenCalledWith(tweetEvent);
    });

    it('should support partial callback subscriptions', () => {
      const audioCallback = jest.fn();
      const imageCallback = jest.fn();

      renderHook(() =>
        useMediaGenerationAll({
          onAudio: audioCallback,
          onImage: imageCallback,
          // onTweet is not provided
        })
      );

      const audioEvent: AudioGenerationEvent = {
        id: 'audio-partial-001',
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
        id: 'img-partial-001',
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
        id: 'tweet-partial-001',
        text: '이 이벤트는 받지 않을 것입니다.',
        metadata: {
          tone: 'casual',
          length: 'short',
          characterCount: 23,
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

      expect(audioCallback).toHaveBeenCalledWith(audioEvent);
      expect(imageCallback).toHaveBeenCalledWith(imageEvent);
    });

    it('should unsubscribe all listeners when component unmounts', () => {
      const audioCallback = jest.fn();
      const imageCallback = jest.fn();
      const tweetCallback = jest.fn();

      const { unmount } = renderHook(() =>
        useMediaGenerationAll({
          onAudio: audioCallback,
          onImage: imageCallback,
          onTweet: tweetCallback,
        })
      );

      const audioEvent: AudioGenerationEvent = {
        id: 'audio-unmount-001',
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
        id: 'img-unmount-001',
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
        id: 'tweet-unmount-001',
        text: '언마운트 전 이벤트',
        metadata: {
          tone: 'casual',
          length: 'short',
          characterCount: 12,
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

      expect(audioCallback).toHaveBeenCalledTimes(1);
      expect(imageCallback).toHaveBeenCalledTimes(1);
      expect(tweetCallback).toHaveBeenCalledTimes(1);

      unmount();

      mediaGenerationEmitter.emitAudioGenerated(audioEvent);
      mediaGenerationEmitter.emitImageGenerated(imageEvent);
      mediaGenerationEmitter.emitTweetGenerated(tweetEvent);

      // 언마운트 후에는 여전히 1번씩만 호출됨
      expect(audioCallback).toHaveBeenCalledTimes(1);
      expect(imageCallback).toHaveBeenCalledTimes(1);
      expect(tweetCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Callback Updates', () => {
    it('should update callback when props change', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(
        ({ cb }: { cb: (event: AudioGenerationEvent) => void }) =>
          useAudioGeneration(cb),
        { initialProps: { cb: callback1 } }
      );

      const event: AudioGenerationEvent = {
        id: 'audio-update-001',
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

      mediaGenerationEmitter.emitAudioGenerated(event);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      rerender({ cb: callback2 });

      mediaGenerationEmitter.emitAudioGenerated(event);
      expect(callback1).toHaveBeenCalledTimes(1); // 여전히 1번만 호출됨
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });
});
