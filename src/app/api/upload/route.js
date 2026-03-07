
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Cloudinary if credentials are provided OR in production
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        
        // Convert buffer to base64 data URI
        const base64Data = buffer.toString('base64');
        const mimeType = file.type || 'application/octet-stream';
        const fileUri = `data:${mimeType};base64,${base64Data}`;
        
        try {
            const uploadResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'writer-chronicle',
                resource_type: 'auto'
            });
            return NextResponse.json({ success: true, url: uploadResponse.secure_url });
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            throw new Error('Cloudinary upload failed: ' + cloudinaryError.message);
        }
    }

    // Fallback: Local Filesystem (Only works in Dev, NOT Vercel Production)
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Local file upload is not supported in Vercel production. Please configure Cloudinary environment variables.');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/\s+/g, '-');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, message: error.message || 'Upload failed' }, { status: 500 });
  }
}
