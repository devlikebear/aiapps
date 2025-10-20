'use client';

import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { Button } from '@aiapps/ui';
import { SpriteReferenceUploader } from '@/components/sprite/SpriteReferenceUploader';
import { CharacterImageUploader } from '@/components/sprite/CharacterImageUploader';
import { SpriteAnimationPreview } from '@/components/sprite/SpriteAnimationPreview';
import type { SpriteReference } from '@/components/sprite/SpriteReferenceUploader';
import type { CharacterImage } from '@/components/sprite/CharacterImageUploader';
import type { SpriteData } from '@/components/sprite/SpriteAnimationPreview';
import { getApiKey } from '@/lib/api-key/storage';

export default function SpriteGeneratorPage() {
  // State
  const [referenceSprite, setReferenceSprite] = useState<SpriteReference | null>(
    null
  );
  const [characterImage, setCharacterImage] = useState<CharacterImage | null>(
    null
  );
  const [generatedSpriteUrl, setGeneratedSpriteUrl] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  // 생성 가능 여부
  const canGenerate = referenceSprite && characterImage;

  // 스프라이트 생성 핸들러
  const handleGenerate = async () => {
    if (!canGenerate) {
      setError('참조 스프라이트와 캐릭터 이미지를 모두 업로드해주세요');
      return;
    }

    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      setError(
        'API 키가 설정되지 않았습니다. 헤더의 설정 버튼에서 API 키를 등록해주세요.'
      );
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('referenceSprite', referenceSprite.file);
      formData.append('characterImage', characterImage.file);
      formData.append('frameColumns', referenceSprite.frameColumns.toString());
      formData.append('frameRows', referenceSprite.frameRows.toString());
      formData.append('apiKey', apiKey);

      // API 호출
      const response = await fetch('/api/sprite/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '스프라이트 생성 실패');
      }

      // 생성된 이미지 받기
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedSpriteUrl(url);

      setError('');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '스프라이트 생성 중 오류가 발생했습니다';
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('Sprite generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    if (!generatedSpriteUrl) return;

    const link = document.createElement('a');
    link.href = generatedSpriteUrl;
    link.download = `sprite-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 미리보기용 스프라이트 데이터
  const referenceSpriteData: SpriteData | null = referenceSprite
    ? {
        imageUrl: referenceSprite.preview,
        frameColumns: referenceSprite.frameColumns,
        frameRows: referenceSprite.frameRows,
        label: '📸 참조 스프라이트',
      }
    : null;

  const generatedSpriteData: SpriteData | null =
    generatedSpriteUrl && referenceSprite
      ? {
          imageUrl: generatedSpriteUrl,
          frameColumns: referenceSprite.frameColumns,
          frameRows: referenceSprite.frameRows,
          label: '✨ 생성된 스프라이트',
        }
      : null;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🎮 AI 애니메이션 스프라이트 생성기
          </h1>
          <p className="text-gray-400">
            참조 애니메이션에서 캐릭터를 교체하여 새로운 스프라이트를 생성하세요
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 참조 스프라이트 업로드 */}
          <div className="app-card p-6">
            <SpriteReferenceUploader
              value={referenceSprite}
              onChange={setReferenceSprite}
              disabled={isGenerating}
            />
          </div>

          {/* 캐릭터 이미지 업로드 */}
          <div className="app-card p-6">
            <CharacterImageUploader
              value={characterImage}
              onChange={setCharacterImage}
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* 생성 버튼 */}
        <div className="app-card p-6">
          <div className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
              <p className="font-medium mb-2">📌 작동 방식:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>참조 스프라이트의 애니메이션 패턴을 분석합니다</li>
                <li>업로드한 캐릭터 이미지를 각 프레임에 적용합니다</li>
                <li>원본과 동일한 구조의 새로운 스프라이트를 생성합니다</li>
                <li>애니메이션 미리보기로 결과를 확인할 수 있습니다</li>
              </ol>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              variant="primary"
              size="lg"
              fullWidth
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  스프라이트 생성하기
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 미리보기 섹션 */}
        {(referenceSpriteData || generatedSpriteData) && (
          <SpriteAnimationPreview
            referenceSprite={referenceSpriteData}
            generatedSprite={generatedSpriteData}
          />
        )}

        {/* 생성된 스프라이트 다운로드 */}
        {generatedSpriteUrl && (
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">✨ 생성 완료!</h3>
              <Button
                onClick={handleDownload}
                variant="primary"
                size="md"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="w-5 h-5" />
                스프라이트 다운로드
              </Button>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-300">
              <p>
                ✅ 스프라이트가 성공적으로 생성되었습니다! 위의 미리보기에서
                애니메이션을 확인하고, 다운로드 버튼을 눌러 저장하세요.
              </p>
            </div>
          </div>
        )}

        {/* 사용 가이드 */}
        <div className="app-card p-6">
          <h3 className="text-lg font-bold mb-4">💡 사용 팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium mb-2 text-purple-400">
                📸 참조 스프라이트
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>걷기, 달리기 등의 애니메이션 동작</li>
                <li>프레임이 정확히 정렬된 스프라이트 시트</li>
                <li>프레임 수와 배치를 정확히 입력하세요</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium mb-2 text-pink-400">
                🎭 캐릭터 이미지
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>배경이 투명한 PNG 권장</li>
                <li>캐릭터가 명확하게 보이는 이미지</li>
                <li>정면 또는 측면 각도 권장</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-400">
                🎬 애니메이션 미리보기
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>참조와 생성 결과를 전환하며 비교</li>
                <li>재생 속도(FPS)를 조절하여 확인</li>
                <li>각 프레임을 일시정지하여 세밀하게 검토</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium mb-2 text-green-400">
                💾 다운로드 및 활용
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>PNG 형식으로 다운로드</li>
                <li>게임 엔진에서 바로 사용 가능</li>
                <li>프레임 설정값을 기억해두세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
