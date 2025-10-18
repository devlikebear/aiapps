/**
 * Google Drive Types
 * Google Drive 관련 타입 정의
 */

/**
 * Google Drive 파일 타입
 */
export type GoogleDriveMediaType = 'audio' | 'image';

/**
 * 파일 메타데이터
 */
export interface MediaMetadata {
  prompt: string;
  genre?: string;
  style?: string;
  createdAt: number;
  tags: string[];
  [key: string]: unknown;
}

/**
 * Google Drive 미디어 항목
 */
export interface GoogleDriveMedia {
  id: string;
  type: GoogleDriveMediaType;
  name: string;
  size: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  metadata?: MediaMetadata;
}

/**
 * 파일 업로드 요청
 */
export interface GoogleDriveUploadRequest {
  file: Blob;
  filename: string;
  type: GoogleDriveMediaType;
  metadata?: MediaMetadata;
}

/**
 * 파일 업로드 응답
 */
export interface GoogleDriveUploadResponse {
  id: string;
  name: string;
  size: string;
  webViewLink: string;
  createdTime: string;
}

/**
 * 파일 목록 응답
 */
export interface GoogleDriveListResponse {
  files: GoogleDriveMedia[];
  total: number;
  nextPageToken?: string;
}

/**
 * Google Drive 에러
 */
export interface GoogleDriveError {
  code: number;
  message: string;
  errors?: Array<{
    domain: string;
    reason: string;
    message: string;
  }>;
}
