/**
 * Twitter Store
 * Twitter(X) 인증 상태 및 게시 기능 (Zustand)
 */

import { create } from 'zustand';

export interface TwitterState {
  // 인증 상태
  isAuthenticated: boolean;
  accessToken: string | null;
  userName: string | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  setAuthenticated: (
    authenticated: boolean,
    token?: string,
    userName?: string
  ) => void;
  setAccessToken: (token: string) => void;
  setUserName: (name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTwitterStore = create<TwitterState>((set) => ({
  // 초기 상태
  isAuthenticated: false,
  accessToken: null,
  userName: null,
  isLoading: false,
  error: null,

  // 액션
  setAuthenticated: (authenticated, token, userName) =>
    set({
      isAuthenticated: authenticated,
      accessToken: token || null,
      userName: userName || null,
    }),

  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),

  setUserName: (name) =>
    set({
      userName: name,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  reset: () =>
    set({
      isAuthenticated: false,
      accessToken: null,
      userName: null,
      isLoading: false,
      error: null,
    }),
}));
