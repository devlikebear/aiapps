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
import { REFERENCE_USAGE_OPTIONS } from '@/lib/art/types';
import {
  parseResolution,
  generateId,
  estimateGenerationCost,
  calculateAspectRatio,
} from '@/lib/art/utils';
import { rateLimiters, checkRateLimit } from '@/lib/middleware/rate-limit';
import { handleAPIError } from '@/lib/errors/handler';
import {
  ValidationError,
  AuthenticationError,
  APIError,
  ErrorCode,
} from '@/lib/errors/types';

// Gemini 2.5 Flash Image API 설정
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const GEMINI_IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

/**
 * POST /api/art/generate
 * 이미지 생성 요청 처리
 */
export async function POST(request: NextRequest) {
  // Rate Limiting 검사
  const rateLimitResponse = await checkRateLimit(
    request,
    rateLimiters.generation
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // 요청 본문 파싱
    const body: ArtGenerateRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.style || !body.prompt) {
      throw new ValidationError(
        'Missing required parameters: style and prompt',
        'Both style and prompt are required'
      );
    }

    // API 키를 헤더에서 가져오기
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      throw new AuthenticationError('API key not provided', {
        path: request.nextUrl.pathname,
      });
    }

    // 기본값 설정
    const resolution = body.resolution || '512x512';
    const aspectRatio = body.aspectRatio || '1:1';
    const batchSize = body.batchSize || 1;
    const quality = body.quality || 'standard';
    const seed = body.seed;

    // 배치 크기 검증
    if (batchSize < 1 || batchSize > 4) {
      throw new ValidationError(
        'Invalid batch size',
        'Batch size must be between 1 and 4'
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
    let promptText = `${body.prompt} (style: ${body.style}, quality: ${quality})`;

    // 레퍼런스 이미지가 있으면 활용 방식 정보 추가
    if (body.referenceImages && body.referenceImages.usages.length > 0) {
      // 활용 방식의 상세 설명 생성
      const usageDescriptions = body.referenceImages.usages
        .map((usage) => {
          const option = REFERENCE_USAGE_OPTIONS[usage];
          return `${option.label} (${option.description})`;
        })
        .join(', ');

      promptText += ` [Reference Images - Apply: ${usageDescriptions}. Influence: ${body.referenceImages.influence}%]`;
    }

    // contents parts 구성
    const parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [];

    // 레퍼런스 이미지 추가 (있는 경우)
    if (body.referenceImages && body.referenceImages.images.length > 0) {
      for (const imageBase64 of body.referenceImages.images) {
        // data:image/png;base64, 프리픽스 제거
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data,
          },
        });
      }
    }

    // 텍스트 프롬프트 추가
    parts.push({ text: promptText });

    const geminiRequest = {
      contents: [
        {
          parts,
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
      throw new APIError(
        'Failed to generate image',
        ErrorCode.GEMINI_API_ERROR,
        geminiResponse.status,
        {
          details: errorData.error?.message || 'Unknown error',
        }
      );
    }

    const geminiData = await geminiResponse.json();

    // Gemini API 응답에서 이미지 추출
    // 응답 형식: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
    const candidates = geminiData.candidates || [];
    if (candidates.length === 0) {
      throw new APIError(
        'No images generated',
        ErrorCode.GEMINI_API_ERROR,
        500,
        { details: 'Empty candidates array in response' }
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
    return handleAPIError(error);
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
