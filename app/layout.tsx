import type { Metadata } from 'next';
import './globals.css';
import GlobalNav from '@/components/GlobalNav';
import JobProvider from '@/components/JobProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';
import ToastContainer from '@/components/ui/Toast';

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
      <body className="antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          메인 콘텐츠로 건너뛰기
        </a>
        <GlobalNav />
        <JobProvider />
        <ToastContainer />
        <ErrorBoundary>
          <main id="main-content" role="main">
            {children}
          </main>
        </ErrorBoundary>
        <WebVitalsReporter />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
