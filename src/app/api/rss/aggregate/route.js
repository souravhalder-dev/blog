import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Settings from '@/models/Settings';
import xml2js from 'xml2js';

function slugify(text) {
  if (!text) return '';
  const isNonAscii = /[^\x00-\x7F]+/.test(text);
  if (isNonAscii) {
    return text.trim().replace(/\s+/g, '-').replace(/[^\w\u0980-\u09FF-]+/g, '-');
  }
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function fetchFeed(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const xml = await res.text();
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
  return parser.parseStringPromise(xml);
}

export async function GET() {
  try {
    await dbConnect();
    const feedsSetting = await Settings.findOne({ key: 'rss_feeds' });
    const feeds = Array.isArray(feedsSetting?.value) ? feedsSetting.value : [];
    if (feeds.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0, feeds: 0 });
    }

    let imported = 0;
    let skipped = 0;
    for (const url of feeds) {
      try {
        const data = await fetchFeed(url);
        const channel = data.rss?.channel || data.feed;
        const items = channel?.item || channel?.entry || [];
        const list = Array.isArray(items) ? items : [items];

        for (const it of list) {
          const title = it.title?._ || it.title || '';
          const link = it.link?.href || it.link || '';
          const description = it.description || it.summary || '';
          if (!title) continue;
          const slug = slugify(title);
          const exists = await Article.findOne({ slug }).lean();
          if (exists) {
            skipped++;
            continue;
          }
          const summaryText = (typeof description === 'string' ? description : (description._ || ''))
            .replace(/<[^>]*>/g, '')
            .slice(0, 180) + '...';
          await Article.create({
            title,
            slug,
            summary: summaryText + (link ? ` Read more: ${link}` : ''),
            content: `<p>${summaryText}</p><p><a href="${link}" target="_blank" rel="noopener">Read original</a></p>`,
            author: 'RSS Import',
            date: new Date().toISOString().split('T')[0],
            category: 'Uncategorized',
            image: '',
            isFeatured: false,
            status: 'draft',
          });
          imported++;
        }
      } catch {
        // continue with other feeds
      }
    }

    return NextResponse.json({ imported, skipped, feeds: feeds.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

