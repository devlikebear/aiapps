/**
 * 오디오 라이브러리 API 엔드포인트
 */

import { NextRequest } from 'next/server';
import { audioAssetSchema } from '@/lib/schemas/audio';
import { audioStore } from '@/lib/db/audio-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audio/library
 * 에셋 목록 조회 및 검색
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const genre = searchParams.get('genre') || undefined;
    const mood = searchParams.get('mood') || undefined;

    // 검색 조건이 있으면 필터링, 없으면 전체 조회
    const assets =
      tags || genre || mood
        ? audioStore.search({ tags, genre, mood })
        : audioStore.getAll();

    return Response.json({
      assets,
      total: assets.length,
    });
  } catch (error) {
    console.error('Library GET error:', error);
    return Response.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

/**
 * POST /api/audio/library
 * 에셋 메타데이터 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 스키마 검증
    const validated = audioAssetSchema.parse({
      ...body,
      createdAt: new Date(body.createdAt || Date.now()),
    });

    // 스토어에 저장
    audioStore.add(validated);

    return Response.json(
      { asset: validated, message: 'Asset saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Library POST error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }

    return Response.json({ error: 'Failed to save asset' }, { status: 500 });
  }
}

/**
 * DELETE /api/audio/library
 * 에셋 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const deleted = audioStore.delete(id);

    if (!deleted) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }

    return Response.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Library DELETE error:', error);
    return Response.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
