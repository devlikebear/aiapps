'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Wand2, Save, Upload } from 'lucide-react';
import { saveImage } from '@/lib/storage/indexed-db';
import { getApiKey } from '@/lib/api-key/storage';
import { toast } from '@/components/ui/Toast';
import { jobQueue } from '@/lib/queue';

interface StyleTransferProps {
  baseImage: {
    id: string;
    dataUrl: string;
    prompt?: string;
  };
  onClose: () => void;
  onSave: () => void;
}

const EXAMPLE_STYLES = [
  'Transform into the artistic style of Vincent van Gogh with swirling brushstrokes and vibrant colors',
  'Apply a watercolor painting style with soft edges and translucent colors',
  'Convert to anime/manga art style with bold outlines and cel-shading',
  'Transform into a cyberpunk aesthetic with neon colors and futuristic elements',
  'Apply impressionist style with visible brushstrokes and emphasis on light',
  'Convert to pixel art style with 8-bit retro gaming aesthetic',
  'Transform into oil painting style with thick impasto brushwork',
  'Apply minimalist flat design with simple shapes and solid colors',
];

export default function StyleTransfer({
  baseImage,
  onClose,
  onSave,
}: StyleTransferProps) {
  const [stylePrompt, setStylePrompt] = useState('');
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setReferenceImage(result);
      setStylePrompt(
        'Apply the artistic style from the reference image to the base image'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleStyleTransfer = async () => {
    if (!stylePrompt.trim()) {
      toast.error('스타일 프롬프트를 입력해주세요');
      return;
    }

    setIsTransferring(true);

    let jobId: string | null = null;

    try {
      const apiKey = getApiKey('gemini');
      if (!apiKey) {
        toast.error('Gemini API 키가 설정되지 않았습니다');
        setIsTransferring(false);
        return;
      }

      // Build style prompt with reference image if available
      let finalPrompt = stylePrompt;
      if (referenceImage) {
        finalPrompt = `${stylePrompt}. Reference style image is provided.`;
      }

      const job = jobQueue.addImageStyleTransferJob({
        baseImage: baseImage.dataUrl,
        stylePrompt: stylePrompt.trim(),
        ...(referenceImage && { referenceImage }),
      });
      jobId = job.id;
      jobQueue.updateJob(job.id, { status: 'processing', progress: 10 });

      const requestBody = {
        baseImage: baseImage.dataUrl,
        stylePrompt: finalPrompt,
      };

      const response = await fetch('/api/art/style-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply style transfer');
      }

      const data = await response.json();
      const styledDataUrl = `data:image/png;base64,${data.data}`;
      setStyledImage(styledDataUrl);
      toast.success('스타일 전이 완료!');

      if (jobId) {
        jobQueue.updateJob(jobId, {
          status: 'completed',
          progress: 100,
          result: {
            imageData: data.data,
            metadata: data.metadata,
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Style transfer failed:', error);
      if (jobId) {
        jobQueue.updateJob(jobId, {
          status: 'failed',
          progress: 0,
          error:
            error instanceof Error
              ? error.message
              : '스타일 전이에 실패했습니다',
        });
      }
      toast.error(
        error instanceof Error ? error.message : '스타일 전이에 실패했습니다'
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!styledImage) return;

    try {
      const newImage = {
        id: `styled-${Date.now()}`,
        blobUrl: styledImage,
        data: styledImage.split(',')[1],
        metadata: {
          id: `styled-${Date.now()}`,
          style: 'style-transferred',
          prompt: `${baseImage.prompt || 'Original image'} → ${stylePrompt}`,
          width: 1024,
          height: 1024,
          aspectRatio: '1:1' as const,
          createdAt: new Date().toISOString(),
          tags: ['style-transfer', 'edited'],
        },
      };

      await saveImage(newImage);
      toast.success('갤러리에 저장되었습니다');
      onSave();
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save image:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-400" />
              스타일 전이
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              AI로 이미지에 다양한 예술적 스타일을 적용하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Base Image Display */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              원본 이미지
            </h3>
            <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
              <Image
                src={baseImage.dataUrl}
                alt="Base image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Reference Image Upload (Optional) */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              스타일 참조 이미지 (선택사항)
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-purple-500 transition-colors text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium mb-1">
                    스타일 이미지 업로드
                  </p>
                  <p className="text-sm text-gray-500">
                    참조할 스타일의 이미지를 선택하세요
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {referenceImage && (
                <div className="flex-1">
                  <div className="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden border border-purple-500">
                    <Image
                      src={referenceImage}
                      alt="Reference style"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <button
                      onClick={() => {
                        setReferenceImage(null);
                        setStylePrompt('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Style Prompt Input */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              스타일 프롬프트
            </h3>
            <textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              placeholder="원하는 스타일을 자세히 설명해주세요..."
              className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

            {/* Example Styles */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">예시 프롬프트:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_STYLES.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setStylePrompt(example)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    {example.slice(0, 50)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transfer Button */}
          <button
            onClick={handleStyleTransfer}
            disabled={isTransferring || !stylePrompt.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isTransferring ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>스타일 적용 중...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>스타일 적용하기</span>
              </>
            )}
          </button>

          {/* Styled Image Result */}
          {styledImage && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                결과 이미지
              </h3>
              <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-900 rounded-xl overflow-hidden border border-purple-500">
                <Image
                  src={styledImage}
                  alt="Styled result"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveToGallery}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  갤러리에 저장
                </button>
                <button
                  onClick={() => setStyledImage(null)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
