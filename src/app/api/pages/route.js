
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';

export async function GET() {
  try {
    await dbConnect();
    const pages = await Page.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.content) {
        return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 });
    }

    // Auto-generate slug if not provided
    if (!body.slug) {
        body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const page = await Page.create({
      title: body.title,
      content: body.content,
      slug: body.slug,
      order: body.order || 0,
      isVisible: body.isVisible !== false // Default true
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Slug already exists. Please choose a unique one.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
