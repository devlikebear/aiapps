/**
 * 오디오 포맷 변환 및 최적화 유틸리티
 */

import type {
  AudioFormat,
  AudioConversionRequest,
  AudioConversionResponse,
  AudioCompressionOptions,
} from './types';
import { AUDIO_FORMAT_INFO } from './types';

/**
 * PCM 데이터를 WAV 포맷으로 변환
 */
export function pcmToWav(
  pcmData: ArrayBuffer,
  sampleRate: number = 48000,
  channels: number = 2,
  bitDepth: number = 16
): ArrayBuffer {
  const dataLength = pcmData.byteLength;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // WAV 헤더 작성
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true); // 파일 크기 - 8
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (PCM: 16)
  view.setUint16(20, 1, true); // AudioFormat (PCM: 1)
  view.setUint16(22, channels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, (sampleRate * channels * bitDepth) / 8, true); // ByteRate
  view.setUint16(32, (channels * bitDepth) / 8, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // SubChunk2Size

  // PCM 데이터 복사
  const pcmView = new Uint8Array(pcmData);
  const wavView = new Uint8Array(buffer);
  wavView.set(pcmView, headerLength);

  return buffer;
}

/**
 * DataView에 문자열 쓰기
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * 오디오 데이터 정규화 (볼륨 정규화)
 */
export function normalizeAudio(
  pcmData: ArrayBuffer,
  targetLevel: number = 0.9
): ArrayBuffer {
  const view = new DataView(pcmData);
  const samples = pcmData.byteLength / 2; // 16-bit samples

  // 최대 진폭 찾기
  let maxAmplitude = 0;
  for (let i = 0; i < samples; i++) {
    const sample = view.getInt16(i * 2, true);
    maxAmplitude = Math.max(maxAmplitude, Math.abs(sample));
  }

  // 정규화 계수 계산
  const normalizeRatio = (targetLevel * 32767) / maxAmplitude;

  // 정규화 적용
  const normalized = new ArrayBuffer(pcmData.byteLength);
  const normalizedView = new DataView(normalized);

  for (let i = 0; i < samples; i++) {
    const sample = view.getInt16(i * 2, true);
    const normalizedSample = Math.round(sample * normalizeRatio);
    normalizedView.setInt16(i * 2, normalizedSample, true);
  }

  return normalized;
}

/**
 * 무음 제거 (시작과 끝)
 */
export function trimSilence(
  pcmData: ArrayBuffer,
  threshold: number = 0.01
): ArrayBuffer {
  const view = new DataView(pcmData);
  const samples = pcmData.byteLength / 2;

  // 시작 무음 찾기
  let startIndex = 0;
  for (let i = 0; i < samples; i++) {
    const sample = Math.abs(view.getInt16(i * 2, true)) / 32768;
    if (sample > threshold) {
      startIndex = i;
      break;
    }
  }

  // 끝 무음 찾기
  let endIndex = samples - 1;
  for (let i = samples - 1; i >= 0; i--) {
    const sample = Math.abs(view.getInt16(i * 2, true)) / 32768;
    if (sample > threshold) {
      endIndex = i;
      break;
    }
  }

  // 트림된 데이터 생성
  const trimmedLength = (endIndex - startIndex + 1) * 2;
  const trimmed = new ArrayBuffer(trimmedLength);
  const trimmedView = new Uint8Array(trimmed);
  const sourceView = new Uint8Array(pcmData, startIndex * 2, trimmedLength);
  trimmedView.set(sourceView);

  return trimmed;
}

/**
 * 페이드 인/아웃 적용
 */
export function applyFade(
  pcmData: ArrayBuffer,
  fadeInDuration: number = 0,
  fadeOutDuration: number = 0,
  sampleRate: number = 48000
): ArrayBuffer {
  const view = new DataView(pcmData);
  const samples = pcmData.byteLength / 2;

  const fadeInSamples = Math.floor(fadeInDuration * sampleRate);
  const fadeOutSamples = Math.floor(fadeOutDuration * sampleRate);

  const result = new ArrayBuffer(pcmData.byteLength);
  const resultView = new DataView(result);

  for (let i = 0; i < samples; i++) {
    const sample = view.getInt16(i * 2, true);
    let fadedSample = sample;

    // 페이드 인
    if (i < fadeInSamples) {
      const fadeRatio = i / fadeInSamples;
      fadedSample = Math.round(sample * fadeRatio);
    }

    // 페이드 아웃
    if (i > samples - fadeOutSamples) {
      const fadeRatio = (samples - i) / fadeOutSamples;
      fadedSample = Math.round(sample * fadeRatio);
    }

    resultView.setInt16(i * 2, fadedSample, true);
  }

  return result;
}

/**
 * 샘플레이트 변환 (리샘플링)
 */
export function resample(
  pcmData: ArrayBuffer,
  originalSampleRate: number,
  targetSampleRate: number,
  channels: number = 2
): ArrayBuffer {
  if (originalSampleRate === targetSampleRate) {
    return pcmData;
  }

  const view = new DataView(pcmData);
  const originalSamples = pcmData.byteLength / 2 / channels;
  const targetSamples = Math.floor(
    (originalSamples * targetSampleRate) / originalSampleRate
  );

  const result = new ArrayBuffer(targetSamples * 2 * channels);
  const resultView = new DataView(result);

  const ratio = originalSamples / targetSamples;

  for (let i = 0; i < targetSamples; i++) {
    const originalIndex = i * ratio;
    const index0 = Math.floor(originalIndex);
    const index1 = Math.min(index0 + 1, originalSamples - 1);
    const fraction = originalIndex - index0;

    for (let ch = 0; ch < channels; ch++) {
      const sample0 = view.getInt16((index0 * channels + ch) * 2, true);
      const sample1 = view.getInt16((index1 * channels + ch) * 2, true);

      // 선형 보간
      const interpolated = Math.round(sample0 + (sample1 - sample0) * fraction);
      resultView.setInt16((i * channels + ch) * 2, interpolated, true);
    }
  }

  return result;
}

