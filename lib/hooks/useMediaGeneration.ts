/**
 * 미디어 생성 완료 이벤트 구독 훅
 *
 * 생성기 페이지에서 비동기 생성 완료를 감지하고
 * 결과를 실시간으로 표시할 수 있게 합니다.
 */

'use client';

import { useEffect, useCallback } from 'react';
import {
  mediaGenerationEmitter,
  type AudioGenerationEvent,
  type ImageGenerationEvent,
  type TweetGenerationEvent,
} from '@/lib/events/mediaGenerationEvents';

/**
 * 오디오 생성 완료 이벤트 훅
 *
 * @param onGenerated - 생성 완료 콜백
 * @returns 구독 해제 함수
 *
 * @example
 * ```tsx
 * function AudioGeneratorPage() {
 *   useAudioGeneration((event) => {
 *     console.log('Audio generated:', event);
 *     // 페이지 상태 업데이트
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAudioGeneration(
  onGenerated: (event: AudioGenerationEvent) => void
): void {
  const memoizedCallback = useCallback(onGenerated, [onGenerated]);

  useEffect(() => {
    const unsubscribe = mediaGenerationEmitter.onAudioGenerated(
      memoizedCallback
    );

    return () => {
      unsubscribe();
    };
  }, [memoizedCallback]);
}

/**
 * 이미지 생성 완료 이벤트 훅
 *
 * @param onGenerated - 생성 완료 콜백
 * @returns 구독 해제 함수
 *
 * @example
 * ```tsx
 * function ArtGeneratorPage() {
 *   useImageGeneration((event) => {
 *     console.log('Image generated:', event);
 *     // 페이지 상태 업데이트
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useImageGeneration(
  onGenerated: (event: ImageGenerationEvent) => void
): void {
  const memoizedCallback = useCallback(onGenerated, [onGenerated]);

  useEffect(() => {
    const unsubscribe = mediaGenerationEmitter.onImageGenerated(
      memoizedCallback
    );

    return () => {
      unsubscribe();
    };
  }, [memoizedCallback]);
}

/**
 * 트윗 생성 완료 이벤트 훅
 *
 * @param onGenerated - 생성 완료 콜백
 * @returns 구독 해제 함수
 *
 * @example
 * ```tsx
 * function TweetGeneratorPage() {
 *   useTweetGeneration((event) => {
 *     console.log('Tweet generated:', event);
 *     // 페이지 상태 업데이트
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useTweetGeneration(
  onGenerated: (event: TweetGenerationEvent) => void
): void {
  const memoizedCallback = useCallback(onGenerated, [onGenerated]);

  useEffect(() => {
    const unsubscribe = mediaGenerationEmitter.onTweetGenerated(
      memoizedCallback
    );

    return () => {
      unsubscribe();
    };
  }, [memoizedCallback]);
}

/**
 * 모든 미디어 생성 이벤트를 통합하여 처리하는 훅
 *
 * @param callbacks - 각 생성 타입별 콜백
 *
 * @example
 * ```tsx
 * function MediaGeneratorPage() {
 *   useMediaGenerationAll({
 *     onAudio: (event) => console.log('Audio:', event),
 *     onImage: (event) => console.log('Image:', event),
 *     onTweet: (event) => console.log('Tweet:', event),
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useMediaGenerationAll(callbacks: {
  onAudio?: (event: AudioGenerationEvent) => void;
  onImage?: (event: ImageGenerationEvent) => void;
  onTweet?: (event: TweetGenerationEvent) => void;
}): void {
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    if (callbacks.onAudio) {
      unsubscribers.push(
        mediaGenerationEmitter.onAudioGenerated(callbacks.onAudio)
      );
    }

    if (callbacks.onImage) {
      unsubscribers.push(
        mediaGenerationEmitter.onImageGenerated(callbacks.onImage)
      );
    }

    if (callbacks.onTweet) {
      unsubscribers.push(
        mediaGenerationEmitter.onTweetGenerated(callbacks.onTweet)
      );
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [callbacks]);
}
