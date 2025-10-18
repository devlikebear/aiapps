'use client';

import { useState, useEffect } from 'react';
import {
  hasApiKey,
  saveApiKey,
  deleteApiKey,
  getApiKey,
} from '@/lib/api-key/storage';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeySettings({
  isOpen,
  onClose,
}: ApiKeySettingsProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isKeyStored, setIsKeyStored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // 키 존재 여부 확인
      const hasKey = hasApiKey('gemini');
      setIsKeyStored(hasKey);

      // 저장된 키가 있으면 마스킹해서 표시
      if (hasKey) {
        const key = getApiKey('gemini');
        if (key) {
          setGeminiKey(maskApiKey(key));
        }
      }
    }
  }, [isOpen]);

  const maskApiKey = (key: string): string => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const validateGeminiKey = (key: string): boolean => {
    // Gemini API 키 형식 검증 (기본적인 검증)
    // 실제 형식: AIzaSy... (39자)
    if (!key.startsWith('AIzaSy')) {
      setError(
        '유효하지 않은 Gemini API 키 형식입니다. "AIzaSy"로 시작해야 합니다.'
      );
      return false;
    }

    if (key.length < 30) {
      setError('API 키가 너무 짧습니다.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);

    try {
      // 마스킹된 키가 아닌 경우에만 검증
      if (!geminiKey.includes('••••')) {
        if (!validateGeminiKey(geminiKey)) {
          setIsSaving(false);
          return;
        }

        // API 키 저장
        saveApiKey('gemini', geminiKey);
        setIsKeyStored(true);

        // 저장 후 마스킹 표시
        setGeminiKey(maskApiKey(geminiKey));
        setShowKey(false);
      }

      // 성공 알림
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'API 키 저장에 실패했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
      deleteApiKey('gemini');
      setGeminiKey('');
      setIsKeyStored(false);
      setError('');
    }
  };

  const handleLoadKey = () => {
    const key = getApiKey('gemini');
    if (key) {
      setGeminiKey(key);
      setShowKey(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="app-card w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🔑 API 키 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 설명 */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>보안 안내:</strong> API 키는 브라우저의 localStorage에
            암호화되어 저장되며, 서버로 전송되지 않습니다. 모든 AI API 호출은
            브라우저에서 직접 이루어집니다.
          </p>
        </div>

        {/* Gemini API 키 입력 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Gemini API Key
              {isKeyStored && (
                <span className="ml-2 text-xs text-green-400">✓ 저장됨</span>
              )}
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500
                         focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                         pr-24"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {isKeyStored && !showKey && (
                  <button
                    type="button"
                    onClick={handleLoadKey}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600
                             rounded transition-colors"
                    title="키 보기"
                  >
                    보기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600
                           rounded transition-colors"
                  title={showKey ? '숨기기' : '표시'}
                >
                  {showKey ? '숨기기' : '표시'}
                </button>
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Gemini API 키는{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Google AI Studio
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !geminiKey}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                       hover:from-purple-500 hover:to-pink-500
                       disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed
                       text-white font-medium rounded-lg transition-all"
            >
              {isSaving ? '저장 중...' : isKeyStored ? '업데이트' : '저장'}
            </button>

            {isKeyStored && (
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 hover:bg-red-500
                         text-white font-medium rounded-lg transition-colors"
              >
                삭제
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600
                       text-white font-medium rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">💡 사용 팁</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>
              • API 키는 모든 AI 앱(오디오 생성, 아트 생성)에서 공유됩니다
            </li>
            <li>• 브라우저를 닫아도 키는 안전하게 보관됩니다</li>
            <li>• 보안을 위해 주기적으로 키를 갱신하는 것을 권장합니다</li>
            <li>• 사용량과 비용은 Google AI Studio에서 확인할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
