/**
 * 미디어 공유 유틸리티
 * SNS 공유 링크 생성 및 공유 기능
 */

export interface ShareData {
  id: string;
  title: string;
  description: string;
  mediaType: 'audio' | 'image';
  url?: string; // 공유 링크 (향후 추가될 예정)
}

/**
 * Twitter/X 공유 URL 생성
 */
export const generateTwitterShareUrl = (data: ShareData): string => {
  const text = `${data.title}\n${data.description}`;
  const params = new URLSearchParams({
    text: text,
    hashtags: 'aiapps,generative-ai,gamedev',
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

/**
 * Instagram 공유 (모바일 앱으로 열기)
 * 참고: Instagram은 웹에서 직접 공유가 제한되어 있으므로,
 * 사용자에게 캡션을 복사하고 앱으로 공유하도록 안내
 */
export const generateInstagramShareText = (data: ShareData): string => {
  return `${data.title}\n${data.description}\n\n#aiapps #generativeai #gamedev`;
};

/**
 * 이메일 공유 링크 생성
 */
export const generateEmailShareUrl = (data: ShareData): string => {
  const subject = `Check out this ${data.mediaType}: ${data.title}`;
  const body = `I wanted to share this with you:\n\n${data.title}\n${data.description}\n\nGenerated with AI Apps`;
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:?${params.toString()}`;
};

/**
 * Direct 링크 복사
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * 미디어 정보를 공유 텍스트로 포맷팅
 */
export const formatShareText = (data: ShareData): string => {
  return `${data.title}\n${data.description}`;
};

/**
 * QR 코드용 데이터 URL 생성 (향후 사용)
 */
export const generateShareableUrl = (data: ShareData): string => {
  if (data.url) {
    return data.url;
  }
  // 향후 백엔드에서 공유 링크 생성 후 반환
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${data.id}`;
};

/**
 * 웹 Share API를 사용한 기본 공유 (모바일)
 */
export const shareViaWebApi = async (data: ShareData): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.description,
      url: data.url || generateShareableUrl(data),
    });
    return true;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      // eslint-disable-next-line no-console
      console.error('Share failed:', err);
    }
    return false;
  }
};
