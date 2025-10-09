/**
 * 토큰 비용 추정 유틸리티
 */

import { AudioPrompt } from '../schemas/audio';

/**
 * Gemini Lyria 토큰 비용 (예상)
 * 실제 비용은 Gemini API 문서 참조
 */
const TOKEN_COST = {
  BASE: 100, // 기본 프롬프트
  PER_SECOND: 10, // 초당 추가 비용
  WEIGHTED_PROMPT: 50, // 가중치 프롬프트당
};

/**
 * 토큰 비용 추정
 */
export function estimateTokenCost(prompt: AudioPrompt): number {
  let cost = TOKEN_COST.BASE;

  // 길이에 따른 비용
  cost += prompt.duration * TOKEN_COST.PER_SECOND;

  // 복잡도에 따른 추가 비용
  if (prompt.instruments.length > 3) {
    cost += TOKEN_COST.WEIGHTED_PROMPT;
  }

  // Density와 Brightness에 따른 비용
  if (prompt.density > 0.7 || prompt.brightness > 0.7) {
    cost += TOKEN_COST.WEIGHTED_PROMPT * 0.5;
  }

  return Math.round(cost);
}

/**
 * 예상 비용 포맷팅
 */
export function formatTokenCost(cost: number): string {
  return `~${cost.toLocaleString()} tokens`;
}
