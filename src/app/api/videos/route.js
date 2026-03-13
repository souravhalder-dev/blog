
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/site';
import { pingSitemaps } from '@/lib/ping';

export async function GET() {
  try {
    await dbConnect();
    const videos = await Video.find({}).sort({ date: -1 }).lean();
    console.log(`Fetched ${videos.length} videos`); // Debug log
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Generate slug from title
    const baseSlug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    
    // Ensure uniqueness
    let existingVideo = await Video.findOne({ slug }).lean();
    let counter = 1;
    while (existingVideo) {
        slug = `${baseSlug}-${counter}`;
        existingVideo = await Video.findOne({ slug }).lean();
        counter++;
    }

    const video = await Video.create({
      ...body,
      slug,
      date: body.date || new Date().toISOString().split('T')[0]
    });
    try { await pingSitemaps(await getBaseUrl(headers())); } catch {}
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
