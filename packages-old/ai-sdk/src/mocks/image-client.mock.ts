/**
 * Image Client 모킹 유틸리티
 */

import {
  ImageGenerateRequest,
  ImageGenerateResponse,
  ImageEditRequest,
  ImageEditResponse,
  ImageComposeRequest,
  ImageComposeResponse,
  ImageStyleTransferRequest,
  ImageStyleTransferResponse,
  GeneratedImage,
} from '../types';

export class MockGeminiImageClient {
  async generate(
    request: ImageGenerateRequest
  ): Promise<ImageGenerateResponse> {
    const numberOfImages = request.numberOfImages || 1;
    const images: GeneratedImage[] = [];

    for (let i = 0; i < numberOfImages; i++) {
      images.push({
        data: new ArrayBuffer(1024 * 1024), // 1MB 플레이스홀더
        mimeType: 'image/png',
        width: 1024,
        height: 1024,
        seed: request.seed,
      });
    }

    return {
      images,
      requestId: `mock_img_gen_${Date.now()}`,
      generatedAt: new Date(),
      estimatedTokens: 1290,
    };
  }

  async edit(_request: ImageEditRequest): Promise<ImageEditResponse> {
    return {
      image: {
        data: new ArrayBuffer(1024 * 1024),
        mimeType: 'image/png',
        width: 1024,
        height: 1024,
      },
      requestId: `mock_img_edit_${Date.now()}`,
      generatedAt: new Date(),
    };
  }

  async compose(_request: ImageComposeRequest): Promise<ImageComposeResponse> {
    return {
      image: {
        data: new ArrayBuffer(1024 * 1024),
        mimeType: 'image/png',
        width: 1024,
        height: 1024,
      },
      requestId: `mock_img_compose_${Date.now()}`,
      generatedAt: new Date(),
    };
  }

  async styleTransfer(
    _request: ImageStyleTransferRequest
  ): Promise<ImageStyleTransferResponse> {
    return {
      image: {
        data: new ArrayBuffer(1024 * 1024),
        mimeType: 'image/png',
        width: 1024,
        height: 1024,
      },
      requestId: `mock_img_style_${Date.now()}`,
      generatedAt: new Date(),
    };
  }
}

export function mockImageClient(): MockGeminiImageClient {
  return new MockGeminiImageClient();
}
