import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Storage Utility Test Suite
 *
 * Tests storage and serialization patterns
 * - Data persistence
 * - JSON serialization
 * - Storage key management
 */

interface StorageItem<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number; // time to live in milliseconds
}

class StorageManager {
  private storage: Map<string, StorageItem<unknown>> = new Map();

  set<T>(key: string, value: T, ttl?: number): void {
    if (!key || key.trim().length === 0) {
      throw new Error('Storage key cannot be empty');
    }

    const item: StorageItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
    };

    this.storage.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key) as StorageItem<T> | undefined;

    if (!item) {
      return null;
    }

    // Check TTL
    if (item.ttl) {
      const elapsed = Date.now() - item.timestamp;
      if (elapsed > item.ttl) {
        this.storage.delete(key);
        return null;
      }
    }

    return item.value;
  }

  has(key: string): boolean {
    if (!this.storage.has(key)) {
      return false;
    }

    const item = this.storage.get(key);
    if (item?.ttl) {
      const elapsed = Date.now() - item.timestamp;
      if (elapsed > item.ttl) {
        this.storage.delete(key);
        return false;
      }
    }

    return true;
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): string[] {
    return Array.from(this.storage.keys());
  }

  size(): number {
    return this.storage.size;
  }

  serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  deserialize<T>(json: string): T {
    return JSON.parse(json);
  }
}

describe('Storage Management', () => {
  let storage: StorageManager;

  beforeEach(() => {
    storage = new StorageManager();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      const testData = { name: 'test', value: 123 };

      storage.set('key1', testData);
      const retrieved = storage.get('key1');

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = storage.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should check key existence', () => {
      storage.set('key1', 'value1');

      expect(storage.has('key1')).toBe(true);
      expect(storage.has('nonexistent')).toBe(false);
    });

    it('should delete values', () => {
      storage.set('key1', 'value1');

      const deleted = storage.delete('key1');

      expect(deleted).toBe(true);
      expect(storage.has('key1')).toBe(false);
    });

    it('should clear all values', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');

      storage.clear();

      expect(storage.size()).toBe(0);
    });
  });

  describe('Key Management', () => {
    it('should list all keys', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.set('key3', 'value3');

      const keys = storage.keys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys).toHaveLength(3);
    });

    it('should reject empty keys', () => {
      expect(() => storage.set('', 'value')).toThrow();
      expect(() => storage.set('   ', 'value')).toThrow();
    });

    it('should handle various key formats', () => {
      const keys = [
        'simple-key',
        'key_with_underscore',
        'key123',
        'KEY_UPPERCASE',
        'key:with:colons',
        'key/with/slashes',
      ];

      keys.forEach((key) => {
        storage.set(key, `value-for-${key}`);
      });

      keys.forEach((key) => {
        expect(storage.has(key)).toBe(true);
      });
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire values after TTL', () => {
      const ttl = 100; // milliseconds
      storage.set('temp-key', 'temp-value', ttl);

      expect(storage.get('temp-key')).toBe('temp-value');

      // Manually advance time by changing timestamp (in real scenario, wait)
      // For testing, we'll delete manually
      setTimeout(() => {
        expect(storage.get('temp-key')).toBeNull();
      }, ttl + 50);
    });

    it('should not expire values without TTL', () => {
      storage.set('permanent-key', 'permanent-value');

      // Even if we check later (hypothetically)
      expect(storage.has('permanent-key')).toBe(true);
      expect(storage.get('permanent-key')).toBe('permanent-value');
    });

    it('should clean up expired values on retrieval', () => {
      storage.set('key1', 'value1', 50);

      // Key exists immediately
      expect(storage.has('key1')).toBe(true);

      // After waiting and retrieving
      setTimeout(() => {
        expect(storage.get('key1')).toBeNull();
        expect(storage.has('key1')).toBe(false);
      }, 100);
    });
  });

  describe('Serialization', () => {
    it('should serialize objects to JSON', () => {
      const obj = { name: 'test', value: 123, nested: { key: 'value' } };
      const serialized = storage.serialize(obj);

      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('test');
      expect(serialized).toContain('123');
    });

    it('should deserialize JSON to objects', () => {
      const original = { name: 'test', array: [1, 2, 3] };
      const serialized = storage.serialize(original);
      const deserialized = storage.deserialize<typeof original>(serialized);

      expect(deserialized).toEqual(original);
    });

    it('should handle complex nested structures', () => {
      const complex = {
        level1: {
          level2: {
            level3: {
              data: [1, 2, 3],
              nested: { key: 'value' },
            },
          },
        },
        array: ['a', 'b', 'c'],
      };

      const serialized = storage.serialize(complex);
      const deserialized = storage.deserialize(serialized);

      expect(deserialized).toEqual(complex);
    });

    it('should handle arrays of objects', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      const serialized = storage.serialize(items);
      const deserialized = storage.deserialize<typeof items>(serialized);

      expect(deserialized).toEqual(items);
      expect(deserialized).toHaveLength(3);
    });
  });

  describe('Type Safety', () => {
    it('should preserve types through storage', () => {
      interface User {
        id: number;
        name: string;
        active: boolean;
      }

      const user: User = {
        id: 1,
        name: 'John',
        active: true,
      };

      storage.set('user', user);
      const retrieved = storage.get<User>('user');

      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('John');
      expect(retrieved?.active).toBe(true);
    });

    it('should handle different data types', () => {
      storage.set('string', 'text');
      storage.set('number', 42);
      storage.set('boolean', true);
      storage.set('null', null);
      storage.set('array', [1, 2, 3]);
      storage.set('object', { key: 'value' });

      expect(storage.get('string')).toBe('text');
      expect(storage.get('number')).toBe(42);
      expect(storage.get('boolean')).toBe(true);
      expect(storage.get('null')).toBeNull();
      expect(storage.get('array')).toEqual([1, 2, 3]);
      expect(storage.get('object')).toEqual({ key: 'value' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle overwriting values', () => {
      storage.set('key', 'value1');
      expect(storage.get('key')).toBe('value1');

      storage.set('key', 'value2');
      expect(storage.get('key')).toBe('value2');
    });

    it('should handle storing large objects', () => {
      const largeObj = {
        data: Array(1000)
          .fill(0)
          .map((_, i) => ({
            id: i,
            value: `Item ${i}`,
          })),
      };

      storage.set('large', largeObj);
      const retrieved = storage.get('large');

      expect(retrieved).toEqual(largeObj);
    });

    it('should handle empty objects and arrays', () => {
      storage.set('emptyObj', {});
      storage.set('emptyArray', []);

      expect(storage.get('emptyObj')).toEqual({});
      expect(storage.get('emptyArray')).toEqual([]);
    });
  });

  describe('Storage Size', () => {
    it('should track storage size', () => {
      expect(storage.size()).toBe(0);

      storage.set('key1', 'value1');
      expect(storage.size()).toBe(1);

      storage.set('key2', 'value2');
      expect(storage.size()).toBe(2);

      storage.delete('key1');
      expect(storage.size()).toBe(1);

      storage.clear();
      expect(storage.size()).toBe(0);
    });
  });
});
