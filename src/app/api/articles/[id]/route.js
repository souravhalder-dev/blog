
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id).lean();
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    // Clean up body
    const updateData = { ...body };
    delete updateData._id; // Ensure _id is not in update data
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const article = await Article.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!article) {
       return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const article = await Article.findByIdAndDelete(id);
    
    if (!article) {
       return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Article deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
