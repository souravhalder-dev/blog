
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';

export async function GET() {
  try {
    await dbConnect();
    const photos = await Photo.find({}).sort({ date: -1 });
    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const photo = await Photo.create({
        ...body,
        date: new Date().toISOString().split('T')[0]
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
