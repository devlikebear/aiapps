/**
 * 트윗 저장 API
 * POST /api/tweet/save
 */

import { NextRequest, NextResponse } from 'next/server';
import type { StoredTweet } from '@/lib/tweet/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweet, metadata } = body;

    if (!tweet || !metadata) {
      return NextResponse.json(
        { error: 'Tweet and metadata are required' },
        { status: 400 }
      );
    }

    // 클라이언트 측 IndexedDB에 저장되므로,
    // 여기서는 검증만 수행
    const storedTweet: StoredTweet = {
      id: metadata.id,
      tweet,
      metadata,
      createdAt: new Date().toISOString(),
    };

    // 나중에 클라우드 스토리지 통합을 위해 여기에 로직 추가 가능
    // 현재는 클라이언트 IndexedDB 사용

    return NextResponse.json({
      success: true,
      data: storedTweet,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving tweet:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to save tweet: ${message}` },
      { status: 500 }
    );
  }
}
