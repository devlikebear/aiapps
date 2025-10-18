/**
 * Google Drive Configuration
 * 사용자의 Google Drive에 파일 저장
 */

/**
 * Google Drive API 설정
 */
export const googleDriveConfig = {
  // Google OAuth Client ID (public - 안전함)
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,

  // Google Drive API 스코프
  // drive.file: 앱에서 생성/수정한 파일만 접근
  scopes: ['https://www.googleapis.com/auth/drive.file'],

  // Discovery Docs (Google Drive API v3)
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
};

/**
 * Google Drive 폴더 구조
 */
export const GOOGLE_DRIVE_FOLDERS = {
  ROOT: 'aiapps-media', // 루트 폴더명
  AUDIO: 'audio', // 오디오 폴더
  IMAGES: 'images', // 이미지 폴더
  TWEETS: 'tweets', // 트윗 폴더
} as const;

/**
 * MIME 타입
 */
export const MIME_TYPES = {
  AUDIO_WAV: 'audio/wav',
  AUDIO_MP3: 'audio/mpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_JPEG: 'image/jpeg',
  FOLDER: 'application/vnd.google-apps.folder',
} as const;

/**
 * Google Drive API 상수
 */
export const GOOGLE_DRIVE_API = {
  BASE_URL: 'https://www.googleapis.com/drive/v3',
  UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3/files',
  CHUNK_SIZE: 1024 * 256, // 256KB chunks
} as const;
