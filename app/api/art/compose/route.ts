/**
 * Art Compose API Route Handler
 * POST /api/art/compose
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, checkRateLimit } from '@/lib/middleware/rate-limit';
import { handleAPIError } from '@/lib/errors/handler';
import {
  ValidationError,
  AuthenticationError,
  APIError,
  ErrorCode,
} from '@/lib/errors/types';
import { generateId } from '@/lib/art/utils';

// Gemini 2.5 Flash Image API 설정
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

interface ImageComposeRequest {
  images: string[]; // base64 encoded images (2-10 images)
  prompt: string; // composition instruction
}

interface ImageComposeResponse {
  data: string; // base64 encoded composed image
  metadata: {
    id: string;
    composedFrom: number; // number of source images
    prompt: string;
    createdAt: string;
    hasWatermark: boolean;
  };
}

/**
 * POST /api/art/compose
 * 여러 이미지를 합성하여 새로운 이미지 생성
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
    const body: ImageComposeRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.images || !Array.isArray(body.images) || !body.prompt) {
      throw new ValidationError(
        'Missing required parameters',
        'images (array) and prompt are required'
      );
    }

    // 이미지 개수 검증 (2-10개)
    if (body.images.length < 2) {
      throw new ValidationError(
        'Insufficient images',
        'At least 2 images are required for composition'
      );
    }

    if (body.images.length > 10) {
      throw new ValidationError(
        'Too many images',
        'Maximum 10 images allowed for composition'
      );
    }

    // API 키를 헤더에서 가져오기
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      throw new AuthenticationError('API key not provided', {
        path: request.nextUrl.pathname,
      });
    }

    // Gemini API 호출
    const apiUrl = `${GEMINI_API_URL}?key=${apiKey}`;

    // contents parts 구성 - 모든 이미지 + 프롬프트
    const parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [];

    // 각 이미지를 parts에 추가
    for (const imageData of body.images) {
      // data:image/png;base64, 프리픽스 제거
      const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Image,
        },
      });
    }

    // 합성 프롬프트 추가
    parts.push({ text: body.prompt });

    const geminiRequest = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ['Image'],
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
        'Failed to compose images',
        ErrorCode.GEMINI_API_ERROR,
        geminiResponse.status,
        {
          details: errorData.error?.message || 'Unknown error',
        }
      );
    }

    const geminiData = await geminiResponse.json();

    // Gemini API 응답에서 이미지 추출
    const candidates = geminiData.candidates || [];
    if (candidates.length === 0) {
      throw new APIError(
        'No composed image generated',
        ErrorCode.GEMINI_API_ERROR,
        500,
        { details: 'Empty candidates array in response' }
      );
    }

    const candidate = candidates[0];
    const contentParts = candidate.content?.parts || [];
    const imagePart = contentParts.find(
      (part: { inlineData?: unknown }) => part.inlineData
    );

    if (!imagePart || !imagePart.inlineData) {
      throw new APIError(
        'No image data in response',
        ErrorCode.GEMINI_API_ERROR,
        500,
        { details: 'Invalid response format' }
      );
    }

    const composedImageBase64 = imagePart.inlineData.data;

    const response: ImageComposeResponse = {
      data: composedImageBase64,
      metadata: {
        id: generateId(),
        composedFrom: body.images.length,
        prompt: body.prompt,
        createdAt: new Date().toISOString(),
        hasWatermark: true, // Gemini은 SynthID 워터마크 포함
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * GET /api/art/compose
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Art Compose API is running',
    model: GEMINI_IMAGE_MODEL,
    limits: {
      minImages: 2,
      maxImages: 10,
    },
  });
}
