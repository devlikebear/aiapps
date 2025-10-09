import { NextRequest, NextResponse } from 'next/server';
import { imageAssetSchema, libraryQuerySchema } from '../../../../lib/schemas/image';
import { imageStore } from '../../../../lib/db/image-store';

// GET: Retrieve image library
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query = {
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      style: searchParams.get('style') || undefined,
      artType: searchParams.get('artType') || undefined,
      mood: searchParams.get('mood') || undefined,
    };

    // Validate query
    const validatedQuery = libraryQuerySchema.parse(query);

    // Search assets
    const assets = imageStore.search(validatedQuery);

    return NextResponse.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    console.error('Library GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve library',
      },
      { status: 500 }
    );
  }
}

// POST: Save image asset to library
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Add ID and timestamp if not provided
    const assetData = {
      ...body,
      id: body.id || crypto.randomUUID(),
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    };

    // Validate asset data
    const validatedAsset = imageAssetSchema.parse(assetData);

    // Add to store
    imageStore.add(validatedAsset);

    return NextResponse.json({
      success: true,
      data: validatedAsset,
    });
  } catch (error) {
    console.error('Library POST error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save asset',
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove image asset from library
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Asset ID is required',
        },
        { status: 400 }
      );
    }

    const deleted = imageStore.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Asset not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Library DELETE error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete asset',
      },
      { status: 500 }
    );
  }
}
