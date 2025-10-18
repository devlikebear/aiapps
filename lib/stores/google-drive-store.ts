/**
 * Google Drive Store
 * Google Drive 인증 및 파일 관리 상태 (Zustand)
 */

import { create } from 'zustand';
import type { GoogleDriveFile } from '@/lib/google-drive/client';

export interface GoogleDriveState {
  // 인증 상태
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;

  // 폴더 상태
  rootFolderId: string | null;
  audioFolderId: string | null;
  imagesFolderId: string | null;
  tweetsFolderId: string | null;

  // 파일 목록
  audioFiles: GoogleDriveFile[];
  imageFiles: GoogleDriveFile[];
  tweetFiles: GoogleDriveFile[];
  totalAudioFiles: number;
  totalImageFiles: number;
  totalTweetFiles: number;

  // 액션
  setAuthenticated: (
    authenticated: boolean,
    token?: string,
    email?: string
  ) => void;
  setAccessToken: (token: string) => void;
  setUserEmail: (email: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFolderIds: (
    root: string,
    audio: string,
    images: string,
    tweets?: string
  ) => void;
  setAudioFiles: (files: GoogleDriveFile[], total: number) => void;
  setImageFiles: (files: GoogleDriveFile[], total: number) => void;
  setTweetFiles: (files: GoogleDriveFile[], total: number) => void;
  addAudioFile: (file: GoogleDriveFile) => void;
  addImageFile: (file: GoogleDriveFile) => void;
  addTweetFile: (file: GoogleDriveFile) => void;
  removeAudioFile: (fileId: string) => void;
  removeImageFile: (fileId: string) => void;
  removeTweetFile: (fileId: string) => void;
  reset: () => void;
}

export const useGoogleDriveStore = create<GoogleDriveState>((set) => ({
  // 초기 상태
  isAuthenticated: false,
  accessToken: null,
  userEmail: null,
  isLoading: false,
  error: null,
  rootFolderId: null,
  audioFolderId: null,
  imagesFolderId: null,
  tweetsFolderId: null,
  audioFiles: [],
  imageFiles: [],
  tweetFiles: [],
  totalAudioFiles: 0,
  totalImageFiles: 0,
  totalTweetFiles: 0,

  // 액션
  setAuthenticated: (authenticated, token, email) =>
    set({
      isAuthenticated: authenticated,
      accessToken: token || null,
      userEmail: email || null,
    }),

  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),

  setUserEmail: (email) =>
    set({
      userEmail: email,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  setFolderIds: (root, audio, images, tweets) =>
    set({
      rootFolderId: root,
      audioFolderId: audio,
      imagesFolderId: images,
      tweetsFolderId: tweets || null,
    }),

  setAudioFiles: (files, total) =>
    set({
      audioFiles: files,
      totalAudioFiles: total,
    }),

  setImageFiles: (files, total) =>
    set({
      imageFiles: files,
      totalImageFiles: total,
    }),

  setTweetFiles: (files, total) =>
    set({
      tweetFiles: files,
      totalTweetFiles: total,
    }),

  addAudioFile: (file) =>
    set((state) => ({
      audioFiles: [file, ...state.audioFiles],
      totalAudioFiles: state.totalAudioFiles + 1,
    })),

  addImageFile: (file) =>
    set((state) => ({
      imageFiles: [file, ...state.imageFiles],
      totalImageFiles: state.totalImageFiles + 1,
    })),

  addTweetFile: (file) =>
    set((state) => ({
      tweetFiles: [file, ...state.tweetFiles],
      totalTweetFiles: state.totalTweetFiles + 1,
    })),

  removeAudioFile: (fileId) =>
    set((state) => ({
      audioFiles: state.audioFiles.filter((f) => f.id !== fileId),
      totalAudioFiles: Math.max(0, state.totalAudioFiles - 1),
    })),

  removeImageFile: (fileId) =>
    set((state) => ({
      imageFiles: state.imageFiles.filter((f) => f.id !== fileId),
      totalImageFiles: Math.max(0, state.totalImageFiles - 1),
    })),

  removeTweetFile: (fileId) =>
    set((state) => ({
      tweetFiles: state.tweetFiles.filter((f) => f.id !== fileId),
      totalTweetFiles: Math.max(0, state.totalTweetFiles - 1),
    })),

  reset: () =>
    set({
      isAuthenticated: false,
      accessToken: null,
      userEmail: null,
      isLoading: false,
      error: null,
      rootFolderId: null,
      audioFolderId: null,
      imagesFolderId: null,
      tweetsFolderId: null,
      audioFiles: [],
      imageFiles: [],
      tweetFiles: [],
      totalAudioFiles: 0,
      totalImageFiles: 0,
      totalTweetFiles: 0,
    }),
}));
