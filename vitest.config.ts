import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', '.next', 'e2e', '.git'],
    include: [
      'lib/**/*.test.ts',
      'lib/**/*.test.tsx',
      'packages/ui/src/**/*.test.ts',
      'packages/ui/src/**/*.test.tsx',
    ],
    setupFiles: './packages/ui/src/test/setup.ts',
    css: true,
  },
});
