'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SpriteGeneratorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/apps/sprite-generator/create');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-400">리다이렉트 중...</p>
      </div>
    </div>
  );
}
