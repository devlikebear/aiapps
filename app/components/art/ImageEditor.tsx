'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Check, Loader2, Download, RotateCcw, Eraser } from 'lucide-react';
import { getApiKey } from '@/lib/api-key/storage';
import { toast } from '@/components/ui/Toast';
import { saveImage } from '@/lib/storage/indexed-db';
import type { StoredImage } from '@/lib/types/storage';

interface ImageEditorProps {
  image: StoredImage;
  onClose: () => void;
  onSave?: () => void;
}

export default function ImageEditor({
  image,
  onClose,
  onSave,
}: ImageEditorProps) {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [maskMode, setMaskMode] = useState(false);
  const [maskData, setMaskData] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const originalImageUrl = `data:image/png;base64,${image.data}`;

  // 마스크 그리기 시작
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!maskMode || !canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  // 마스크 그리기 중
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  // 마스크 그리기 종료
  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const maskDataUrl = canvasRef.current.toDataURL('image/png');
      setMaskData(maskDataUrl);
    }
  };

  // 마스크 초기화
  const clearMask = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setMaskData(null);
      }
    }
  };

  // 이미지 편집 실행
  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      toast.warning('편집 프롬프트를 입력하세요');
      return;
    }

    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      toast.error('API 키가 필요합니다', '설정에서 API 키를 등록해주세요');
      return;
    }

    try {
      setIsEditing(true);

      const requestBody = {
        imageData: originalImageUrl,
        prompt: editPrompt,
        ...(maskData && { mask: maskData }),
      };

      const response = await fetch('/api/art/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Image editing failed');
      }

      const result = await response.json();
      const editedImageBase64 = result.data;

      setEditedImage(editedImageBase64);
      setShowBeforeAfter(true);
      toast.success('이미지 편집 완료!');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to edit image:', error);
      toast.error(
        '이미지 편집 실패',
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다'
      );
    } finally {
      setIsEditing(false);
    }
  };

  // 편집된 이미지 저장
  const handleSaveEdited = async () => {
    if (!editedImage) return;

    try {
      const newImage = {
        id: `edited-${Date.now()}`,
        blobUrl: '', // Will be generated when needed
        data: editedImage,
        metadata: {
          id: `edited-${Date.now()}`,
          style: image.metadata.style,
          prompt: `[Edited] ${editPrompt}`,
          width: image.metadata.width,
          height: image.metadata.height,
          aspectRatio: image.metadata.aspectRatio,
          createdAt: new Date().toISOString(),
        },
      };

      await saveImage(newImage);
      toast.success('편집된 이미지가 갤러리에 저장되었습니다');

      if (onSave) {
        onSave();
      }

      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save edited image:', error);
      toast.error('이미지 저장 실패');
    }
  };

  // 편집된 이미지 다운로드
  const handleDownload = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${editedImage}`;
    link.download = `edited-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 다시 편집
  const handleReset = () => {
    setEditedImage(null);
    setShowBeforeAfter(false);
    setEditPrompt('');
    clearMask();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold">이미지 편집</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editedImage ? '편집 완료' : '이미지를 편집하세요'}
              </p>
            </div>
          </div>

          {/* Actions */}
          {editedImage && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="app-button-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                다시 편집
              </button>
              <button
                onClick={handleDownload}
                className="app-button-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
              <button
                onClick={handleSaveEdited}
                className="app-button flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!editedImage ? (
            /* 편집 모드 */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 원본 이미지 + 마스크 */}
              <div>
                <h3 className="font-medium mb-3">원본 이미지</h3>
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={originalImageUrl}
                    alt="Original"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {/* 마스크 캔버스 오버레이 */}
                  {maskMode && (
                    <canvas
                      ref={canvasRef}
                      width={512}
                      height={512}
                      className="absolute inset-0 cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  )}
                </div>

                {/* 마스크 도구 */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setMaskMode(!maskMode)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      maskMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Eraser className="w-4 h-4 inline mr-2" />
                    {maskMode ? '마스크 모드 켜짐' : '마스크 모드'}
                  </button>
                  {maskMode && (
                    <button
                      onClick={clearMask}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      마스크 지우기
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {maskMode
                    ? '편집할 영역을 드래그하여 마스크를 그리세요'
                    : '특정 영역만 편집하려면 마스크 모드를 켜세요'}
                </p>
              </div>

              {/* 편집 프롬프트 */}
              <div>
                <h3 className="font-medium mb-3">편집 프롬프트</h3>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="예: Add a red hat, Remove the background, Change hair color to blue..."
                  className="w-full h-40 p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    프롬프트 예시
                  </h4>
                  {[
                    'Add sunglasses to the character',
                    'Change the background to a fantasy forest',
                    'Remove the object in the center',
                    'Make the colors more vibrant',
                    'Add magical effects around the character',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setEditPrompt(example)}
                      className="block w-full text-left px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt.trim()}
                  className="app-button w-full mt-6 flex items-center justify-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      편집 중...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      이미지 편집
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Before/After 비교 모드 */
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="font-medium">Before / After 비교</h3>
                <button
                  onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {showBeforeAfter ? '개별 보기' : '비교 보기'}
                </button>
              </div>

              {showBeforeAfter ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Before
                    </p>
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={originalImageUrl}
                        alt="Before"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      After
                    </p>
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={`data:image/png;base64,${editedImage}`}
                        alt="After"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden max-w-2xl mx-auto">
                  <Image
                    src={`data:image/png;base64,${editedImage}`}
                    alt="Edited"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm">
                  <span className="font-medium">편집 프롬프트:</span>{' '}
                  {editPrompt}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
