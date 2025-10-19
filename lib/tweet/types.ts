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

  // 톤 상세 정보 (AI 프롬프트에 포함)
  toneDetails?: ToneInfo; // 톤의 상세한 설명 및 지시사항

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
  customToneDescription?: string; // 커스텀 톤 설명 (기본 톤을 오버라이드)
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
 * 톤 정보 인터페이스
 */
export interface ToneInfo {
  label: string;
  brief: string;
  detailed: string;
  promptImpact: string;
  examples: string[];
}

/**
 * 톤별 상세 설명
 */
export const TONE_DESCRIPTIONS: Record<TweetTone, ToneInfo> = {
  casual: {
    label: '캐주얼',
    brief: '편하고 친근한 말투',
    detailed:
      '친구와 대화하듯 편하고 자연스러운 느낌. 일상적인 표현과 이모지 활용으로 친근감 연출',
    promptImpact:
      '🎯 프롬프트를 더 자유롭고 창의적으로 해석. 친근한 표현과 일상 언어 우선',
    examples: [
      '예: "와! 이 제품 진짜 쓸만해 🔥"',
      '예: "오늘 날씨 좋네! 산책 가고 싶은데..."',
    ],
  },
  professional: {
    label: '비즈니스',
    brief: '격식 있고 신뢰감 있는 말투',
    detailed:
      '전문적이고 객관적인 비즈니스 톤. 정중한 표현과 구체적인 내용으로 신뢰감 연출',
    promptImpact: '🎯 정보성과 신뢰도를 최우선. 객관적이고 검증된 내용 강조',
    examples: [
      '예: "당사 제품은 다음과 같은 특징을 제공합니다"',
      '예: "업계 최고 수준의 품질과 서비스를 약속합니다"',
    ],
  },
  humorous: {
    label: '유머',
    brief: '재미있고 위트있는 말투',
    detailed:
      '재미있고 위트있는 표현으로 관심 유도. 유머와 아이러니를 자연스럽게 담음',
    promptImpact: '🎯 말장난, 유머, 아이러니 활용. 가벼운 톤으로 웃음 유도',
    examples: [
      '예: "이 제품이 없으면 인생 반은 낭비하는 거..." 😅',
      '예: "내 생각만 다르나? 이것 진짜 꿀이더라"',
    ],
  },
  inspirational: {
    label: '영감',
    brief: '감동적이고 긍정적인 말투',
    detailed:
      '감동적이고 긍정적인 메시지로 영감과 동기부여 제공. 희망과 가능성 강조',
    promptImpact: '🎯 감정적 공감과 긍정 메시지 우선. 사용자의 꿈과 성장 응원',
    examples: [
      '예: "당신은 충분히 잘할 수 있습니다. 시작해보세요!"',
      '예: "오늘의 작은 노력이 내일의 큰 성공을 만듭니다"',
    ],
  },
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
