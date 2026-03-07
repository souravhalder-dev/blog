
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';

export async function GET() {
  try {
    await dbConnect();
    const videos = await Video.find({}).sort({ date: -1 });
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Generate slug if not present (though middleware handles it, explicit is safer for control)
    let slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Ensure uniqueness
    let existingVideo = await Video.findOne({ slug });
    let counter = 1;
    while (existingVideo) {
        slug = `${slug}-${counter}`;
        existingVideo = await Video.findOne({ slug });
        counter++;
    }

    const video = await Video.create({
        ...body,
        slug,
        date: body.date || new Date().toISOString().split('T')[0]
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
