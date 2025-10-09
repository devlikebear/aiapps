import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ai-blue': '#0ea5e9',
        'ai-purple': '#a855f7',
        'ai-pink': '#ec4899',
        'ai-cyan': '#06b6d4',
        'ai-green': '#10b981',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
