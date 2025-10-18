/**
 * Twitter(X) API Client
 * 트윗 작성 및 게시 기능 제공
 */

export interface TwitterError {
  code: number;
  message: string;
}

export interface TwitterPostResponse {
  data: {
    id: string;
    text: string;
  };
}

/**
 * Twitter API를 통해 트윗 게시
 * 클라이언트 측 OAuth 2.0 User Context 사용
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/integrate/post-tweet
 */
export async function postTweetToTwitter(
  accessToken: string,
  tweetText: string
): Promise<TwitterPostResponse> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: tweetText,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      const errors = errorData.errors as TwitterError[] | undefined;
      const error = errors?.[0];
      throw new Error(
        error?.message || `Failed to post tweet: ${response.statusText}`
      );
    }

    const data = (await response.json()) as TwitterPostResponse;
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error posting tweet to Twitter:', error);
    throw error;
  }
}

/**
 * 사용자 인증 정보 확인
 * 토큰이 유효한지 확인
 */
export async function verifyTwitterAuth(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error verifying Twitter auth:', error);
    return false;
  }
}
