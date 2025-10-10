/**
 * Next.js Middleware
 * CORS, 보안 헤더, Rate Limiting 등 글로벌 처리
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 허용된 오리진 목록
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://aiapps.vercel.app', // Vercel 배포 URL (실제 도메인으로 변경 필요)
];

// CORS 헤더 설정
function setCorsHeaders(response: NextResponse, origin: string | null) {
  // 오리진 검증
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-API-Key'
  );
  response.headers.set('Access-Control-Max-Age', '86400'); // 24시간

  return response;
}

// 보안 헤더 설정
function setSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js는 unsafe-eval 필요
      "style-src 'self' 'unsafe-inline'", // Tailwind는 unsafe-inline 필요
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ')
  );

  // X-Frame-Options (클릭재킹 방지)
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options (MIME 타입 스니핑 방지)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection (XSS 필터 활성화)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (기능 정책)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const { pathname } = request.nextUrl;

  // Preflight 요청 처리 (OPTIONS)
  if (request.method === 'OPTIONS') {
    const response = NextResponse.json({}, { status: 200 });
    return setCorsHeaders(response, origin);
  }

  // API 라우트에 대한 처리
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // CORS 헤더 추가
    setCorsHeaders(response, origin);

    return response;
  }

  // 일반 페이지 요청에 대한 보안 헤더 추가
  const response = NextResponse.next();
  setSecurityHeaders(response);

  return response;
}

// Middleware 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    '/api/:path*',
  ],
};
