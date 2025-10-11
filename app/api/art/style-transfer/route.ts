import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

interface StyleTransferRequest {
  baseImage: string; // base64 encoded image (content)
  stylePrompt: string; // text description of desired style
}

interface StyleTransferResponse {
  data: string; // base64 encoded styled image
  metadata: {
    id: string;
    stylePrompt: string;
    createdAt: string;
    hasWatermark: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIp =
      request.headers.get('x-forwarded-for') || 'anonymous-client';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: StyleTransferRequest = await request.json();
    const { baseImage, stylePrompt } = body;

    // Validation
    if (!baseImage || typeof baseImage !== 'string') {
      return NextResponse.json(
        { error: 'Base image is required and must be a base64 string' },
        { status: 400 }
      );
    }

    if (!stylePrompt || typeof stylePrompt !== 'string') {
      return NextResponse.json(
        { error: 'Style prompt is required' },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Image = baseImage.replace(/^data:image\/\w+;base64,/, '');

    // Build Gemini API request
    const parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [];

    // Add base image
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Image,
      },
    });

    // Add style prompt
    parts.push({
      text: stylePrompt,
    });

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

    // Call Gemini API
    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      // eslint-disable-next-line no-console
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to apply style transfer',
          details: errorData.error?.message || 'Unknown error',
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract image data from response
    const candidates = geminiData.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: 'No styled image generated' },
        { status: 500 }
      );
    }

    const parts_response = candidates[0].content?.parts;
    if (!parts_response || parts_response.length === 0) {
      return NextResponse.json(
        { error: 'No image data in response' },
        { status: 500 }
      );
    }

    const imageData = parts_response.find(
      (part: { inlineData?: { data: string } }) => part.inlineData
    )?.inlineData?.data;

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data found in response' },
        { status: 500 }
      );
    }

    // Create metadata
    const metadata = {
      id: `styled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stylePrompt,
      createdAt: new Date().toISOString(),
      hasWatermark: true, // Gemini images include SynthID watermark
    };

    const response: StyleTransferResponse = {
      data: imageData,
      metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Style transfer error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
