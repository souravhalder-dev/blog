
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const updateData = { ...body };
    delete updateData._id; // Cleanup
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Use photo as per Mongoose model
    if (updateData.image) {
        updateData.photo = updateData.image;
        delete updateData.image;
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password; // Don't update password if empty
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password').lean();
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
