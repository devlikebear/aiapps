import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aiapps/ai-sdk', '@aiapps/ui', '@aiapps/shared'],
};

export default nextConfig;
