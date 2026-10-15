import { NextRequest, NextResponse } from 'next/server';
import { generateListing } from '@/lib/ollama';
import { Platform } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let description = '';
    let platform: Platform = 'etsy';
    const images: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      description = (formData.get('description') as string) || '';
      platform = ((formData.get('platform') as string) || 'etsy').toLowerCase() as Platform;

      // Handle both "images" and "images[]" keys
      const files = [
        ...formData.getAll('images'),
        ...formData.getAll('images[]'),
      ].filter((item): item is File => item instanceof File && item.size > 0);

      // Convert each uploaded image to base64
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        images.push(buffer.toString('base64'));
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      description = body.description || '';
      platform = (body.platform || 'etsy').toLowerCase() as Platform;
      if (Array.isArray(body.images)) {
        images.push(...body.images);
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Please use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    if (!description.trim() && images.length === 0) {
      return NextResponse.json(
        { error: 'Please provide a product description or upload at least one image.' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms: Platform[] = ['etsy', 'ebay', 'amazon'];
    if (!validPlatforms.includes(platform)) {
      platform = 'etsy';
    }

    const listing = await generateListing(images, description, platform);

    return NextResponse.json(listing);
  } catch (error: unknown) {
    console.error('API /generate error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error while generating listing.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
