const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      '**/.vercel/**',
      '**/.turbo/**',
      '**/next-env.d.ts',
      'eslint.config.js',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];
