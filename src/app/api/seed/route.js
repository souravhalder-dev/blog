
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();

    const email = 'skhsouravhalder@gmail.com';
    const password = 'bXm8dm0phhbekJ0Q';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await newUser.save();

    return NextResponse.json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
