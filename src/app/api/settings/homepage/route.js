
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomepageSetting from '@/models/HomepageSetting';

// Initialize default settings if they don't exist
const DEFAULT_SECTIONS = [
  { section: 'featured_story', title: 'Featured Story', order: 0, isVisible: true, type: 'static' },
  { section: 'latest_stories', title: 'Latest Stories', order: 1, isVisible: true, type: 'static' },
  { section: 'in_pictures', title: 'In Pictures', order: 2, isVisible: true, type: 'static' },
  { section: 'featured_video', title: 'Featured Video', order: 3, isVisible: true, type: 'static' },
];

export async function GET() {
  try {
    await dbConnect();
    
    // Check if settings exist, if not create defaults
    const count = await HomepageSetting.countDocuments();
    if (count === 0) {
      await HomepageSetting.insertMany(DEFAULT_SECTIONS);
    }

    const settings = await HomepageSetting.find({}).sort({ order: 1 });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    if (!body.section) {
        return NextResponse.json({ error: 'Section identifier is required' }, { status: 400 });
    }

    // Calculate next order
    const lastSetting = await HomepageSetting.findOne().sort({ order: -1 });
    const order = lastSetting ? lastSetting.order + 1 : 0;
    
    const setting = await HomepageSetting.create({ ...body, order });
    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    const setting = await HomepageSetting.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    await HomepageSetting.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
