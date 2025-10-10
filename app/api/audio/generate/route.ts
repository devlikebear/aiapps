/**
 * AI Audio Generation API
 * Gemini Lyria를 사용한 게임 오디오 생성
 */

import { NextRequest, NextResponse } from 'next/server';

// Node.js 런타임 사용 (WebSocket 지원)
export const runtime = 'nodejs';
import { LyriaClient } from '@/lib/ai';
import type { AudioGenerateRequest, AudioMetadata } from '@/lib/audio/types';
import { GAME_PRESETS } from '@/lib/audio/types';
import { pcmToWav } from '@/lib/audio/converter';

export async function POST(request: NextRequest) {
  try {
    const body: AudioGenerateRequest = await request.json();

    // 입력 검증
    if (!body.prompt || !body.genre || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, genre, type' },
        { status: 400 }
      );
    }

    // API Key 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // 게임 프리셋 가져오기
    const preset = GAME_PRESETS[body.genre];
    if (!preset) {
      return NextResponse.json({ error: 'Invalid genre' }, { status: 400 });
    }

    // Lyria 요청 파라미터 구성
    const bpm = body.bpm || preset.bpm.default;
    const density = body.density ?? preset.density;
    const brightness = body.brightness ?? preset.brightness;
    const scale = body.scale || preset.scale;
    const duration = body.duration || (body.type === 'bgm' ? 60 : 5);

    // 프롬프트 템플릿 적용
    const enhancedPrompt = preset.promptTemplate.replace('{mood}', body.prompt);

    // Lyria 클라이언트 생성
    const client = new LyriaClient({ apiKey });

    try {
      // 오디오 생성 (스트리밍 대신 전체 생성)
      const result = await client.generate({
        prompt: enhancedPrompt,
        bpm,
        density,
        brightness,
        scale,
        mode: body.mode || 'quality',
        duration,
      });

      // PCM을 WAV로 변환
      const wavData = pcmToWav(
        result.audio.data,
        result.audio.sampleRate,
        result.audio.channels,
        result.audio.bitDepth
      );

      // 메타데이터 생성
      const metadata: AudioMetadata = {
        id: result.requestId,
        type: body.type,
        genre: body.genre,
        format: 'wav',
        duration: result.metadata.duration,
        fileSize: wavData.byteLength,
        sampleRate: result.audio.sampleRate,
        bitDepth: result.audio.bitDepth,
        channels: result.audio.channels,
        bpm: result.metadata.bpm,
        key: result.metadata.key,
        scale: result.metadata.scale,
        prompt: body.prompt,
        createdAt: result.generatedAt,
        isCompressed: false,
      };

      // ArrayBuffer를 Base64로 인코딩 (전송용)
      const base64Audio = Buffer.from(wavData).toString('base64');

      return NextResponse.json({
        success: true,
        audioBase64: base64Audio,
        metadata,
      });
    } finally {
      // 연결 정리
      client.disconnect();
    }
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Audio generation failed',
      },
      { status: 500 }
    );
  }
}
