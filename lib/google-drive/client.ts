/**
 * Google Drive Client
 * Google Drive API를 사용한 파일 업로드/조회/삭제
 */

'use client';

import { MIME_TYPES } from './config';

/**
 * Google Drive 파일 메타데이터
 */
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  parents?: string[];
  properties?: Record<string, string>;
}

/**
 * Google Drive 폴더 생성/조회
 */
export async function ensureGoogleDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  try {
    // 기존 폴더 조회
    const query = `name='${folderName}' and mimeType='${MIME_TYPES.FOLDER}' and trashed=false`;
    const parentQuery = parentFolderId
      ? ` and '${parentFolderId}' in parents`
      : '';

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query + parentQuery
      )}&spaces=drive&fields=files(id,name)&pageSize=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, unknown>).error || response.statusText;
      throw new Error(
        `Failed to query folders: ${response.status} ${JSON.stringify(errorMessage)}`
      );
    }

    const data = (await response.json()) as { files?: GoogleDriveFile[] };

    // 폴더가 이미 존재하면 ID 반환
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // 폴더 생성
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: MIME_TYPES.FOLDER,
          parents: parentFolderId ? [parentFolderId] : undefined,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, unknown>).error ||
        createResponse.statusText;
      throw new Error(
        `Failed to create folder: ${createResponse.status} ${JSON.stringify(errorMessage)}`
      );
    }

    const createdFolder = (await createResponse.json()) as GoogleDriveFile;
    return createdFolder.id;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error ensuring Google Drive folder:', error);
    throw error;
  }
}

/**
 * Google Drive에 파일 업로드
 */
export async function uploadFileToGoogleDrive(
  accessToken: string,
  file: Blob,
  filename: string,
  parentFolderId: string,
  metadata?: Record<string, string>
): Promise<GoogleDriveFile> {
  try {
    const form = new FormData();

    // 파일 메타데이터
    const fileMetadata: Record<string, unknown> = {
      name: filename,
      parents: [parentFolderId],
    };

    // 커스텀 속성 추가
    if (metadata) {
      fileMetadata.properties = metadata;
    }

    form.append(
      'metadata',
      new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
    );
    form.append('file', file);

    // Google Drive API multipart upload
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, unknown>).error || response.statusText;
      throw new Error(
        `Upload failed: ${response.status} ${JSON.stringify(errorMessage)}`
      );
    }

    const uploadedFile = (await response.json()) as GoogleDriveFile;
    return uploadedFile;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

/**
 * Google Drive에서 파일 목록 조회
 */
export async function listFilesFromGoogleDrive(
  accessToken: string,
  parentFolderId: string,
  pageSize: number = 20,
  pageToken?: string
): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
  try {
    const query = `'${parentFolderId}' in parents and trashed=false`;
    const params = new URLSearchParams({
      q: query,
      spaces: 'drive',
      fields:
        'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties),nextPageToken',
      pageSize: pageSize.toString(),
      orderBy: 'createdTime desc',
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, unknown>).error || response.statusText;
      throw new Error(
        `Failed to list files: ${response.status} ${JSON.stringify(errorMessage)}`
      );
    }

    const data = (await response.json()) as {
      files: GoogleDriveFile[];
      nextPageToken?: string;
    };
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error listing files from Google Drive:', error);
    throw error;
  }
}

/**
 * Google Drive에서 파일 삭제
 */
export async function deleteFileFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, unknown>).error || response.statusText;
      throw new Error(
        `Failed to delete file: ${response.status} ${JSON.stringify(errorMessage)}`
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
}

/**
 * Google Drive 파일 다운로드 URL 생성
 */
export function getGoogleDriveFileUrl(
  fileId: string,
  exportFormat?: string
): string {
  if (exportFormat) {
    return `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(
      exportFormat
    )}`;
  }
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}

/**
 * Google Drive 파일 공유 링크 생성
 */
export async function shareGoogleDriveFile(
  accessToken: string,
  fileId: string
): Promise<string> {
  try {
    // 파일을 공개로 공유하는 권한 생성
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, unknown>).error || response.statusText;
      throw new Error(
        `Failed to share file: ${response.status} ${JSON.stringify(errorMessage)}`
      );
    }

    // 공유 링크 반환
    return `https://drive.google.com/file/d/${fileId}/view`;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sharing file on Google Drive:', error);
    throw error;
  }
}
