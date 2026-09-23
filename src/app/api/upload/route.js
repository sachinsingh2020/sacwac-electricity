import { NextResponse } from 'next/server';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64DataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

    if (!isCloudinaryConfigured()) {
      // Return a placeholder demo image for testing if Cloudinary is not yet configured
      return NextResponse.json({
        url: base64DataUri.length < 500000 ? base64DataUri : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        publicId: `local-demo-${Date.now()}`,
        isDemo: true,
        message: 'Cloudinary not configured yet. Set CLOUDINARY_* in .env.local for production hosting.',
      });
    }

    const uploadRes = await uploadToCloudinary(base64DataUri);
    return NextResponse.json({
      url: uploadRes.url,
      publicId: uploadRes.publicId,
    });
  } catch (err) {
    console.error('Error during image upload:', err);
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
