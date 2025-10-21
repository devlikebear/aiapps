/**
 * Sprite Generator API Route Handler
 * POST /api/sprite/generate
 */

import { NextRequest, NextResponse } from 'next/server';

// Gemini 2.5 Flash Image API 설정
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const GEMINI_IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

/**
 * POST /api/sprite/generate
 * 스프라이트 생성 요청 처리
 */
export async function POST(request: NextRequest) {
  try {
    // FormData에서 파일과 파라미터 가져오기
    const formData = await request.formData();

    const referenceSpriteFile = formData.get('referenceSprite') as File | null;
    const characterImageFile = formData.get('characterImage') as File | null;
    const frameColumns = parseInt(formData.get('frameColumns') as string);
    const frameRows = parseInt(formData.get('frameRows') as string);
    const apiKey = formData.get('apiKey') as string | null;

    // 필수 파라미터 검증
    if (!referenceSpriteFile || !characterImageFile) {
      return NextResponse.json(
        { error: 'Reference sprite and character image are required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    if (!frameColumns || !frameRows) {
      return NextResponse.json(
        { error: 'Frame columns and rows are required' },
        { status: 400 }
      );
    }

    // 파일을 base64로 변환
    const referenceSpriteBuffer = await referenceSpriteFile.arrayBuffer();
    const referenceSpriteBase64 = Buffer.from(referenceSpriteBuffer).toString(
      'base64'
    );

    const characterImageBuffer = await characterImageFile.arrayBuffer();
    const characterImageBase64 = Buffer.from(characterImageBuffer).toString(
      'base64'
    );

    // Gemini API 호출
    const apiUrl = `${GEMINI_IMAGE_API_URL}?key=${apiKey}`;

    // 프롬프트 생성
    const promptText = `You are an expert sprite sheet generator for game development.

TASK: Create a new animation sprite sheet by replacing the character in the reference sprite sheet with the provided character image.

INPUTS:
1. First image: Reference animation sprite sheet with ${frameColumns} columns and ${frameRows} rows (total ${frameColumns * frameRows} frames)
2. Second image: New character to be used in the sprite sheet

REQUIREMENTS:
- Analyze the animation pattern from the reference sprite sheet
- Maintain the exact same frame structure: ${frameColumns} columns × ${frameRows} rows
- Keep the same animation timing and poses
- Replace the character in each frame with the new character
- Ensure consistent character size and positioning across all frames
- Maintain transparent background if the original has one
- Keep the same pixel art or art style as the reference

OUTPUT:
Generate a complete sprite sheet image with ${frameColumns * frameRows} frames arranged in ${frameColumns} columns and ${frameRows} rows, with the new character performing the same animation as the reference.`;

    const geminiRequest = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: referenceSpriteBase64,
              },
            },
            {
              inlineData: {
                mimeType: 'image/png',
                data: characterImageBase64,
              },
            },
            {
              text: promptText,
            },
          ],
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
      return NextResponse.json(
        {
          error: 'Failed to generate sprite',
          details: errorData.error?.message || 'Unknown error',
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();

    // Gemini API 응답에서 이미지 추출
    const candidates = geminiData.candidates || [];
    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'No sprite generated' },
        { status: 500 }
      );
    }

    const parts = candidates[0].content?.parts || [];
    const imagePart = parts.find((part: { inlineData?: unknown }) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      return NextResponse.json(
        { error: 'No image data in response' },
        { status: 500 }
      );
    }

    const imageBase64 = (imagePart.inlineData as { data: string }).data;

    // Base64를 이미지 버퍼로 변환
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // 이미지를 반환 (PNG 형식)
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="generated-sprite.png"',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Sprite generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sprite/generate
 * API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Sprite Generator API is running',
    model: GEMINI_IMAGE_MODEL,
  });
}
