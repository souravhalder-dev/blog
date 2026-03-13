import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

async function getValue(key, defaultValue = '') {
  const doc = await Settings.findOne({ key });
  return doc ? doc.value : defaultValue;
}

async function setValue(key, value) {
  await Settings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );
}

export async function GET() {
  try {
    await dbConnect();
    const [
      siteTitle,
      siteDescription,
      siteLogoUrl,
      faviconUrl,
      siteUrl,
      cookieNoticeText,
      maintenanceMode,
      sliderEnabled,
    ] = await Promise.all([
      getValue('site_title', 'Writer'),
      getValue('site_description', 'Stories, photos and videos'),
      getValue('site_logo_url', ''),
      getValue('favicon_url', ''),
      getValue('site_url', ''),
      getValue('cookie_notice_text', 'This site uses cookies to improve your experience.'),
      getValue('maintenance_mode', false),
      getValue('slider_enabled', false),
    ]);

    return NextResponse.json({
      siteTitle,
      siteDescription,
      siteLogoUrl,
      faviconUrl,
      siteUrl,
      cookieNoticeText,
      maintenanceMode: Boolean(maintenanceMode),
      sliderEnabled: Boolean(sliderEnabled),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      siteTitle,
      siteDescription,
      siteLogoUrl,
      faviconUrl,
      siteUrl,
      cookieNoticeText,
      maintenanceMode,
      sliderEnabled,
    } = body;

    const ops = [];
    if (siteTitle !== undefined) ops.push(setValue('site_title', siteTitle));
    if (siteDescription !== undefined) ops.push(setValue('site_description', siteDescription));
    if (siteLogoUrl !== undefined) ops.push(setValue('site_logo_url', siteLogoUrl));
    if (faviconUrl !== undefined) ops.push(setValue('favicon_url', faviconUrl));
    if (siteUrl !== undefined) ops.push(setValue('site_url', siteUrl));
    if (cookieNoticeText !== undefined) ops.push(setValue('cookie_notice_text', cookieNoticeText));
    if (maintenanceMode !== undefined) ops.push(setValue('maintenance_mode', !!maintenanceMode));
    if (sliderEnabled !== undefined) ops.push(setValue('slider_enabled', !!sliderEnabled));

    await Promise.all(ops);

    return NextResponse.json({ message: 'Settings saved' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