/**
 * 스테레오 → 모노 변환
 */
export function stereoToMono(pcmData: ArrayBuffer): ArrayBuffer {
  const view = new DataView(pcmData);
  const stereoSamples = pcmData.byteLength / 4; // 2 channels, 16-bit

  const mono = new ArrayBuffer(stereoSamples * 2);
  const monoView = new DataView(mono);

  for (let i = 0; i < stereoSamples; i++) {
    const left = view.getInt16(i * 4, true);
    const right = view.getInt16(i * 4 + 2, true);
    const monoSample = Math.round((left + right) / 2);
    monoView.setInt16(i * 2, monoSample, true);
  }

  return mono;
}

/**
 * 오디오 압축 적용
 */
export async function compressAudio(
  wavData: ArrayBuffer,
  options: AudioCompressionOptions
): Promise<{ data: ArrayBuffer; metadata: { compressionRatio: number } }> {
  // preset은 향후 확장을 위해 사용 가능
  // const preset = COMPRESSION_PRESETS[options.quality];

  let processedData = wavData;

  // 샘플레이트 변경
  if (options.sampleRate && options.sampleRate !== 48000) {
    processedData = resample(
      processedData,
      48000,
      options.sampleRate,
      options.channels || 2
    );
  }

  // 모노 변환
  if (options.channels === 1) {
    processedData = stereoToMono(processedData);
  }

  // 압축 비율 계산
  const compressionRatio =
    ((wavData.byteLength - processedData.byteLength) / wavData.byteLength) *
    100;

  return {
    data: processedData,
    metadata: {
      compressionRatio: Math.round(compressionRatio * 100) / 100,
    },
  };
}

/**
 * 오디오 포맷 변환 (클라이언트 사이드)
 */
export async function convertAudio(
  audioData: ArrayBuffer,
  sourceFormat: AudioFormat,
  targetFormat: AudioFormat,
  request: AudioConversionRequest
): Promise<AudioConversionResponse> {
  let processedData = audioData;
  const originalSize = audioData.byteLength;

  // WAV가 아니면 먼저 WAV로 디코딩 필요 (브라우저 AudioContext 사용)
  if (sourceFormat !== 'wav') {
    // 실제로는 AudioContext.decodeAudioData 사용해야 함
    // 여기서는 간단화를 위해 WAV로 가정
  }

  // 정규화
  if (request.normalize) {
    processedData = normalizeAudio(processedData);
  }

  // 무음 제거
  if (request.trimSilence) {
    processedData = trimSilence(processedData);
  }

  // 페이드 적용
  if (request.fadeIn || request.fadeOut) {
    processedData = applyFade(
      processedData,
      request.fadeIn || 0,
      request.fadeOut || 0
    );
  }

  // 샘플레이트 변환
  if (request.sampleRate) {
    processedData = resample(processedData, 48000, request.sampleRate);
  }

  // 타겟 포맷으로 변환
  let finalData: ArrayBuffer;
  let finalFormat: AudioFormat;

  if (targetFormat === 'wav') {
    finalData = pcmToWav(processedData);
    finalFormat = 'wav';
  } else {
    // MP3, OGG 등은 서버 사이드 변환 필요하거나 브라우저 API 사용
    // 여기서는 WAV로 반환 (실제로는 FFmpeg 등 필요)
    finalData = pcmToWav(processedData);
    finalFormat = 'wav';
  }

  const convertedSize = finalData.byteLength;
  const compressionRatio =
    ((originalSize - convertedSize) / originalSize) * 100;

  return {
    audio: {
      data: finalData,
      format: finalFormat,
    },
    metadata: {
      originalSize,
      convertedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      format: finalFormat,
      sampleRate: request.sampleRate || 48000,
      channels: 2,
      bitrate: request.bitrate,
    },
  };
}

/**
 * 오디오 메타데이터 추출
 */
export function extractAudioMetadata(wavData: ArrayBuffer): {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  duration: number;
  fileSize: number;
} {
  const view = new DataView(wavData);

  // WAV 헤더 파싱
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitDepth = view.getUint16(34, true);
  const dataSize = view.getUint32(40, true);

  const duration = dataSize / (sampleRate * channels * (bitDepth / 8));

  return {
    sampleRate,
    channels,
    bitDepth,
    duration,
    fileSize: wavData.byteLength,
  };
}

/**
 * AudioBuffer를 WAV로 변환 (브라우저 AudioContext용)
 */
export function audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const length = audioBuffer.length * numberOfChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // WAV 헤더
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true);
  view.setUint16(32, numberOfChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // 오디오 데이터 인터리브
  const channels: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return buffer;
}

/**
 * Blob을 ArrayBuffer로 변환
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * ArrayBuffer를 Blob으로 변환
 */
export function arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string): Blob {
  return new Blob([buffer], { type: mimeType });
}

/**
 * 오디오 다운로드
 */
export function downloadAudio(
  buffer: ArrayBuffer,
  filename: string,
  format: AudioFormat
): void {
  const mimeType = AUDIO_FORMAT_INFO[format].mimeType;
  const blob = arrayBufferToBlob(buffer, mimeType);
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename + AUDIO_FORMAT_INFO[format].extension;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
