import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
  await dbConnect();
  const feeds = await Settings.findOne({ key: 'rss_feeds' });
  return NextResponse.json({ feeds: Array.isArray(feeds?.value) ? feeds.value : [] });
}

export async function POST(request) {
  await dbConnect();
  const { feeds } = await request.json();
  if (!Array.isArray(feeds)) {
    return NextResponse.json({ error: 'feeds must be array' }, { status: 400 });
  }
  await Settings.findOneAndUpdate({ key: 'rss_feeds' }, { value: feeds }, { upsert: true });
  return NextResponse.json({ ok: true });
}

