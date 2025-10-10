/**
 * Audio Format Conversion API
 * 오디오 포맷 변환 및 최적화
 */

import { NextRequest, NextResponse } from 'next/server';
import type { AudioConversionRequest } from '@/lib/audio/types';
import { convertAudio, compressAudio } from '@/lib/audio/converter';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 파일 가져오기
    const audioFile = formData.get('audio') as File;
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 변환 옵션 파싱
    const optionsJson = formData.get('options') as string;
    if (!optionsJson) {
      return NextResponse.json(
        { error: 'No conversion options provided' },
        { status: 400 }
      );
    }

    const options: AudioConversionRequest = JSON.parse(optionsJson);

    // 파일을 ArrayBuffer로 읽기
    const arrayBuffer = await audioFile.arrayBuffer();

    // 오디오 변환
    const result = await convertAudio(
      arrayBuffer,
      options.sourceFormat,
      options.targetFormat,
      options
    );

    // 압축 적용 (품질 옵션이 있는 경우)
    let finalData = result.audio.data;
    let compressionRatio = result.metadata.compressionRatio;

    if (options.quality) {
      const compressed = await compressAudio(finalData, {
        quality: options.quality,
        bitrate: options.bitrate,
        sampleRate: options.sampleRate,
        channels: 2,
      });
      finalData = compressed.data;
      compressionRatio = compressed.metadata.compressionRatio;
    }

    // Base64 인코딩
    const base64Audio = Buffer.from(finalData).toString('base64');

    return NextResponse.json({
      success: true,
      audioBase64: base64Audio,
      metadata: {
        ...result.metadata,
        compressionRatio,
        convertedSize: finalData.byteLength,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Audio conversion error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Audio conversion failed',
      },
      { status: 500 }
    );
  }
}
