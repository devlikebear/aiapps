import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Game Audio Generator',
  description: 'Generate game audio using Gemini Lyria AI',
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
