
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const user = await User.create({
      ...body,
      password: hashedPassword,
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
