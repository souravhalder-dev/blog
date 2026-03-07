
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    // Update slug if title changes
    if (body.title) {
        let slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let existingVideo = await Video.findOne({ slug, _id: { $ne: id } });
        let counter = 1;
        while (existingVideo) {
            slug = `${slug}-${counter}`;
            existingVideo = await Video.findOne({ slug, _id: { $ne: id } });
            counter++;
        }
        body.slug = slug;
    }

    const video = await Video.findByIdAndUpdate(id, body, { new: true });
    
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Video deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
