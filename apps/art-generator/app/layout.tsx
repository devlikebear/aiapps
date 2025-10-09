import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 2D Game Art Generator',
  description: 'Generate 2D game art using Gemini 2.5 Flash Image',
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
