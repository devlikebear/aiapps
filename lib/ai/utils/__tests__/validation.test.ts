import { describe, it, expect } from 'vitest';

/**
 * Input Validation Test Suite
 *
 * Tests validation patterns used across API endpoints
 * - Prompt validation
 * - Parameter range checking
 * - Type safety
 */

interface AudioGenerateParams {
  prompt: string;
  duration?: number; // seconds
  bpm?: number; // 60-200
  density?: number; // 0-1
  brightness?: number; // 0-1
}

interface ImageGenerateParams {
  prompt: string;
  aspectRatio?: string; // e.g., "1:1", "16:9"
  seed?: number;
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateAudioParams(params: AudioGenerateParams): void {
  if (!params.prompt || params.prompt.trim().length === 0) {
    throw new ValidationError('Prompt is required', 'prompt', params.prompt);
  }

  if (params.prompt.length > 2000) {
    throw new ValidationError(
      'Prompt must be less than 2000 characters',
      'prompt',
      params.prompt.length
    );
  }

  if (params.duration !== undefined) {
    if (params.duration < 5 || params.duration > 120) {
      throw new ValidationError(
        'Duration must be between 5 and 120 seconds',
        'duration',
        params.duration
      );
    }
  }

  if (params.bpm !== undefined) {
    if (params.bpm < 60 || params.bpm > 200) {
      throw new ValidationError(
        'BPM must be between 60 and 200',
        'bpm',
        params.bpm
      );
    }
  }

  if (params.density !== undefined) {
    if (params.density < 0 || params.density > 1) {
      throw new ValidationError(
        'Density must be between 0 and 1',
        'density',
        params.density
      );
    }
  }

  if (params.brightness !== undefined) {
    if (params.brightness < 0 || params.brightness > 1) {
      throw new ValidationError(
        'Brightness must be between 0 and 1',
        'brightness',
        params.brightness
      );
    }
  }
}

function validateImageParams(params: ImageGenerateParams): void {
  if (!params.prompt || params.prompt.trim().length === 0) {
    throw new ValidationError('Prompt is required', 'prompt', params.prompt);
  }

  if (params.prompt.length > 2000) {
    throw new ValidationError(
      'Prompt must be less than 2000 characters',
      'prompt',
      params.prompt.length
    );
  }

  if (params.aspectRatio !== undefined) {
    const validRatios = ['1:1', '3:2', '4:3', '16:9', '9:16', '21:9'];
    if (!validRatios.includes(params.aspectRatio)) {
      throw new ValidationError(
        'Invalid aspect ratio',
        'aspectRatio',
        params.aspectRatio
      );
    }
  }

  if (params.seed !== undefined) {
    if (!Number.isInteger(params.seed) || params.seed < 0) {
      throw new ValidationError(
        'Seed must be a non-negative integer',
        'seed',
        params.seed
      );
    }
  }
}

describe('Input Validation', () => {
  describe('Audio Generation Validation', () => {
    it('should accept valid audio parameters', () => {
      const validParams: AudioGenerateParams = {
        prompt: 'Epic orchestral music',
        duration: 30,
        bpm: 120,
        density: 0.7,
        brightness: 0.6,
      };

      expect(() => validateAudioParams(validParams)).not.toThrow();
    });

    it('should require a prompt', () => {
      const invalidParams: AudioGenerateParams = {
        prompt: '',
      };

      expect(() => validateAudioParams(invalidParams)).toThrow(ValidationError);
    });

    it('should reject prompts longer than 2000 characters', () => {
      const invalidParams: AudioGenerateParams = {
        prompt: 'a'.repeat(2001),
      };

      expect(() => validateAudioParams(invalidParams)).toThrow(ValidationError);
    });

    it('should validate duration range (5-120 seconds)', () => {
      const tooShort: AudioGenerateParams = {
        prompt: 'test',
        duration: 3,
      };

      const tooLong: AudioGenerateParams = {
        prompt: 'test',
        duration: 300,
      };

      expect(() => validateAudioParams(tooShort)).toThrow(ValidationError);
      expect(() => validateAudioParams(tooLong)).toThrow(ValidationError);
    });

    it('should validate BPM range (60-200)', () => {
      const tooBlow: AudioGenerateParams = {
        prompt: 'test',
        bpm: 50,
      };

      const tooHigh: AudioGenerateParams = {
        prompt: 'test',
        bpm: 250,
      };

      expect(() => validateAudioParams(tooBlow)).toThrow(ValidationError);
      expect(() => validateAudioParams(tooHigh)).toThrow(ValidationError);
    });

    it('should validate density range (0-1)', () => {
      const invalid: AudioGenerateParams = {
        prompt: 'test',
        density: 1.5,
      };

      expect(() => validateAudioParams(invalid)).toThrow(ValidationError);
    });

    it('should validate brightness range (0-1)', () => {
      const invalid: AudioGenerateParams = {
        prompt: 'test',
        brightness: -0.5,
      };

      expect(() => validateAudioParams(invalid)).toThrow(ValidationError);
    });
  });

  describe('Image Generation Validation', () => {
    it('should accept valid image parameters', () => {
      const validParams: ImageGenerateParams = {
        prompt: '2D pixel art fantasy character',
        aspectRatio: '1:1',
        seed: 42,
      };

      expect(() => validateImageParams(validParams)).not.toThrow();
    });

    it('should require a prompt', () => {
      const invalidParams: ImageGenerateParams = {
        prompt: '',
      };

      expect(() => validateImageParams(invalidParams)).toThrow(ValidationError);
    });

    it('should reject prompts longer than 2000 characters', () => {
      const invalidParams: ImageGenerateParams = {
        prompt: 'a'.repeat(2001),
      };

      expect(() => validateImageParams(invalidParams)).toThrow(ValidationError);
    });

    it('should validate aspect ratio', () => {
      const validRatios = ['1:1', '3:2', '4:3', '16:9', '9:16', '21:9'];

      validRatios.forEach((ratio) => {
        const params: ImageGenerateParams = {
          prompt: 'test',
          aspectRatio: ratio,
        };

        expect(() => validateImageParams(params)).not.toThrow();
      });
    });

    it('should reject invalid aspect ratios', () => {
      const invalidParams: ImageGenerateParams = {
        prompt: 'test',
        aspectRatio: '5:7',
      };

      expect(() => validateImageParams(invalidParams)).toThrow(ValidationError);
    });

    it('should validate seed as non-negative integer', () => {
      const negativeParams: ImageGenerateParams = {
        prompt: 'test',
        seed: -1,
      };

      const floatParams: ImageGenerateParams = {
        prompt: 'test',
        seed: 3.14,
      };

      expect(() => validateImageParams(negativeParams)).toThrow(
        ValidationError
      );
      expect(() => validateImageParams(floatParams)).toThrow(ValidationError);
    });
  });

  describe('Error Reporting', () => {
    it('should include field information in validation errors', () => {
      const invalidParams: AudioGenerateParams = {
        prompt: 'test',
        bpm: 250,
      };

      try {
        validateAudioParams(invalidParams);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.field).toBe('bpm');
          expect(error.value).toBe(250);
        }
      }
    });

    it('should provide actionable error messages', () => {
      const invalidParams: AudioGenerateParams = {
        prompt: '',
      };

      try {
        validateAudioParams(invalidParams);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.message).toContain('required');
        }
      }
    });
  });

  describe('Optional Parameters', () => {
    it('should accept parameters without optional fields', () => {
      const minimalParams: AudioGenerateParams = {
        prompt: 'Test audio',
      };

      expect(() => validateAudioParams(minimalParams)).not.toThrow();
    });

    it('should validate optional parameters when provided', () => {
      const paramsWithOptional: AudioGenerateParams = {
        prompt: 'Test audio',
        duration: 30,
      };

      expect(() => validateAudioParams(paramsWithOptional)).not.toThrow();
    });
  });
});
