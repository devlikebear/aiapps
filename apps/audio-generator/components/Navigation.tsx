/**
 * 네비게이션 컴포넌트
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                AI Audio Generator
              </span>
            </Link>

            <div className="ml-10 flex space-x-4">
              <Link
                href="/audio/create"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                  isActive('/audio/create')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                생성
              </Link>

              <Link
                href="/audio/library"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                  isActive('/audio/library')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                라이브러리
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
