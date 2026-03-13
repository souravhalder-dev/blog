
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();
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
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'user',
      photo: body.photo || body.image // Use photo as per Mongoose model
    });
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    
    return NextResponse.json(userObject, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
