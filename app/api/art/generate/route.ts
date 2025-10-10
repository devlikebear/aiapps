/**
 * Art Generator API Route Handler
 * POST /api/art/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  ArtGenerateRequest,
  ArtGenerateResponse,
  ImageMetadata,
} from '@/lib/art/types';
import {
  parseResolution,
  generateId,
  estimateGenerationCost,
  calculateAspectRatio,
} from '@/lib/art/utils';

// Gemini 2.5 Flash Image API 설정
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const GEMINI_IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

/**
 * POST /api/art/generate
 * 이미지 생성 요청 처리
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body: ArtGenerateRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.style || !body.prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters: style and prompt' },
        { status: 400 }
      );
    }

    // API 키를 헤더에서 가져오기
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key not provided. Please set your Gemini API key.',
        },
        { status: 401 }
      );
    }

    // 기본값 설정
    const resolution = body.resolution || '512x512';
    const aspectRatio = body.aspectRatio || '1:1';
    const batchSize = body.batchSize || 1;
    const quality = body.quality || 'standard';
    const seed = body.seed;

    // 배치 크기 검증
    if (batchSize < 1 || batchSize > 4) {
      return NextResponse.json(
        { error: 'Batch size must be between 1 and 4' },
        { status: 400 }
      );
    }

    // 비용 추정
    const estimatedCost = estimateGenerationCost(
      resolution,
      batchSize,
      quality
    );

    // Gemini API 호출
    const apiUrl = `${GEMINI_IMAGE_API_URL}?key=${apiKey}`;

    // Gemini API 요청 형식에 맞게 변환
    const promptText = `${body.prompt} (style: ${body.style}, quality: ${quality})`;

    const geminiRequest = {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        responseModalities: ['Image'],
        ...(aspectRatio !== '1:1' && {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        }),
      },
    };

    // API 호출
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);

      return NextResponse.json(
        {
          error: 'Failed to generate image',
          details: errorData.error?.message || 'Unknown error',
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();

    // Gemini API 응답에서 이미지 추출
    // 응답 형식: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
    const candidates = geminiData.candidates || [];
    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'No images generated' },
        { status: 500 }
      );
    }

    // 응답 데이터 변환
    const images = await Promise.all(
      candidates.slice(0, batchSize).map(
        async (
          candidate: {
            content?: {
              parts?: Array<{
                inlineData?: { mimeType?: string; data: string };
              }>;
            };
          },
          index: number
        ) => {
          const parts = candidate.content?.parts || [];
          const imagePart = parts.find((part) => part.inlineData);

          if (!imagePart || !imagePart.inlineData) {
            throw new Error('No image data in response');
          }

          const imageBase64 = imagePart.inlineData.data;
          const mimeType = imagePart.inlineData.mimeType || 'image/png';

          // 해상도 정보 파싱 (요청 파라미터에서 가져옴)
          const { width, height } = parseResolution(resolution);
          const aspectRatioValue = calculateAspectRatio(width, height);

          // Base64 이미지 크기 추정 (base64는 원본의 약 4/3 크기)
          const estimatedFileSize = Math.ceil((imageBase64.length * 3) / 4);

          const imageMetadata: ImageMetadata = {
            id: generateId(),
            style: body.style,
            format: 'png',
            width,
            height,
            fileSize: estimatedFileSize,
            aspectRatio: aspectRatioValue,
            prompt: body.prompt,
            seed: seed ? seed + index : undefined,
            quality: quality,
            createdAt: new Date(),
            hasWatermark: true, // Gemini은 SynthID 워터마크 포함
            estimatedCost: estimatedCost / batchSize,
          };

          return {
            data: imageBase64,
            format: 'png' as const,
            metadata: imageMetadata,
          };
        }
      )
    );

    const response: ArtGenerateResponse = {
      images,
      batchId: batchSize > 1 ? generateId() : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Art generation error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/art/generate
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Art Generator API is running',
    model: GEMINI_IMAGE_MODEL,
  });
}
