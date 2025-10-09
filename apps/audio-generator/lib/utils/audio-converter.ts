/**
 * PCM 오디오 변환 유틸리티
 */

/**
 * PCM → WAV 변환
 * 16-bit PCM, 48kHz, 스테레오를 WAV 형식으로 변환
 */
export function pcmToWav(
  pcmData: ArrayBuffer,
  sampleRate: number = 48000,
  channels: number = 2,
  bitDepth: number = 16
): ArrayBuffer {
  const dataLength = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV 헤더 작성
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // 파일 크기 - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, channels, true); // num channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * channels * (bitDepth / 8), true); // byte rate
  view.setUint16(32, channels * (bitDepth / 8), true); // block align
  view.setUint16(34, bitDepth, true); // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // PCM 데이터 복사
  const pcmView = new Uint8Array(pcmData);
  const wavView = new Uint8Array(buffer);
  wavView.set(pcmView, 44);

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
 * PCM 오디오 노멀라이징
 * 피크 레벨을 -1dB로 조정
 */
export function normalizePCM(pcmData: ArrayBuffer): ArrayBuffer {
  const view = new Int16Array(pcmData);
  const normalized = new Int16Array(view.length);

  // 최대 진폭 찾기
  let maxAmplitude = 0;
  for (let i = 0; i < view.length; i++) {
    const amplitude = Math.abs(view[i]);
    if (amplitude > maxAmplitude) {
      maxAmplitude = amplitude;
    }
  }

  // 노멀라이제이션 계수 계산 (-1dB = 0.891)
  const targetLevel = 32767 * 0.891; // 16-bit max * 0.891
  const ratio = maxAmplitude > 0 ? targetLevel / maxAmplitude : 1;

  // 노멀라이즈
  for (let i = 0; i < view.length; i++) {
    normalized[i] = Math.round(view[i] * ratio);
  }

  return normalized.buffer;
}

/**
 * 페이드 인/아웃 적용 (루프 처리용)
 */
export function applyFade(
  pcmData: ArrayBuffer,
  fadeInMs: number = 100,
  fadeOutMs: number = 100,
  sampleRate: number = 48000
): ArrayBuffer {
  const view = new Int16Array(pcmData);
  const faded = new Int16Array(view.length);
  faded.set(view);

  const fadeInSamples = Math.floor((fadeInMs / 1000) * sampleRate);
  const fadeOutSamples = Math.floor((fadeOutMs / 1000) * sampleRate);

  // 페이드 인
  for (let i = 0; i < fadeInSamples && i < faded.length; i++) {
    const factor = i / fadeInSamples;
    faded[i] = Math.round(faded[i] * factor);
  }

  // 페이드 아웃
  const startFadeOut = faded.length - fadeOutSamples;
  for (let i = 0; i < fadeOutSamples && startFadeOut + i < faded.length; i++) {
    const factor = 1 - i / fadeOutSamples;
    faded[startFadeOut + i] = Math.round(faded[startFadeOut + i] * factor);
  }

  return faded.buffer;
}

/**
 * WAV를 Blob으로 변환
 */
export function wavToBlob(wavData: ArrayBuffer): Blob {
  return new Blob([wavData], { type: 'audio/wav' });
}

/**
 * Blob 다운로드 트리거
 */
export function downloadAudio(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
