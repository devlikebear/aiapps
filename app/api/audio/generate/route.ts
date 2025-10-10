/**
 * AI Audio Generation API
 * Gemini Lyria를 사용한 게임 오디오 생성
 */

import { NextRequest, NextResponse } from 'next/server';

// Node.js 런타임 사용 (WebSocket 지원)
export const runtime = 'nodejs';
import { LyriaClient } from '@/lib/ai';
import type { AudioMetadata, GameGenre } from '@/lib/audio/types';
import { GAME_PRESETS } from '@/lib/audio/types';
import { pcmToWav } from '@/lib/audio/converter';
import { rateLimiters, checkRateLimit } from '@/lib/middleware/rate-limit';
import {
  audioGenerateRequestSchema,
  validateRequest,
} from '@/lib/validation/schemas';
import { validateGeminiApiKeyFormat } from '@/lib/api-key/validation';
import { handleAPIError } from '@/lib/errors/handler';
import { ValidationError, AuthenticationError } from '@/lib/errors/types';
import { APITimingLogger } from '@/lib/monitoring/api-timing';

export async function POST(request: NextRequest) {
  const timingLogger = new APITimingLogger();

  // Rate Limiting 검사
  const endRateLimit = timingLogger.start('rateLimit', 'Rate limit check');
  const rateLimitResponse = await checkRateLimit(
    request,
    rateLimiters.generation
  );
  endRateLimit();

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const endValidation = timingLogger.start('validation', 'Input validation');
    const body = await request.json();

    // Zod 스키마 기반 입력 검증
    const validation = validateRequest(audioGenerateRequestSchema, body);
    if (!validation.success) {
      throw new ValidationError('Invalid request parameters', validation.error);
    }

    // API 키 검증
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      throw new AuthenticationError('API key not provided', {
        path: request.nextUrl.pathname,
      });
    }

    // API 키 형식 검증
    const keyValidation = validateGeminiApiKeyFormat(apiKey);
    if (!keyValidation.valid) {
      throw new AuthenticationError(
        keyValidation.error || 'Invalid API key format',
        {
          path: request.nextUrl.pathname,
          details: keyValidation.details,
        }
      );
    }
    endValidation();

    // 검증된 데이터 사용
    const validatedBody = validation.data;

    // 게임 프리셋 가져오기 (타입 안전성)
    const genre = validatedBody.genre as GameGenre;
    const preset = GAME_PRESETS[genre];
    if (!preset) {
      throw new ValidationError('Invalid genre', `Genre "${genre}" not found`);
    }

    // Lyria 요청 파라미터 구성
    const bpm = validatedBody.bpm || preset.bpm.default;
    const density = body.density ?? preset.density;
    const brightness = body.brightness ?? preset.brightness;
    const scale = body.scale || preset.scale;
    const duration =
      validatedBody.duration || (validatedBody.type === 'bgm' ? 60 : 5);

    // 프롬프트 템플릿 적용
    const enhancedPrompt = preset.promptTemplate.replace(
      '{mood}',
      validatedBody.prompt
    );

    // Lyria 클라이언트 생성
    const client = new LyriaClient({ apiKey });

    try {
      // 오디오 생성 (스트리밍 대신 전체 생성)
      const endGeneration = timingLogger.start(
        'generation',
        'AI audio generation'
      );
      const result = await client.generate({
        prompt: enhancedPrompt,
        bpm,
        density,
        brightness,
        scale,
        mode: body.mode || 'quality',
        duration,
      });
      endGeneration();

      // PCM을 WAV로 변환
      const endConversion = timingLogger.start(
        'conversion',
        'PCM to WAV conversion'
      );
      const wavData = pcmToWav(
        result.audio.data,
        result.audio.sampleRate,
        result.audio.channels,
        result.audio.bitDepth
      );
      endConversion();

      // 메타데이터 생성
      const metadata: AudioMetadata = {
        id: result.requestId,
        type: validatedBody.type,
        genre,
        format: 'wav',
        duration: result.metadata.duration,
        fileSize: wavData.byteLength,
        sampleRate: result.audio.sampleRate,
        bitDepth: result.audio.bitDepth,
        channels: result.audio.channels,
        bpm: result.metadata.bpm,
        key: result.metadata.key,
        scale: result.metadata.scale,
        prompt: validatedBody.prompt,
        createdAt: result.generatedAt,
        isCompressed: false,
      };

      // ArrayBuffer를 Base64로 인코딩 (전송용)
      const endEncoding = timingLogger.start('encoding', 'Base64 encoding');
      const base64Audio = Buffer.from(wavData).toString('base64');
      endEncoding();

      // Server-Timing 헤더 추가
      timingLogger.log(request.nextUrl.pathname, 200);

      return NextResponse.json(
        {
          success: true,
          audioBase64: base64Audio,
          metadata,
        },
        {
          headers: {
            'Server-Timing': timingLogger.getServerTimingHeader(),
          },
        }
      );
    } finally {
      // 연결 정리
      client.disconnect();
    }
  } catch (error) {
    timingLogger.log(request.nextUrl.pathname, 500);
    return handleAPIError(error);
  }
}
