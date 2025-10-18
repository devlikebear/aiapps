/**
 * Google Drive Login Button Component
 * Google Drive 로그인/로그아웃 버튼
 */

'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useGoogleDriveStore } from '@/lib/stores/google-drive-store';
import {
  useGoogleDriveLogin,
  useGoogleDriveLogout,
} from '@/lib/google-drive/hooks';
import { LogIn, LogOut, Cloud } from 'lucide-react';

export interface GoogleDriveLoginButtonProps {
  className?: string;
  variant?: 'button' | 'inline';
}

/**
 * 로그인 버튼 (비인증 상태)
 */
function LoginButton({
  className,
  variant = 'button',
}: GoogleDriveLoginButtonProps) {
  const login = useGoogleDriveLogin();

  if (variant === 'inline') {
    return (
      <button
        onClick={() => login()}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors ${className || ''}`}
      >
        <LogIn size={16} />
        Google Drive
      </button>
    );
  }

  return (
    <button
      onClick={() => login()}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${className || ''}`}
    >
      <Cloud size={20} />
      Google Drive에 저장
    </button>
  );
}

/**
 * 로그아웃 버튼 (인증 상태)
 */
function LogoutButton({
  className,
  variant = 'button',
}: GoogleDriveLoginButtonProps) {
  const signOut = useGoogleDriveLogout();

  if (variant === 'inline') {
    return (
      <button
        onClick={() => signOut()}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors ${className || ''}`}
      >
        <LogOut size={16} />
        로그아웃
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut()}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors ${className || ''}`}
    >
      <LogOut size={20} />
      로그아웃
    </button>
  );
}

/**
 * 사용자 정보 표시
 */
function UserInfo() {
  const { isAuthenticated, userEmail } = useGoogleDriveStore();

  if (!isAuthenticated || !userEmail) return null;

  return (
    <div className="text-sm text-gray-400">
      로그인됨: <span className="text-gray-200 font-medium">{userEmail}</span>
    </div>
  );
}

/**
 * Google Drive 로그인/로그아웃 컴포넌트
 */
export function GoogleDriveLoginContainer({
  className,
  variant = 'button',
}: GoogleDriveLoginButtonProps) {
  const { isAuthenticated, isLoading, error } = useGoogleDriveStore();

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border border-gray-600 border-t-blue-500" />
            연결 중...
          </div>
        ) : isAuthenticated ? (
          <LogoutButton variant={variant} />
        ) : (
          <LoginButton variant={variant} />
        )}
      </div>

      {isAuthenticated && <UserInfo />}

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Google OAuth Provider로 감싸진 컴포넌트
 */
export function GoogleDriveLogin({
  className,
  variant = 'button',
}: GoogleDriveLoginButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // eslint-disable-next-line no-console
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
    return (
      <div className="text-red-400 text-sm">
        Google Client ID가 설정되지 않았습니다.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleDriveLoginContainer className={className} variant={variant} />
    </GoogleOAuthProvider>
  );
}
