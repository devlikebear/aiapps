'use client';

import { useState } from 'react';
import {
  X,
  Copy,
  Mail,
  Twitter,
  Instagram,
  AlertCircle,
  Check,
  FolderOpen,
  Lock,
  Link2,
} from 'lucide-react';
import {
  generateTwitterShareUrl,
  generateEmailShareUrl,
  generateGoogleDriveShareUrl,
  formatGoogleDriveShareText,
  copyToClipboard,
  type ShareData,
} from '@/lib/utils/share';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData;
}

export default function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);

  if (!isOpen) return null;

  const handleDirectLinkCopy = async () => {
    const text = formatGoogleDriveShareText(data);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstagramCopy = async () => {
    const text = formatGoogleDriveShareText(data);
    const success = await copyToClipboard(text);
    if (success) {
      setInstagramCopied(true);
      setTimeout(() => setInstagramCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const url = generateTwitterShareUrl(data);
    window.open(url, 'twitter-share', 'width=550,height=420');
  };

  const handleInstagramShare = () => {
    handleInstagramCopy();
  };

  const handleEmailShare = () => {
    const url = generateEmailShareUrl(data);
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">공유하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* 공유 상태 배지 */}
          {data.isPubliclyShared !== undefined && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                data.isPubliclyShared
                  ? 'bg-sky-500/20 border border-sky-500/50'
                  : 'bg-amber-500/20 border border-amber-500/50'
              }`}
            >
              {data.isPubliclyShared ? (
                <>
                  <Link2 className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-medium text-sky-300">
                    🔗 공개 공유 - 링크를 가진 모든 사람이 접근 가능
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">
                    🔒 비공개 저장 - Google Drive에만 저장됨
                  </span>
                </>
              )}
            </div>
          )}

          {/* 미디어 정보 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">제목</p>
            <p className="text-white font-semibold truncate">{data.title}</p>
            <p className="text-sm text-gray-400 mt-3 mb-1">설명</p>
            <p className="text-gray-300 text-sm line-clamp-2">
              {data.description}
            </p>
          </div>

          {/* SNS 공유 옵션 */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-300">SNS에 공유</p>

            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Twitter className="w-5 h-5" />
              <span>Twitter에 공유</span>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagramShare}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                instagramCopied
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gradient-to-r from-pink-600 via-red-600 to-yellow-600 hover:from-pink-700 hover:via-red-700 hover:to-yellow-700 text-white'
              }`}
            >
              {instagramCopied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>캡션 복사됨!</span>
                </>
              ) : (
                <>
                  <Instagram className="w-5 h-5" />
                  <span>Instagram에 공유</span>
                </>
              )}
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Mail className="w-5 h-5" />
              <span>이메일로 보내기</span>
            </button>

            {/* Google Drive */}
            {data.googleDriveFileId && (
              <button
                onClick={() => {
                  const driveUrl = generateGoogleDriveShareUrl(
                    data.googleDriveFileId!
                  );
                  window.open(driveUrl, 'google-drive-share');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-200 font-medium"
              >
                <FolderOpen className="w-5 h-5" />
                <span>Google Drive에서 열기</span>
              </button>
            )}
          </div>

          {/* Direct Link 복사 */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-300">
              직접 링크 복사
            </p>
            <button
              onClick={handleDirectLinkCopy}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                copied
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>텍스트 복사</span>
                </>
              )}
            </button>
          </div>

          {/* Instagram 안내 */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              Instagram 캡션을 복사했습니다. Instagram 앱에서 직접 게시물을
              만들고 붙여넣기하세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
