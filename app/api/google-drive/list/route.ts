/**
 * Google Drive List API
 * Google Drive 폴더의 파일 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/google-drive/list?folderId=xxx&pageSize=20&pageToken=xxx
 * Google Drive 폴더의 파일 목록 조회
 *
 * 쿼리 파라미터:
 * - folderId: 폴더 ID (필수)
 * - pageSize: 페이지 크기 (기본값: 20)
 * - pageToken: 페이지 토큰
 * - accessToken: Google Drive API 액세스 토큰 (필수)
 *
 * 응답:
 * {
 *   files: [
 *     {
 *       id: string,
 *       name: string,
 *       mimeType: string,
 *       size: string,
 *       createdTime: string,
 *       modifiedTime: string,
 *       webViewLink: string
 *     }
 *   ],
 *   nextPageToken?: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 쿼리 파라미터 추출
    const folderId = searchParams.get('folderId');
    const pageSize = searchParams.get('pageSize') || '20';
    const pageToken = searchParams.get('pageToken');
    const accessToken = searchParams.get('accessToken');

    // 입력 검증
    if (!folderId) {
      return NextResponse.json(
        { error: 'folderId is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'accessToken is required' },
        { status: 401 }
      );
    }

    // Google Drive API 호출
    const query = `'${folderId}' in parents and trashed=false`;
    const params = new URLSearchParams({
      q: query,
      spaces: 'drive',
      fields:
        'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties),nextPageToken',
      pageSize,
      orderBy: 'createdTime desc',
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      // eslint-disable-next-line no-console
      console.error('Google Drive list error:', error);
      return NextResponse.json(
        { error: 'Failed to list files from Google Drive' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
