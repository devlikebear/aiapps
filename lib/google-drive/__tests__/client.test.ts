import { describe, it, expect } from 'vitest';
import { optimizeMetadataForGoogleDrive } from '../client';

describe('optimizeMetadataForGoogleDrive', () => {
  it('should handle empty metadata', () => {
    const result = optimizeMetadataForGoogleDrive({});
    expect(result).toEqual({});
  });

  it('should remove null and undefined values', () => {
    const result = optimizeMetadataForGoogleDrive({
      key1: 'value1',
      key2: null,
      key3: undefined,
    } as Record<string, unknown>);
    expect(result).toEqual({ key1: 'value1' });
  });

  it('should truncate long values to fit within 124 byte limit', () => {
    const longValue = 'a'.repeat(200);
    const result = optimizeMetadataForGoogleDrive({
      prompt: longValue,
    });
    // prompt는 6글자, 최대 114글자까지 가능, + '...' 추가
    expect(result.prompt).toContain('...');
    expect(result.prompt.length).toBeLessThanOrEqual(117);
  });

  it('should handle mixed types by converting to string', () => {
    const result = optimizeMetadataForGoogleDrive({
      str: 'test',
      num: 123,
      bool: true,
    });
    expect(result).toEqual({
      str: 'test',
      num: '123',
      bool: 'true',
    });
  });

  it('should stay within 124 byte limit per property (UTF-8)', () => {
    const result = optimizeMetadataForGoogleDrive({
      key: 'a'.repeat(200),
    });
    const key = 'key';
    const value = result.key;
    // UTF-8 바이트 길이로 확인
    const encoded = new TextEncoder().encode(key + value);
    expect(encoded.byteLength).toBeLessThanOrEqual(124);
  });

  it('should handle Korean characters properly', () => {
    const result = optimizeMetadataForGoogleDrive({
      타입: '한국어',
      genre: '장르',
    });
    expect(result.genre).toBeDefined();
    // 한국 문자 하나는 일반적으로 3 바이트
    const encoded = new TextEncoder().encode('genre' + result.genre);
    expect(encoded.byteLength).toBeLessThanOrEqual(124);
  });

  it('should preserve short values as-is', () => {
    const result = optimizeMetadataForGoogleDrive({
      t: 'bgm',
      g: 'epic',
      b: '120',
    });
    expect(result).toEqual({
      t: 'bgm',
      g: 'epic',
      b: '120',
    });
  });

  it('should truncate emoji when needed', () => {
    const result = optimizeMetadataForGoogleDrive({
      emoji: '🎵',
    });
    // emoji가 있으면 정상적으로 저장됨
    expect(result.emoji).toBeDefined();
    expect(result.emoji).toBe('🎵');
  });
});
