/**
 * 트윗 생성 API
 * POST /api/tweet/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { TweetGeneratorClient } from '@/lib/tweet/client';
import type { TweetGenerateRequest } from '@/lib/tweet/types';

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // 요청 바디 파싱
    const body = await request.json();
    const tweetRequest: TweetGenerateRequest = {
      prompt: body.prompt,
      tone: body.tone || 'casual',
      length: body.length || 'medium',
      hashtags: body.hashtags ?? true,
      emoji: body.emoji ?? true,
      mentions: body.mentions,
      mode: body.mode || 'standard',
    };

    // 입력 검증
    if (!tweetRequest.prompt || tweetRequest.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (tweetRequest.prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // 트윗 생성
    const client = new TweetGeneratorClient(apiKey);
    const result = await client.generate(tweetRequest);

    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating tweet:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate tweet: ${message}` },
      { status: 500 }
    );
  }
}
