'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Sparkles, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { saveImage } from '@/lib/storage/indexed-db';
import { getApiKey } from '@/lib/api-key/storage';
import { toast } from '@/components/ui/Toast';
import { jobQueue } from '@/lib/queue';

interface ImageComposerProps {
  initialImages?: Array<{ id: string; dataUrl: string }>;
  onClose: () => void;
  onSave: () => void;
}

const EXAMPLE_PROMPTS = [
  'Create a professional product photo combining these items',
  'Combine these elements into a cohesive scene',
  'Merge the subjects from these images into one composition',
  'Create a collage-style artwork from these images',
  'Blend these images into a surreal landscape',
];

export default function ImageComposer({
  initialImages = [],
  onClose,
  onSave,
}: ImageComposerProps) {
  const [selectedImages, setSelectedImages] =
    useState<Array<{ id: string; dataUrl: string }>>(initialImages);
  const [composePrompt, setComposePrompt] = useState('');
  const [composedImage, setComposedImage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleCompose = async () => {
    if (selectedImages.length < 2) {
      toast.error('최소 2개의 이미지가 필요합니다');
      return;
    }

    if (!composePrompt.trim()) {
      toast.error('합성 프롬프트를 입력해주세요');
      return;
    }

    let jobId: string | null = null;

    try {
      setIsComposing(true);

      const apiKey = getApiKey('gemini');
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다');
      }

      const job = jobQueue.addImageComposeJob({
        images: selectedImages.map((img) => img.dataUrl),
        prompt: composePrompt.trim(),
      });
      jobId = job.id;
      jobQueue.updateJob(job.id, { status: 'processing', progress: 10 });

      const requestBody = {
        images: selectedImages.map((img) => img.dataUrl),
        prompt: composePrompt.trim(),
      };

      const response = await fetch('/api/art/compose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 합성 실패');
      }

      const data = await response.json();
      const composedDataUrl = `data:image/png;base64,${data.data}`;
      setComposedImage(composedDataUrl);
      toast.success('이미지 합성 완료!');

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
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Image composition error:', err);
      if (jobId && err instanceof Error) {
        jobQueue.updateJob(jobId, {
          status: 'failed',
          progress: 0,
          error: err.message,
        });
      }
      toast.error(
        err instanceof Error
          ? err.message
          : '이미지 합성 중 오류가 발생했습니다'
      );
    } finally {
      setIsComposing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!composedImage) return;

    try {
      // Create image object
      const newImage = {
        id: `composed-${Date.now()}`,
        blobUrl: composedImage,
        data: composedImage.split(',')[1], // base64 data without prefix
        metadata: {
          id: `composed-${Date.now()}`,
          style: 'composed',
          prompt: composePrompt,
          width: 1024,
          height: 1024,
          aspectRatio: '1:1',
          createdAt: new Date().toISOString(),
          tags: ['composed', 'multi-image'],
        },
      };

      await saveImage(newImage);
      toast.success('갤러리에 저장되었습니다');
      onSave();
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save error:', err);
      toast.error('갤러리 저장 실패');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">이미지 합성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                선택된 이미지 ({selectedImages.length}/10)
              </label>
              <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" />
                이미지 추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  className="hidden"
                  disabled={selectedImages.length >= 10}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {selectedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 group"
                >
                  <Image
                    src={image.dataUrl}
                    alt={`Source ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
                    #{index + 1}
                  </div>
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}

              {selectedImages.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <ImageIcon className="w-12 h-12 mb-3" />
                  <p className="text-sm">이미지를 추가해주세요</p>
                  <p className="text-xs mt-1">최소 2개, 최대 10개</p>
                </div>
              )}
            </div>
          </div>

          {/* Compose Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              합성 프롬프트
            </label>
            <textarea
              value={composePrompt}
              onChange={(e) => setComposePrompt(e.target.value)}
              placeholder="이미지들을 어떻게 합성할지 설명해주세요..."
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Example Prompts */}
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setComposePrompt(prompt)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-xs transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Composed Image */}
          {composedImage && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                합성 결과
              </label>
              <div className="relative rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={composedImage}
                  alt="Composed"
                  width={1024}
                  height={1024}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          {!composedImage ? (
            <button
              onClick={handleCompose}
              disabled={
                isComposing ||
                selectedImages.length < 2 ||
                !composePrompt.trim()
              }
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isComposing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  합성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  이미지 합성
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSaveToGallery}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              갤러리에 저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
