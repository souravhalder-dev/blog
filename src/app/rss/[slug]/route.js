import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import Settings from '@/models/Settings';

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request, { params }) {
  await dbConnect();
  const { slug } = await params;
  const cat = await Category.findOne({ slug }).lean();
  if (!cat) {
    return new Response('Not Found', { status: 404 });
  }
  const siteUrlSetting = await Settings.findOne({ key: 'site_url' });
  const base = (siteUrlSetting?.value || 'http://localhost:3000').replace(/\/+$/, '');

  const items = await Article.find({ status: 'published', category: cat.name })
    .sort({ date: -1 })
    .limit(30)
    .lean();

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
      <title>${escapeXml(cat.name)} - Category Feed</title>
      <link>${base}/category/${slug}</link>
      <description>${escapeXml(cat.name)} latest posts</description>
      ${xmlItems}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}

