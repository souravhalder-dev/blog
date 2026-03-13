
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/site';
import { pingSitemaps } from '@/lib/ping';

export async function GET() {
  try {
    await dbConnect();
    const photos = await Photo.find({}).sort({ date: -1 }).lean();
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
      date: body.date || new Date().toISOString().split('T')[0]
    });
    try { await pingSitemaps(await getBaseUrl(headers())); } catch {}
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
