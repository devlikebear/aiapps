/**
 * 태그 생성 및 관리 유틸리티
 * 생성 옵션에서 자동으로 태그를 생성하여 IndexedDB에 저장
 */

import type { AudioType, GameGenre } from '@/lib/audio/types';
import type { ArtStyle, QualityPreset } from '@/lib/art/types';

/**
 * 오디오 생성 옵션에서 태그 생성
 */
export function generateAudioTags(options: {
  type: AudioType;
  genre: GameGenre;
  bpm?: number;
  duration?: number;
}): string[] {
  const tags: string[] = [];

  // 타입 태그
  tags.push(`type:${options.type}`);
  tags.push(options.type === 'bgm' ? '배경음악' : '효과음');

  // 장르 태그
  tags.push(`genre:${options.genre}`);

  // 장르별 추가 태그
  const genreLabels: Record<GameGenre, string> = {
    rpg: 'RPG',
    fps: 'FPS',
    puzzle: '퍼즐',
    racing: '레이싱',
    retro: '레트로',
  };
  tags.push(genreLabels[options.genre]);

  // BPM 범위 태그
  if (options.bpm) {
    if (options.bpm < 90) tags.push('느린템포');
    else if (options.bpm < 120) tags.push('보통템포');
    else if (options.bpm < 150) tags.push('빠른템포');
    else tags.push('매우빠른템포');

    tags.push(`bpm:${options.bpm}`);
  }

  // 길이 범위 태그
  if (options.duration) {
    if (options.duration < 10) tags.push('짧음');
    else if (options.duration < 60) tags.push('보통');
    else tags.push('긴');

    tags.push(`duration:${options.duration}s`);
  }

  return tags;
}

/**
 * 이미지 생성 옵션에서 태그 생성
 */
export function generateImageTags(options: {
  style: ArtStyle;
  resolution: string;
  quality?: QualityPreset;
}): string[] {
  const tags: string[] = [];

  // 스타일 태그
  tags.push(`style:${options.style}`);

  // 스타일별 추가 태그
  const styleLabels: Record<ArtStyle, string[]> = {
    'pixel-art': ['픽셀아트', '2D', '레트로'],
    'concept-art': ['컨셉아트', '일러스트', '게임아트'],
    'character-design': ['캐릭터', '디자인', '게임캐릭터'],
    environment: ['배경', '환경', '게임배경'],
    'ui-icons': ['아이콘', 'UI', '인터페이스'],
  };
  tags.push(...styleLabels[options.style]);

  // 해상도 태그
  tags.push(`resolution:${options.resolution}`);

  const [width, height] = options.resolution.split('x').map(Number);
  if (width >= 1920 || height >= 1920) tags.push('고해상도');
  else if (width >= 1024 || height >= 1024) tags.push('중해상도');
  else tags.push('저해상도');

  // 종횡비 태그
  const aspectRatio = width / height;
  if (Math.abs(aspectRatio - 1) < 0.1) tags.push('정사각형');
  else if (aspectRatio > 1) tags.push('가로형');
  else tags.push('세로형');

  // 품질 태그
  if (options.quality) {
    tags.push(`quality:${options.quality}`);

    const qualityLabels: Record<QualityPreset, string> = {
      draft: '드래프트',
      standard: '표준품질',
      high: '고품질',
    };
    tags.push(qualityLabels[options.quality]);
  }

  return tags;
}

/**
 * 태그 배열을 정규화 (중복 제거, 정렬)
 */
export function normalizeTags(tags: string[]): string[] {
  // 중복 제거
  const uniqueTags = Array.from(new Set(tags));

  // 정렬 (콜론 포함 태그는 뒤로)
  return uniqueTags.sort((a, b) => {
    const aHasColon = a.includes(':');
    const bHasColon = b.includes(':');

    if (aHasColon && !bHasColon) return 1;
    if (!aHasColon && bHasColon) return -1;

    return a.localeCompare(b, 'ko');
  });
}

/**
 * 태그에서 검색 키워드 추출
 */
export function extractKeywordsFromTags(tags: string[]): string[] {
  return tags.filter((tag) => !tag.includes(':'));
}

/**
 * 태그에서 메타데이터 추출
 */
export function extractMetadataFromTags(
  tags: string[]
): Record<string, string> {
  const metadata: Record<string, string> = {};

  tags.forEach((tag) => {
    if (tag.includes(':')) {
      const [key, value] = tag.split(':');
      metadata[key] = value;
    }
  });

  return metadata;
}

/**
 * 태그 필터링 (AND 조건)
 */
export function filterByTags<T extends { tags: string[] }>(
  items: T[],
  filterTags: string[]
): T[] {
  if (filterTags.length === 0) return items;

  return items.filter((item) =>
    filterTags.every((tag) => item.tags.includes(tag))
  );
}

/**
 * 태그 필터링 (OR 조건)
 */
export function filterByTagsOr<T extends { tags: string[] }>(
  items: T[],
  filterTags: string[]
): T[] {
  if (filterTags.length === 0) return items;

  return items.filter((item) =>
    filterTags.some((tag) => item.tags.includes(tag))
  );
}

/**
 * 모든 태그 목록 추출
 */
export function getAllTags<T extends { tags: string[] }>(items: T[]): string[] {
  const allTags = items.flatMap((item) => item.tags);
  return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b, 'ko'));
}

/**
 * 태그별 아이템 수 카운트
 */
export function countByTag<T extends { tags: string[] }>(
  items: T[]
): Record<string, number> {
  const tagCounts: Record<string, number> = {};

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return tagCounts;
}
