/**
 * Tweet Generator 앱 타입 정의
 */

/**
 * 트윗 톤(Tone) 타입
 */
export type TweetTone =
  | 'casual'
  | 'professional'
  | 'humorous'
  | 'inspirational';

/**
 * 트윗 길이 프리셋
 */
export type TweetLength = 'short' | 'medium' | 'long'; // 140, 200, 280자

/**
 * 웹 검색 결과
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt?: string;
}

/**
 * 트윗 생성 요청
 */
export interface TweetGenerateRequest {
  // 기본 프롬프트
  prompt: string;

  // 트윗 설정
  tone: TweetTone;
  length: TweetLength;
  hashtags?: boolean; // 해시태그 포함 여부
  emoji?: boolean; // 이모지 포함 여부
  mentions?: string[]; // @멘션 포함

  // 웹 검색 옵션
  includeWeb?: boolean; // 웹 검색 정보 포함
  factCheck?: boolean; // 팩트체크 정보 포함
  newsSource?: boolean; // 최신 뉴스 기반

  // 생성 모드
  mode?: 'standard' | 'creative' | 'factual';
}

/**
 * 트윗 생성 응답
 */
export interface TweetGenerateResponse {
  tweet: string;
  metadata: TweetMetadata;
  searchResults?: SearchResult[]; // 웹 검색 결과
}

/**
 * 트윗 메타데이터 (저장용)
 */
export interface TweetMetadata {
  id: string;
  tone: TweetTone;
  length: TweetLength;
  prompt: string;
  hasHashtags: boolean;
  hasEmoji: boolean;
  createdAt: string;
  tags?: string[];
  isPubliclyShared?: boolean; // Google Drive 공유 여부
  googleDriveId?: string;
}

/**
 * 프리셋 설정
 */
export interface TweetPreset {
  id: string;
  name: string;
  description: string;
  tone: TweetTone;
  length: TweetLength;
  hashtags: boolean;
  emoji: boolean;
  mode: 'standard' | 'creative' | 'factual';
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

/**
 * 저장된 트윗 (라이브러리)
 */
export interface StoredTweet {
  id: string;
  tweet: string;
  metadata: TweetMetadata;
  createdAt: string;
}

/**
 * 기본 프리셋 모음
 */
export const DEFAULT_PRESETS: Record<string, TweetPreset> = {
  casual: {
    id: 'preset-casual',
    name: '캐주얼 톤',
    description: '편하고 친근한 일상 트윗',
    tone: 'casual',
    length: 'medium',
    hashtags: true,
    emoji: true,
    mode: 'standard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
  },
  professional: {
    id: 'preset-professional',
    name: '비즈니스 톤',
    description: '전문적이고 신뢰감 있는 비즈니스 트윗',
    tone: 'professional',
    length: 'long',
    hashtags: false,
    emoji: false,
    mode: 'factual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
  },
  humorous: {
    id: 'preset-humorous',
    name: '유머 톤',
    description: '재미있고 위트있는 트윗',
    tone: 'humorous',
    length: 'medium',
    hashtags: true,
    emoji: true,
    mode: 'creative',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
  },
  inspirational: {
    id: 'preset-inspirational',
    name: '영감 톤',
    description: '감동적이고 영감을 주는 트윗',
    tone: 'inspirational',
    length: 'long',
    hashtags: true,
    emoji: true,
    mode: 'creative',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
  },
};

/**
 * 톤별 설명
 */
export const TONE_DESCRIPTIONS: Record<TweetTone, string> = {
  casual: '편하고 친근한 말투로, 일상적이고 자연스러운 느낌',
  professional: '격식 있고 신뢰감 있는 말투로, 비즈니스 톤',
  humorous: '재미있고 위트있는 말투로, 유머와 아이러니 포함',
  inspirational: '감동적이고 긍정적인 말투로, 영감을 주는 메시지',
};

/**
 * 길이 설명
 */
export const LENGTH_DESCRIPTIONS: Record<
  TweetLength,
  { char: number; desc: string }
> = {
  short: { char: 140, desc: '짧고 간결함 (140자)' },
  medium: { char: 200, desc: '중간 길이 (200자)' },
  long: { char: 280, desc: '최대 길이 (280자)' },
};
