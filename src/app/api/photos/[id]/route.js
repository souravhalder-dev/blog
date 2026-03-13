
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const photo = await Photo.findByIdAndDelete(id);
    if (!photo) {
       return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Photo deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    // Clean up body
    const updateData = { ...body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const photo = await Photo.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!photo) {
       return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
