import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@aiapps/ai-sdk': path.resolve(__dirname, '../../packages/ai-sdk/src'),
      '@aiapps/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@aiapps/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
