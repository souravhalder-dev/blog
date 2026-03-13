import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    const s = await Settings.findOne({ key: 'maintenance_mode' });
    return NextResponse.json({ maintenance: Boolean(s?.value) });
  } catch (e) {
    return NextResponse.json({ maintenance: false });
  }
}

