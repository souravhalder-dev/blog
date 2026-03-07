
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'You are already subscribed!' });
    }

    const subscriber = await Subscriber.create({ email });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Welcome to Writer\'s Chronicle!',
      html: `
        <h1>Welcome!</h1>
        <p>Thank you for subscribing to my newsletter. You will be the first to know when I publish a new story.</p>
        <p>Best regards,<br/>Sourav Halder</p>
      `,
    });

    return NextResponse.json({ message: 'Subscription successful! Check your email.' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
