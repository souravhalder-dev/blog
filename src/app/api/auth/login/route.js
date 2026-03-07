
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, you would generate a JWT token here.
    // For simplicity, we'll return success and let the client handle the cookie/session state.
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      description: user.description,
      role: user.role
    };
    
    return NextResponse.json({ success: true, user: userData });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
