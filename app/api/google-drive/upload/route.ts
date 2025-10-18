/**
 * Google Drive Upload API
 * 클라이언트에서 Google Drive에 파일 업로드
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/google-drive/upload
 * 파일을 Google Drive에 업로드
 *
 * 요청 바디:
 * {
 *   file: Blob,
 *   filename: string,
 *   type: 'audio' | 'image',
 *   metadata?: Record<string, string>
 * }
 *
 * 응답:
 * {
 *   id: string,
 *   name: string,
 *   size: string,
 *   webViewLink: string,
 *   createdTime: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // FormData에서 데이터 추출
    const file = formData.get('file') as Blob;
    const filename = formData.get('filename') as string;
    const type = formData.get('type') as 'audio' | 'image';
    const metadataStr = formData.get('metadata') as string;
    const accessToken = formData.get('accessToken') as string;
    const parentFolderId = formData.get('parentFolderId') as string;

    // 입력 검증
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'audio' && type !== 'image')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    if (!parentFolderId) {
      return NextResponse.json(
        { error: 'Parent folder ID is required' },
        { status: 400 }
      );
    }

    // 메타데이터 파싱
    let metadata: Record<string, string> | undefined;
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch (_error) {
        return NextResponse.json(
          { error: 'Invalid metadata format' },
          { status: 400 }
        );
      }
    }

    // Google Drive API 호출
    const buffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(buffer);

    const form = new FormData();
    const fileMetadata: Record<string, unknown> = {
      name: filename,
      parents: [parentFolderId],
    };

    if (metadata) {
      fileMetadata.properties = metadata;
    }

    form.append(
      'metadata',
      new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([fileContent], { type: file.type }));

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      // eslint-disable-next-line no-console
      console.error('Google Drive upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file to Google Drive' },
        { status: response.status }
      );
    }

    const uploadedFile = await response.json();

    return NextResponse.json({
      id: uploadedFile.id,
      name: uploadedFile.name,
      size: uploadedFile.size,
      webViewLink: uploadedFile.webViewLink,
      createdTime: uploadedFile.createdTime,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
