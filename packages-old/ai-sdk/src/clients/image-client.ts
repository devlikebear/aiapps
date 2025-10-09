/**
 * Gemini 2.5 Flash Image 클라이언트
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SDKConfig,
  ImageGenerateRequest,
  ImageGenerateResponse,
  ImageEditRequest,
  ImageEditResponse,
  ImageComposeRequest,
  ImageComposeResponse,
  ImageStyleTransferRequest,
  ImageStyleTransferResponse,
  ImageInput,
  GeneratedImage,
  ValidationError,
} from '../types';
import { withRetry } from '../utils/retry';
import { RateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

export interface ImageClientConfig extends SDKConfig {
  model?: string;
}

const DEFAULT_CONFIG: Partial<ImageClientConfig> = {
  timeout: 60000,
  maxRetries: 3,
  model: 'gemini-2.0-flash-exp',
};

export class GeminiImageClient {
  private config: Required<ImageClientConfig>;
  private genAI: GoogleGenerativeAI;
  private rateLimiter: RateLimiter;

  constructor(config: ImageClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<ImageClientConfig>;
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);

    // 레이트 리미터: 분당 60회 요청
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 60,
      interval: 60000,
      maxTokens: 60,
    });
  }

  /**
   * 이미지 생성
   */
  async generate(
    request: ImageGenerateRequest
  ): Promise<ImageGenerateResponse> {
    this.validateGenerateRequest(request);
    await this.rateLimiter.acquire();

    const requestId = `img_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Starting image generation', {
      requestId,
      prompt: request.prompt,
    });

    return withRetry(
      async () => {
        const model = this.genAI.getGenerativeModel({
          model: this.config.model,
        });

        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: request.prompt }],
            },
          ],
        });

        const response = result.response;
        const images: GeneratedImage[] = [];

        // 응답에서 이미지 데이터 추출
        // 실제 구현에서는 Gemini API 응답 형식에 맞게 조정 필요
        if (response.candidates && response.candidates.length > 0) {
          response.candidates.forEach(() => {
            // 실제 이미지 데이터 추출 로직
            const imageData = new ArrayBuffer(0); // 플레이스홀더

            images.push({
              data: imageData,
              mimeType: 'image/png',
              width: 1024,
              height: 1024,
              seed: request.seed,
            });
          });
        }

        return {
          images,
          requestId,
          generatedAt: new Date(),
        };
      },
      {
        maxRetries: this.config.maxRetries,
      }
    );
  }

  /**
   * 이미지 편집
   */
  async edit(request: ImageEditRequest): Promise<ImageEditResponse> {
    this.validateEditRequest(request);
    await this.rateLimiter.acquire();

    const requestId = `img_edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Starting image edit', { requestId, prompt: request.prompt });

    return withRetry(
      async () => {
        const model = this.genAI.getGenerativeModel({
          model: this.config.model,
        });

        // 이미지 데이터 준비
        const imagePart = await this.prepareImagePart(request.image);

        await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [imagePart, { text: request.prompt }],
            },
          ],
        });

        const imageData = new ArrayBuffer(0); // 플레이스홀더

        return {
          image: {
            data: imageData,
            mimeType: 'image/png',
            width: 1024,
            height: 1024,
          },
          requestId,
          generatedAt: new Date(),
        };
      },
      {
        maxRetries: this.config.maxRetries,
      }
    );
  }

  /**
   * 다중 이미지 합성
   */
  async compose(request: ImageComposeRequest): Promise<ImageComposeResponse> {
    this.validateComposeRequest(request);
    await this.rateLimiter.acquire();

    const requestId = `img_compose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Starting image composition', { requestId });

    return withRetry(
      async () => {
        const model = this.genAI.getGenerativeModel({
          model: this.config.model,
        });

        // 이미지 데이터 준비
        const imageParts = await Promise.all(
          request.images.map((img) => this.prepareImagePart(img))
        );

        await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [...imageParts, { text: request.prompt }],
            },
          ],
        });

        const imageData = new ArrayBuffer(0); // 플레이스홀더

        return {
          image: {
            data: imageData,
            mimeType: 'image/png',
            width: 1024,
            height: 1024,
          },
          requestId,
          generatedAt: new Date(),
        };
      },
      {
        maxRetries: this.config.maxRetries,
      }
    );
  }

  /**
   * 스타일 전이
   */
  async styleTransfer(
    request: ImageStyleTransferRequest
  ): Promise<ImageStyleTransferResponse> {
    this.validateStyleTransferRequest(request);
    await this.rateLimiter.acquire();

    const requestId = `img_style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Starting style transfer', { requestId });

    return withRetry(
      async () => {
        const model = this.genAI.getGenerativeModel({
          model: this.config.model,
        });

        const basePart = await this.prepareImagePart(request.baseImage);
        const stylePart = await this.prepareImagePart(request.styleImage);

        const prompt =
          request.prompt ||
          'Apply the style from the second image to the first image';

        await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [basePart, stylePart, { text: prompt }],
            },
          ],
        });

        const imageData = new ArrayBuffer(0); // 플레이스홀더

        return {
          image: {
            data: imageData,
            mimeType: 'image/png',
            width: 1024,
            height: 1024,
          },
          requestId,
          generatedAt: new Date(),
        };
      },
      {
        maxRetries: this.config.maxRetries,
      }
    );
  }

  /**
   * 이미지 데이터 준비
   */
  private async prepareImagePart(
    image: ImageInput
  ): Promise<{ inlineData: { data: string; mimeType: string } }> {
    // 실제 구현에서는 이미지 형식에 맞게 변환
    if (
      image.data &&
      (typeof image.data === 'string' || image.data instanceof ArrayBuffer)
    ) {
      const base64Data =
        typeof image.data === 'string'
          ? image.data
          : Buffer.from(image.data).toString('base64');

      return {
        inlineData: {
          data: base64Data,
          mimeType: image.mimeType || 'image/png',
        },
      };
    }

    throw new ValidationError('Invalid image data');
  }

  /**
   * 생성 요청 검증
   */
  private validateGenerateRequest(request: ImageGenerateRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ValidationError('Prompt is required');
    }

    if (
      request.numberOfImages &&
      (request.numberOfImages < 1 || request.numberOfImages > 4)
    ) {
      throw new ValidationError('Number of images must be between 1 and 4');
    }
  }

  /**
   * 편집 요청 검증
   */
  private validateEditRequest(request: ImageEditRequest): void {
    if (!request.image) {
      throw new ValidationError('Image is required');
    }

    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ValidationError('Prompt is required');
    }
  }

  /**
   * 합성 요청 검증
   */
  private validateComposeRequest(request: ImageComposeRequest): void {
    if (
      !request.images ||
      request.images.length < 2 ||
      request.images.length > 3
    ) {
      throw new ValidationError('2 to 3 images are required');
    }

    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ValidationError('Prompt is required');
    }
  }

  /**
   * 스타일 전이 요청 검증
   */
  private validateStyleTransferRequest(
    request: ImageStyleTransferRequest
  ): void {
    if (!request.baseImage || !request.styleImage) {
      throw new ValidationError('Base image and style image are required');
    }
  }
}
