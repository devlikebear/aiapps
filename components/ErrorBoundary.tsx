'use client';

/**
 * React Error Boundary
 * 예상치 못한 에러를 캐치하고 폴백 UI를 표시
 */

import { Component, ReactNode } from 'react';
import Link from 'next/link';
import { logError } from '@/lib/errors/handler';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // 에러 로깅
    logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'ErrorBoundary',
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 폴백 UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // 기본 폴백 UI
      return (
        <DefaultErrorFallback error={this.state.error} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

/**
 * 기본 에러 폴백 UI
 */
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            문제가 발생했습니다
          </h1>
          <p className="text-gray-400 text-sm">
            예상치 못한 오류로 인해 페이지를 표시할 수 없습니다.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            다시 시도
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            홈으로 이동
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://github.com/devlikebear/aiapps/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
          >
            문제가 지속되면 신고하기 →
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * 페이지별 Error Boundary Wrapper
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="app-card max-w-2xl mx-auto my-12">
          <div className="text-center space-y-6">
            <div className="text-6xl">😵</div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                페이지 로드 실패
              </h2>
              <p className="text-gray-400">
                이 페이지를 표시하는 중 문제가 발생했습니다.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                <p className="text-red-400 text-sm font-mono">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-primary">
                다시 시도
              </button>
              <Link href="/" className="btn-secondary">
                홈으로
              </Link>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * 컴포넌트별 Error Boundary Wrapper
 */
export function ComponentErrorBoundary({
  children,
  name = 'Component',
}: {
  children: ReactNode;
  name?: string;
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-1">
                {name} 로드 실패
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                이 컴포넌트를 표시할 수 없습니다.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-red-400 font-mono mb-3">
                  {error.message}
                </p>
              )}
              <button
                onClick={reset}
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
