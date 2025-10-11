/**
 * Art Edit API Route Handler
 * POST /api/art/edit
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

interface ImageEditRequest {
  imageData: string; // base64 encoded image
  prompt: string; // edit instruction
  mask?: string; // optional base64 encoded mask image
  preserveAspectRatio?: boolean;
}

interface ImageEditResponse {
  data: string; // base64 encoded edited image
  metadata: {
    id: string;
    originalImageId?: string;
    editPrompt: string;
    createdAt: string;
    hasWatermark: boolean;
  };
}

/**
 * POST /api/art/edit
 * 이미지 편집 요청 처리
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
    const body: ImageEditRequest = await request.json();

    // 필수 파라미터 검증
    if (!body.imageData || !body.prompt) {
      throw new ValidationError(
        'Missing required parameters',
        'Both imageData and prompt are required'
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

    // data:image/png;base64, 프리픽스 제거
    const base64Image = body.imageData.replace(/^data:image\/\w+;base64,/, '');

    // contents parts 구성
    const parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [];

    // 원본 이미지 추가
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Image,
      },
    });

    // 마스크 이미지 추가 (있는 경우)
    if (body.mask) {
      const base64Mask = body.mask.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Mask,
        },
      });
    }

    // 편집 프롬프트 추가
    parts.push({ text: body.prompt });

    const geminiRequest = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ['Image'],
        ...(body.preserveAspectRatio && {
          imageConfig: {
            preserveAspectRatio: true,
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
        'Failed to edit image',
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
        'No edited image generated',
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

    const editedImageBase64 = imagePart.inlineData.data;

    const response: ImageEditResponse = {
      data: editedImageBase64,
      metadata: {
        id: generateId(),
        editPrompt: body.prompt,
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
 * GET /api/art/edit
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Art Edit API is running',
    model: GEMINI_IMAGE_MODEL,
  });
}
