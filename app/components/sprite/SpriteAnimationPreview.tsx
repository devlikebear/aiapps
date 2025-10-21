'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button, RangeSlider } from '@aiapps/ui';

export interface SpriteData {
  imageUrl: string;
  frameColumns: number;
  frameRows: number;
  label: string;
}

interface SpriteAnimationPreviewProps {
  referenceSprite: SpriteData | null;
  generatedSprite: SpriteData | null;
}

export function SpriteAnimationPreview({
  referenceSprite,
  generatedSprite,
}: SpriteAnimationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState(8); // 기본 8 FPS
  const [showReference, setShowReference] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // 현재 표시할 스프라이트 선택
  const currentSprite = showReference ? referenceSprite : generatedSprite;
  const totalFrames = currentSprite
    ? currentSprite.frameColumns * currentSprite.frameRows
    : 0;

  // 애니메이션 재생
  useEffect(() => {
    if (!isPlaying || !currentSprite) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, fps, totalFrames, currentSprite]);

  // Canvas에 현재 프레임 그리기
  useEffect(() => {
    if (!currentSprite || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 이미지 로드
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;

      // 프레임 크기 계산
      const frameWidth = img.width / currentSprite.frameColumns;
      const frameHeight = img.height / currentSprite.frameRows;

      // Canvas 크기 설정
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // 현재 프레임의 위치 계산
      const col = currentFrame % currentSprite.frameColumns;
      const row = Math.floor(currentFrame / currentSprite.frameColumns);

      // 캔버스 클리어
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 프레임 그리기
      ctx.drawImage(
        img,
        col * frameWidth, // source x
        row * frameHeight, // source y
        frameWidth, // source width
        frameHeight, // source height
        0, // dest x
        0, // dest y
        frameWidth, // dest width
        frameHeight // dest height
      );
    };

    img.src = currentSprite.imageUrl;
  }, [currentSprite, currentFrame]);

  // 재생/일시정지 토글
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 처음으로 돌아가기
  const reset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  // 스프라이트 전환
  const toggleSprite = () => {
    setShowReference(!showReference);
    setCurrentFrame(0);
  };

  // 스프라이트가 없을 때
  if (!referenceSprite && !generatedSprite) {
    return (
      <div className="app-card p-8 text-center">
        <p className="text-gray-500">
          스프라이트를 업로드하고 생성하면 애니메이션 미리보기가 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="app-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">🎬 애니메이션 미리보기</h3>
        {referenceSprite && generatedSprite && (
          <Button
            onClick={toggleSprite}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            {showReference ? '생성된 스프라이트 보기' : '참조 스프라이트 보기'}
          </Button>
        )}
      </div>

      {/* 현재 표시 중인 스프라이트 라벨 */}
      {currentSprite && (
        <div className="text-center">
          <div
            className={`inline-block px-4 py-2 rounded-lg font-medium ${
              showReference
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            {currentSprite.label}
          </div>
        </div>
      )}

      {/* Canvas 미리보기 */}
      <div className="relative">
        <div className="bg-gray-800/50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border-2 border-gray-700 rounded-lg"
              style={{
                imageRendering: 'pixelated',
                maxHeight: '400px',
              }}
            />

            {/* 프레임 정보 오버레이 */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
              Frame {currentFrame + 1} / {totalFrames}
            </div>
          </div>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="space-y-4">
        {/* 재생 컨트롤 */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={togglePlayPause}
            variant="primary"
            size="md"
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                일시정지
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                재생
              </>
            )}
          </Button>

          <Button onClick={reset} variant="secondary" size="md" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            처음으로
          </Button>
        </div>

        {/* FPS 조절 */}
        <div className="max-w-md mx-auto">
          <RangeSlider
            label={`재생 속도: ${fps} FPS`}
            min={1}
            max={30}
            step={1}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            helperText="초당 프레임 수 (낮을수록 느림)"
            fullWidth
          />
        </div>

        {/* 프레임 진행 상황 */}
        <div className="relative">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
              style={{
                width: `${((currentFrame + 1) / totalFrames) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 스프라이트 정보 */}
      {currentSprite && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-lg text-sm">
          <div>
            <div className="text-gray-500 text-xs mb-1">프레임 수</div>
            <div className="font-medium">{totalFrames}개</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">레이아웃</div>
            <div className="font-medium">
              {currentSprite.frameColumns} × {currentSprite.frameRows}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">현재 FPS</div>
            <div className="font-medium">{fps}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">상태</div>
            <div className="font-medium">
              {isPlaying ? (
                <span className="text-green-400">▶ 재생 중</span>
              ) : (
                <span className="text-yellow-400">⏸ 일시정지</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
