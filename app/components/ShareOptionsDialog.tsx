'use client';

import { useState } from 'react';
import { Share2, Lock, Link2 } from 'lucide-react';

interface ShareOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'public' | 'private') => void;
  isLoading?: boolean;
}

/**
 * 공유 옵션 선택 다이얼로그
 * - 공개 공유: 링크를 가진 모든 사람이 접근 가능
 * - 비공개 저장: Google Drive에만 저장 (접근 제한)
 */
export function ShareOptionsDialog({
  isOpen,
  onClose,
  onSelectOption,
  isLoading = false,
}: ShareOptionsDialogProps) {
  const [selectedOption, setSelectedOption] = useState<
    'public' | 'private' | null
  >(null);

  if (!isOpen) return null;

  const handleSelect = (option: 'public' | 'private') => {
    setSelectedOption(option);
    setTimeout(() => {
      onSelectOption(option);
      setSelectedOption(null);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 mb-6">
          <Share2 className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-bold text-white">공유 방식 선택</h2>
        </div>

        <p className="text-gray-300 text-sm mb-6">
          이 파일을 어떻게 저장할지 선택해주세요:
        </p>

        <div className="space-y-3">
          {/* 공개 공유 옵션 */}
          <button
            onClick={() => handleSelect('public')}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedOption === 'public'
                ? 'border-sky-500 bg-sky-500/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Link2 className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">🔗 공개 공유</p>
                <p className="text-sm text-gray-400">
                  링크를 가진 모든 사람이 접근 가능
                </p>
              </div>
              {selectedOption === 'public' && (
                <div className="flex-shrink-0 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>

          {/* 비공개 저장 옵션 */}
          <button
            onClick={() => handleSelect('private')}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedOption === 'private'
                ? 'border-amber-500 bg-amber-500/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">🔒 비공개 저장</p>
                <p className="text-sm text-gray-400">
                  Google Drive에만 저장 (접근 제한)
                </p>
              </div>
              {selectedOption === 'private' && (
                <div className="flex-shrink-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
