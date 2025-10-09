import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Tools Hub - Curated AI-Powered Creative Apps',
  description:
    'Discover and explore curated collection of AI-powered creative tools for music, art, and more',
  keywords: [
    'ai tools',
    'ai apps',
    'gemini ai',
    'audio generation',
    'image generation',
    'creative ai',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
