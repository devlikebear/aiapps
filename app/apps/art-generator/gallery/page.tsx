import { Suspense } from 'react';
import GalleryContent from './GalleryContent';

function GalleryLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              갤러리 로딩 중...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArtGalleryPage() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent />
    </Suspense>
  );
}
