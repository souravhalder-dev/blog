
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    const googleVerification = await Settings.findOne({ key: 'google_verification' });
    return NextResponse.json({
      googleVerification: googleVerification ? googleVerification.value : '',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { googleVerification } = body;

    await Settings.findOneAndUpdate(
      { key: 'google_verification' },
      { value: googleVerification },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
