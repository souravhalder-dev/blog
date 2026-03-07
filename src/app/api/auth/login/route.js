
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

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

    // Generate JWT token
    const token = await new SignJWT({ 
        _id: user._id.toString(), 
        email: user.email, 
        role: user.role,
        name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(SECRET_KEY);

    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      description: user.description,
      role: user.role
    };
    
    const response = NextResponse.json({ success: true, user: userData });
    
    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
