/**
 * Google Drive Delete API
 * Google Drive 파일 삭제
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/google-drive/delete?fileId=xxx&accessToken=xxx
 * Google Drive에서 파일 삭제
 *
 * 쿼리 파라미터:
 * - fileId: 파일 ID (필수)
 * - accessToken: Google Drive API 액세스 토큰 (필수)
 *
 * 응답:
 * { success: true }
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 쿼리 파라미터 추출
    const fileId = searchParams.get('fileId');
    const accessToken = searchParams.get('accessToken');

    // 입력 검증
    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
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
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      // eslint-disable-next-line no-console
      console.error('Google Drive delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete file from Google Drive' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
