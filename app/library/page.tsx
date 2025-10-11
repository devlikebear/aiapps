import { Suspense } from 'react';
import LibraryContent from './LibraryContent';

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">미디어를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
