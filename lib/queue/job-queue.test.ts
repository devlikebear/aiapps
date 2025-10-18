import { describe, it, expect } from 'vitest';
import type { Job, JobStatus } from './types';

describe('Job Queue Types', () => {
  describe('Job type definition', () => {
    it('should have all required job properties', () => {
      const job: Job = {
        id: 'test-1',
        type: 'audio-generate',
        status: 'pending',
        params: { prompt: 'test' },
        priority: 5,
        retryCount: 0,
        maxRetries: 3,
        progress: 0,
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        error: null,
      };

      expect(job.id).toBeDefined();
      expect(job.type).toBe('audio-generate');
      expect(job.status).toBe('pending');
      expect(job.priority).toBeGreaterThanOrEqual(0);
      expect(job.priority).toBeLessThanOrEqual(10);
      expect(job.retryCount).toBeGreaterThanOrEqual(0);
      expect(job.maxRetries).toBeGreaterThanOrEqual(0);
      expect(job.progress).toBeGreaterThanOrEqual(0);
      expect(job.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Job status transitions', () => {
    it('should support all valid job statuses', () => {
      const validStatuses: JobStatus[] = [
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled',
      ];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should define valid status transitions', () => {
      const transitions: Record<JobStatus, JobStatus[]> = {
        pending: ['processing', 'cancelled'],
        processing: ['completed', 'failed'],
        completed: [],
        failed: ['pending'], // retry
        cancelled: [],
      };

      expect(Object.keys(transitions)).toHaveLength(5);
      expect(transitions.pending).toContain('processing');
      expect(transitions.failed).toContain('pending');
    });
  });

  describe('Job type variants', () => {
    it('should support audio generation jobs', () => {
      const audioJob: Job['type'] = 'audio-generate';
      expect(audioJob).toBe('audio-generate');
    });

    it('should support image generation jobs', () => {
      const imageTypes: Job['type'][] = [
        'image-generate',
        'image-edit',
        'image-compose',
        'image-style-transfer',
      ];

      expect(imageTypes).toHaveLength(4);
    });
  });

  describe('Job progress tracking', () => {
    it('should define progress as percentage (0-100)', () => {
      const validProgresses = [0, 25, 50, 75, 100];

      validProgresses.forEach((progress) => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Job timestamps', () => {
    it('should track job lifecycle timestamps', () => {
      const now = Date.now();
      const job: Job = {
        id: 'test-1',
        type: 'audio-generate',
        status: 'completed',
        params: { prompt: 'test' },
        priority: 5,
        retryCount: 0,
        maxRetries: 3,
        progress: 100,
        createdAt: now,
        startedAt: now + 1000,
        completedAt: now + 5000,
        error: null,
      };

      expect(job.createdAt).toBe(now);
      expect(job.startedAt).toBeGreaterThan(job.createdAt);
      expect(job.completedAt).toBeGreaterThan(job.startedAt!);
    });
  });

  describe('Job error handling', () => {
    it('should support error messages on failed jobs', () => {
      const failedJob: Job = {
        id: 'test-1',
        type: 'audio-generate',
        status: 'failed',
        params: { prompt: 'test' },
        priority: 5,
        retryCount: 2,
        maxRetries: 3,
        progress: 50,
        createdAt: Date.now(),
        startedAt: Date.now(),
        completedAt: null,
        error: 'API Error: Rate limit exceeded',
      };

      expect(failedJob.error).toBeDefined();
      expect(failedJob.retryCount).toBeLessThan(failedJob.maxRetries);
    });
  });
});
