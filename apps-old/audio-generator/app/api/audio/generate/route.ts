/**
 * 오디오 생성 API 엔드포인트
 */

import { NextRequest } from 'next/server';
import { LyriaClient } from '@aiapps/ai-sdk';
import { audioPromptSchema } from '@/lib/schemas/audio';
import { estimateTokenCost } from '@/lib/utils/token-estimator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/audio/generate
 * 음악 생성 요청
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 스키마 검증
    const validated = audioPromptSchema.parse(body);

    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // 토큰 비용 추정
    const estimatedCost = estimateTokenCost(validated);

    // Lyria 클라이언트 생성
    const client = new LyriaClient({
      apiKey,
      timeout: 120000, // 2분
      maxRetries: 3,
    });

    // 프롬프트 구성
    const fullPrompt = buildPrompt(validated);

    // Server-Sent Events를 위한 ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 스트리밍 이벤트 리스너
          client.on('stream', (response) => {
            const data = JSON.stringify({
              type: response.type,
              progress: response.progress,
              audio: response.audio
                ? {
                    size: response.audio.data.byteLength,
                    sampleRate: response.audio.sampleRate,
                  }
                : undefined,
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          });

          // 완료 이벤트 리스너
          client.once('complete', (response) => {
            const data = JSON.stringify({
              type: 'complete',
              audio: {
                data: Buffer.from(response.audio.data).toString('base64'),
                sampleRate: response.audio.sampleRate,
                channels: response.audio.channels,
                bitDepth: response.audio.bitDepth,
              },
              metadata: response.metadata,
              requestId: response.requestId,
              generatedAt: response.generatedAt.toISOString(),
              estimatedCost,
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            controller.close();
          });

          // 에러 이벤트 리스너
          client.once('error', (error) => {
            const errorCode =
              'code' in error ? String(error.code) : 'UNKNOWN_ERROR';
            const data = JSON.stringify({
              type: 'error',
              error: {
                message: error.message,
                code: errorCode,
              },
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            controller.close();
          });

          // 생성 시작
          await client.generate({
            prompt: fullPrompt,
            bpm: validated.bpm,
            density: validated.density,
            brightness: validated.brightness,
            scale: validated.scale,
            duration: validated.duration,
          });
        } catch (error) {
          const data = JSON.stringify({
            type: 'error',
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'GENERATION_ERROR',
            },
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Audio generation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 전체 프롬프트 구성
 */
function buildPrompt(prompt: typeof audioPromptSchema._type): string {
  const parts: string[] = [prompt.prompt];

  if (prompt.genre) {
    parts.push(`Genre: ${prompt.genre}`);
  }

  if (prompt.mood) {
    parts.push(`Mood: ${prompt.mood}`);
  }

  if (prompt.instruments.length > 0) {
    parts.push(`Instruments: ${prompt.instruments.join(', ')}`);
  }

  return parts.join('. ');
}
