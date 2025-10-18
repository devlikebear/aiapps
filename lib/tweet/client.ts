/**
 * Tweet Generator Client
 * Gemini API를 사용한 트윗 생성
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  TweetGenerateRequest,
  TweetGenerateResponse,
  TweetMetadata,
} from './types';
import { TONE_DESCRIPTIONS, LENGTH_DESCRIPTIONS } from './types';

/**
 * 트윗 생성 클라이언트
 */
export class TweetGeneratorClient {
  private client: GoogleGenerativeAI;
  private model: string = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 트윗 생성
   */
  async generate(
    request: TweetGenerateRequest
  ): Promise<TweetGenerateResponse> {
    try {
      const prompt = this.buildPrompt(request);
      const model = this.client.getGenerativeModel({ model: this.model });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const tweet = response.text().trim();

      // 트윗 길이 검증
      this.validateTweetLength(tweet, request.length);

      // 메타데이터 생성
      const metadata: TweetMetadata = {
        id: this.generateId(),
        tone: request.tone,
        length: request.length,
        prompt: request.prompt,
        hasHashtags: request.hashtags ?? false,
        hasEmoji: request.emoji ?? false,
        createdAt: new Date().toISOString(),
        tags: [],
      };

      return {
        tweet,
        metadata,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating tweet:', error);
      throw error;
    }
  }

  /**
   * 프롬프트 빌드
   */
  private buildPrompt(request: TweetGenerateRequest): string {
    const toneDesc = TONE_DESCRIPTIONS[request.tone];
    const lengthInfo = LENGTH_DESCRIPTIONS[request.length];
    const mode = request.mode || 'standard';

    let systemPrompt = `당신은 트윗 작성 전문가입니다. 사용자의 요청에 따라 매력적인 트윗을 작성합니다.\n\n`;

    // 톤 지정
    systemPrompt += `트윗의 톤: ${request.tone} (${toneDesc})\n`;

    // 길이 제한
    systemPrompt += `최대 문자 수: ${lengthInfo.char}자 (정확히 지켜주세요)\n`;

    // 모드 지정
    switch (mode) {
      case 'creative':
        systemPrompt += `모드: 창의적 (상상력 있고 독창적인 표현 사용)\n`;
        break;
      case 'factual':
        systemPrompt += `모드: 팩트풀 (정확하고 신뢰할 수 있는 정보)\n`;
        break;
      default:
        systemPrompt += `모드: 표준 (일반적이고 균형잡힌 표현)\n`;
    }

    // 추가 옵션
    if (request.hashtags) {
      systemPrompt += `- 관련 해시태그 포함 (1-3개)\n`;
    }
    if (request.emoji) {
      systemPrompt += `- 적절한 이모지 포함 (과하지 않게)\n`;
    }
    if (request.mentions && request.mentions.length > 0) {
      systemPrompt += `- @${request.mentions.join(', @')} 멘션 포함\n`;
    }

    systemPrompt += `\n오직 트윗만 반환하고 다른 설명은 추가하지 마세요.\n\n`;
    systemPrompt += `사용자 입력: ${request.prompt}`;

    return systemPrompt;
  }

  /**
   * 트윗 길이 검증
   */
  private validateTweetLength(
    tweet: string,
    length: 'short' | 'medium' | 'long'
  ): void {
    const maxLength =
      length === 'short' ? 140 : length === 'medium' ? 200 : 280;

    if (tweet.length > maxLength) {
      // eslint-disable-next-line no-console
      console.warn(
        `Tweet exceeds length limit: ${tweet.length}/${maxLength} characters`
      );
    }
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `tweet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * 트윗 생성 함수 (간편)
 */
export async function generateTweet(
  apiKey: string,
  request: TweetGenerateRequest
): Promise<TweetGenerateResponse> {
  const client = new TweetGeneratorClient(apiKey);
  return client.generate(request);
}
