import { NextRequest, NextResponse } from 'next/server';
import { GeminiImageClient } from '@aiapps/ai-sdk';
import { imagePromptSchema } from '../../../../lib/schemas/image';
import { estimateGenerationCost } from '../../../../lib/utils/token-estimator';

const client = new GeminiImageClient({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = imagePromptSchema.parse(body);

    // Estimate token cost
    const tokenCost = estimateGenerationCost(validatedData);

    // Generate image
    const response = await client.generate({
      prompt: validatedData.prompt,
      negativePrompt: validatedData.negativePrompt,
      seed: validatedData.seed,
    });

    // Get first generated image
    const image = response.images[0];
    const base64Data = Buffer.from(image.data).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        imageData: base64Data,
        mimeType: image.mimeType,
        tokenCost,
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);

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
        error: 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
