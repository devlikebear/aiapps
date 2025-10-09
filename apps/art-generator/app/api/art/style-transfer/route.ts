import { NextRequest, NextResponse } from 'next/server';
import { GeminiImageClient } from '@aiapps/ai-sdk';
import { styleTransferSchema } from '../../../../lib/schemas/image';
import { estimateStyleTransferCost } from '../../../../lib/utils/token-estimator';

const client = new GeminiImageClient({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = styleTransferSchema.parse(body);

    // Estimate token cost
    const tokenCost = estimateStyleTransferCost(validatedData);

    // Transfer style
    const response = await client.styleTransfer({
      baseImage: {
        data: validatedData.baseImage,
        mimeType: 'image/png', // TODO: detect from data
      },
      styleImage: {
        data: validatedData.styleImage,
        mimeType: 'image/png', // TODO: detect from data
      },
      prompt: validatedData.prompt,
    });

    const base64Data = Buffer.from(response.image.data).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        imageData: base64Data,
        mimeType: response.image.mimeType,
        tokenCost,
      },
    });
  } catch (error) {
    console.error('Style transfer error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to transfer style',
      },
      { status: 500 }
    );
  }
}
