
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import HomepageSetting from '@/models/HomepageSetting';
import Page from '@/models/Page';
import Photo from '@/models/Photo';
import Settings from '@/models/Settings';
import Subscriber from '@/models/Subscriber';
import User from '@/models/User';
import Video from '@/models/Video';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all data in parallel
    const [
      articles,
      categories,
      homepageSettings,
      pages,
      photos,
      settings,
      subscribers,
      users,
      videos
    ] = await Promise.all([
      Article.find({}).lean(),
      Category.find({}).lean(),
      HomepageSetting.find({}).lean(),
      Page.find({}).lean(),
      Photo.find({}).lean(),
      Settings.find({}).lean(),
      Subscriber.find({}).lean(),
      User.find({}).lean(),
      Video.find({}).lean()
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      collections: {
        articles,
        categories,
        homepageSettings,
        pages,
        photos,
        settings,
        subscribers,
        users, // Note: Includes hashed passwords, be careful with this file
        videos
      }
    };

    // Return as a downloadable JSON file
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="writer-chronicle-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
