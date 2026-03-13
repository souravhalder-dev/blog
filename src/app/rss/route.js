import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Settings from '@/models/Settings';

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  await dbConnect();
  const siteUrlSetting = await Settings.findOne({ key: 'site_url' });
  const titleSetting = await Settings.findOne({ key: 'site_title' });
  const descSetting = await Settings.findOne({ key: 'site_description' });
  const base = (siteUrlSetting?.value || 'http://localhost:3000').replace(/\/+$/, '');

  const items = await Article.find({ status: 'published' }).sort({ date: -1 }).limit(30).lean();

  const xmlItems = items.map(a => {
    const link = `${base}/article/${a.slug}`;
    return `
      <item>
        <title>${escapeXml(a.title)}</title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${new Date(a.updatedAt || a.date || Date.now()).toUTCString()}</pubDate>
        <category>${escapeXml(a.category)}</category>
        <description><![CDATA[${a.summary}]]></description>
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>${escapeXml(titleSetting?.value || 'Writer')}</title>
      <link>${base}</link>
      <description>${escapeXml(descSetting?.value || 'Stories, photos and videos')}</description>
      ${xmlItems}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}

