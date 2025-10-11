import JSZip from 'jszip';
import type { GalleryManifest } from './gallery-export';
import { saveImage, getAllImages } from '@/lib/storage/indexed-db';

/**
 * Duplicate handling strategies
 */
export type DuplicateStrategy = 'skip' | 'overwrite' | 'keep-both';

/**
 * Progress callback for import operations
 */
export type ImportProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  status: string;
}) => void;

/**
 * Import result statistics
 */
export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  duplicates: string[];
}

/**
 * Validate gallery manifest
 */
function validateManifest(manifest: unknown): manifest is GalleryManifest {
  if (typeof manifest !== 'object' || manifest === null) {
    return false;
  }

  const m = manifest as GalleryManifest;

  if (
    !m.version ||
    !m.exportDate ||
    !m.totalImages ||
    !Array.isArray(m.images)
  ) {
    return false;
  }

  return true;
}

/**
 * Check if image already exists in database
 */
async function checkDuplicate(id: string): Promise<boolean> {
  try {
    const allImages = await getAllImages();
    return allImages.some((img) => img.id === id);
  } catch {
    return false;
  }
}

/**
 * Import gallery from ZIP file
 */
export async function importGalleryFromZip(
  zipFile: File,
  duplicateStrategy: DuplicateStrategy = 'skip',
  onProgress?: ImportProgressCallback
): Promise<ImportResult> {
  const result: ImportResult = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    duplicates: [],
  };

  try {
    // Load ZIP file
    const zip = await JSZip.loadAsync(zipFile);

    // Read manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error(
        '매니페스트 파일이 없습니다. 유효한 갤러리 ZIP 파일이 아닙니다.'
      );
    }

    const manifestText = await manifestFile.async('text');
    const manifest = JSON.parse(manifestText) as unknown;

    if (!validateManifest(manifest)) {
      throw new Error('매니페스트 파일이 유효하지 않습니다.');
    }

    result.total = manifest.images.length;

    // Import each image
    for (let i = 0; i < manifest.images.length; i++) {
      const imageEntry = manifest.images[i];

      try {
        // Report progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: result.total,
            percentage: Math.round(((i + 1) / result.total) * 100),
            status: `이미지 가져오는 중... (${i + 1}/${result.total})`,
          });
        }

        // Check for duplicate
        const isDuplicate = await checkDuplicate(imageEntry.id);

        if (isDuplicate) {
          result.duplicates.push(imageEntry.id);

          if (duplicateStrategy === 'skip') {
            result.skipped++;
            continue;
          }

          if (duplicateStrategy === 'keep-both') {
            // Generate new ID for duplicate
            imageEntry.id = `${imageEntry.id}-${Date.now()}`;
          }

          // duplicateStrategy === 'overwrite' continues below
        }

        // Get image data from ZIP
        const imageFile = zip.file(imageEntry.filename);
        if (!imageFile) {
          // eslint-disable-next-line no-console
          console.warn(
            `이미지 파일을 찾을 수 없습니다: ${imageEntry.filename}`
          );
          result.errors++;
          continue;
        }

        const imageBlob = await imageFile.async('blob');
        const imageData = await imageBlob.arrayBuffer();

        // Convert ArrayBuffer to base64
        const base64 = btoa(
          new Uint8Array(imageData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        // Create blob URL
        const blob = new Blob([imageData], { type: 'image/png' });
        const blobUrl = URL.createObjectURL(blob);

        // Save to IndexedDB
        await saveImage({
          id: imageEntry.id,
          blobUrl,
          data: base64,
          metadata: {
            id: imageEntry.id,
            style: imageEntry.metadata.style || '',
            prompt: imageEntry.metadata.prompt,
            width: 1024, // Default, actual dimensions not stored in manifest
            height: 1024,
            aspectRatio: imageEntry.metadata.aspectRatio || '1:1',
            seed: imageEntry.metadata.seed,
            createdAt: imageEntry.metadata.createdAt,
          },
          tags: imageEntry.tags,
        });

        result.imported++;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`이미지 가져오기 실패: ${imageEntry.id}`, error);
        result.errors++;
      }
    }

    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('갤러리 가져오기 실패:', error);
    throw error;
  }
}

/**
 * Read ZIP file and preview contents
 */
export async function previewZipContents(
  zipFile: File
): Promise<{ manifest: GalleryManifest; fileSize: number }> {
  try {
    const zip = await JSZip.loadAsync(zipFile);

    // Read manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('매니페스트 파일이 없습니다.');
    }

    const manifestText = await manifestFile.async('text');
    const manifest = JSON.parse(manifestText) as unknown;

    if (!validateManifest(manifest)) {
      throw new Error('매니페스트 파일이 유효하지 않습니다.');
    }

    return {
      manifest,
      fileSize: zipFile.size,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ZIP 파일 미리보기 실패:', error);
    throw error;
  }
}
