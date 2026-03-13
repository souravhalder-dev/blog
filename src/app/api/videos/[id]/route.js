
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
        let baseSlug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        // Check uniqueness excluding current video
        let existingVideo = await Video.findOne({ 
           slug, 
           _id: { $ne: id } 
        }).lean();
        
        let counter = 1;
        while (existingVideo) {
            slug = `${baseSlug}-${counter}`;
            existingVideo = await Video.findOne({ 
               slug, 
               _id: { $ne: id } 
            }).lean();
            counter++;
        }
        body.slug = slug;
    }

    // Clean up body
    const updateData = { ...body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const video = await Video.findByIdAndUpdate(id, updateData, { new: true });
    
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
