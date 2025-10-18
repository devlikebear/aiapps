/**
 * Google Drive Auth Hooks
 * Google Drive 인증 및 파일 관리 React hooks
 */

'use client';

import { useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import {
  ensureGoogleDriveFolder,
  uploadFileToGoogleDrive,
  listFilesFromGoogleDrive,
  deleteFileFromGoogleDrive,
} from './client';
import { GOOGLE_DRIVE_FOLDERS } from './config';

/**
 * Google Drive 로그인 Hook
 */
export function useGoogleDriveLogin() {
  const {
    setAuthenticated,
    setAccessToken,
    setLoading,
    setError,
    setFolderIds,
  } = useGoogleDriveStore();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setLoading(true);
      try {
        // Extract access_token from response
        const accessToken = (
          codeResponse as unknown as { access_token: string }
        ).access_token;

        // 인증 토큰 저장
        setAccessToken(accessToken);

        // 폴더 구조 생성/조회
        const rootFolderId = await ensureGoogleDriveFolder(
          accessToken,
          GOOGLE_DRIVE_FOLDERS.ROOT
        );

        const audioFolderId = await ensureGoogleDriveFolder(
          accessToken,
          GOOGLE_DRIVE_FOLDERS.AUDIO,
          rootFolderId
        );

        const imagesFolderId = await ensureGoogleDriveFolder(
          accessToken,
          GOOGLE_DRIVE_FOLDERS.IMAGES,
          rootFolderId
        );

        const tweetsFolderId = await ensureGoogleDriveFolder(
          accessToken,
          GOOGLE_DRIVE_FOLDERS.TWEETS,
          rootFolderId
        );

        // 폴더 ID 저장
        setFolderIds(
          rootFolderId,
          audioFolderId,
          imagesFolderId,
          tweetsFolderId
        );

        // 사용자 인증 상태 업데이트
        setAuthenticated(true, accessToken);
        setError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('Google Drive login error:', error);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      setLoading(false);
      // eslint-disable-next-line no-console
      console.error('Google login error:', error);
    },
    flow: 'implicit',
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  return login;
}

/**
 * Google Drive 로그아웃 Hook
 */
export function useGoogleDriveLogout() {
  const { reset } = useGoogleDriveStore();

  const signOut = useCallback(() => {
    googleLogout();
    reset();
  }, [reset]);

  return signOut;
}

/**
 * Google Drive 파일 업로드 Hook
 */
export function useGoogleDriveUpload() {
  const {
    accessToken,
    audioFolderId,
    imagesFolderId,
    addAudioFile,
    addImageFile,
    setError,
  } = useGoogleDriveStore();

  const uploadFile = useCallback(
    async (
      file: Blob,
      filename: string,
      type: 'audio' | 'image',
      metadata?: Record<string, string>
    ) => {
      if (!accessToken) {
        setError('Not authenticated');
        return null;
      }

      const folderId = type === 'audio' ? audioFolderId : imagesFolderId;
      if (!folderId) {
        setError('Folder not initialized');
        return null;
      }

      try {
        const uploadedFile = await uploadFileToGoogleDrive(
          accessToken,
          file,
          filename,
          folderId,
          metadata
        );

        // 파일 목록에 추가
        if (type === 'audio') {
          addAudioFile(uploadedFile);
        } else {
          addImageFile(uploadedFile);
        }

        setError(null);
        return uploadedFile;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Upload failed';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('File upload error:', error);
        return null;
      }
    },
    [
      accessToken,
      audioFolderId,
      imagesFolderId,
      addAudioFile,
      addImageFile,
      setError,
    ]
  );

  return uploadFile;
}

/**
 * Google Drive 파일 목록 조회 Hook
 */
export function useGoogleDriveList() {
  const {
    accessToken,
    audioFolderId,
    imagesFolderId,
    setAudioFiles,
    setImageFiles,
    setError,
  } = useGoogleDriveStore();

  const loadAudioFiles = useCallback(
    async (pageSize: number = 20, pageToken?: string) => {
      if (!accessToken || !audioFolderId) {
        return null;
      }

      try {
        const result = await listFilesFromGoogleDrive(
          accessToken,
          audioFolderId,
          pageSize,
          pageToken
        );

        setAudioFiles(result.files, pageSize);
        setError(null);
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load files';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('List audio files error:', error);
        return null;
      }
    },
    [accessToken, audioFolderId, setAudioFiles, setError]
  );

  const loadImageFiles = useCallback(
    async (pageSize: number = 20, pageToken?: string) => {
      if (!accessToken || !imagesFolderId) {
        return null;
      }

      try {
        const result = await listFilesFromGoogleDrive(
          accessToken,
          imagesFolderId,
          pageSize,
          pageToken
        );

        setImageFiles(result.files, pageSize);
        setError(null);
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load files';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('List image files error:', error);
        return null;
      }
    },
    [accessToken, imagesFolderId, setImageFiles, setError]
  );

  return { loadAudioFiles, loadImageFiles };
}

/**
 * Google Drive 파일 삭제 Hook
 */
export function useGoogleDriveDelete() {
  const { accessToken, removeAudioFile, removeImageFile, setError } =
    useGoogleDriveStore();

  const deleteFile = useCallback(
    async (fileId: string, type: 'audio' | 'image') => {
      if (!accessToken) {
        setError('Not authenticated');
        return false;
      }

      try {
        await deleteFileFromGoogleDrive(accessToken, fileId);

        // 파일 목록에서 제거
        if (type === 'audio') {
          removeAudioFile(fileId);
        } else {
          removeImageFile(fileId);
        }

        setError(null);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Delete failed';
        setError(message);
        // eslint-disable-next-line no-console
        console.error('File delete error:', error);
        return false;
      }
    },
    [accessToken, removeAudioFile, removeImageFile, setError]
  );

  return deleteFile;
}
