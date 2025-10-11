import JSZip from 'jszip';
import type { StoredImage } from '@/lib/types/storage';

// Image with blob URL
interface ImageWithBlob extends StoredImage {
  blobUrl: string;
}

/**
 * Gallery Export Manifest Format
 */
export interface GalleryManifest {
  version: string;
  exportDate: string;
  totalImages: number;
  images: ManifestImage[];
}

export interface ManifestImage {
  id: string;
  filename: string;
  metadata: {
    prompt: string;
    style?: string;
    aspectRatio?: string;
    seed?: number;
    createdAt: string;
  };
  tags?: string[];
}

/**
 * Progress callback for export operations
 */
export type ExportProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  status: string;
}) => void;

/**
 * Export selected images to a ZIP file
 */
export async function exportGalleryToZip(
  images: ImageWithBlob[],
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  const zip = new JSZip();
  const total = images.length;

  // Create manifest
  const manifest: GalleryManifest = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    totalImages: total,
    images: [],
  };

  // Add images to ZIP
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filename = `${image.id}.png`;

    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        status: `이미지 압축 중... (${i + 1}/${total})`,
      });
    }

    // Add image to ZIP
    if (image.data) {
      zip.file(filename, image.data);
    }

    // Add to manifest
    manifest.images.push({
      id: image.id,
      filename,
      metadata: {
        prompt: image.metadata.prompt,
        style: image.metadata.style,
        aspectRatio: image.metadata.aspectRatio,
        seed: image.metadata.seed,
        createdAt: image.metadata.createdAt,
      },
      tags: image.tags,
    });
  }

  // Add manifest.json
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Generate ZIP blob
  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 100,
      status: 'ZIP 파일 생성 중...',
    });
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress({
          current: total,
          total,
          percentage: Math.round(metadata.percent),
          status: `ZIP 파일 생성 중... ${Math.round(metadata.percent)}%`,
        });
      }
    }
  );

  return zipBlob;
}

/**
 * Download ZIP blob as a file
 */
export function downloadZipFile(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    filename || `gallery-export-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download gallery images
 */
export async function exportAndDownloadGallery(
  images: ImageWithBlob[],
  onProgress?: ExportProgressCallback
): Promise<void> {
  const zipBlob = await exportGalleryToZip(images, onProgress);
  downloadZipFile(zipBlob);
}
