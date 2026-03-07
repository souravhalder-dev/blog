
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import xml2js from 'xml2js';

export async function POST(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const file = formData.get('file');
    const platform = formData.get('platform');
    const defaultCategory = 'Uncategorized';

    if (!file || !platform) {
      return NextResponse.json({ error: 'File and platform are required' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const xml = new TextDecoder().decode(buffer);

    let articles = [];

    if (platform === 'wordpress') {
      articles = await parseWordPress(xml);
    } else if (platform === 'blogger') {
      articles = await parseBlogger(xml);
    } else {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const article of articles) {
      try {
        // Basic slug generation if missing or empty
        if (!article.slug) {
            // Check if title is mostly non-ascii
            const isNonAscii = /[^\x00-\x7F]+/.test(article.title);
            
            if (isNonAscii) {
                // For Bengali/Unicode titles, keep the characters, just replace spaces/symbols
                article.slug = article.title.trim().replace(/\s+/g, '-').replace(/[^\w\u0980-\u09FF-]+/g, '-');
            } else {
                article.slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
        }

        const existing = await Article.findOne({ slug: article.slug });
        if (existing) {
          skippedCount++;
          continue;
        }

        // Ensure required fields
        if (!article.title || !article.content) {
             failedCount++;
             continue;
        }
        
        // Default category if missing
        if (!article.category) article.category = defaultCategory;
        
        // Check if category exists in DB, if not create it
        let categoryDoc = await Category.findOne({ name: article.category });
        if (!categoryDoc) {
            try {
                // Generate slug for category
                const catSlug = article.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                // Ensure unique slug for category
                let uniqueCatSlug = catSlug;
                let counter = 1;
                while (await Category.findOne({ slug: uniqueCatSlug })) {
                    uniqueCatSlug = `${catSlug}-${counter}`;
                    counter++;
                }

                categoryDoc = await Category.create({
                    name: article.category,
                    slug: uniqueCatSlug,
                    showInMenu: true // Show imported categories in menu by default? Or false? Let's default to true so user sees them.
                });
                console.log(`Created new category: ${article.category}`);
            } catch (catErr) {
                console.error('Error creating category:', catErr);
                // Fallback to Uncategorized if creation fails (e.g. name collision race condition)
                article.category = defaultCategory;
            }
        }

        // Default summary if missing
        if (!article.summary) article.summary = article.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';

        await Article.create(article);
        importedCount++;
      } catch (err) {
        console.error('Import error for article:', article.title, err);
        failedCount++;
      }
    }

    return NextResponse.json({ 
      message: `Import completed. Imported: ${importedCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`,
      stats: {
        imported: importedCount,
        skipped: skippedCount,
        failed: failedCount,
      }
    });

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function parseWordPress(xml) {
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
    const result = await parser.parseStringPromise(xml);
    
    // Safety check for RSS structure
    if (!result.rss || !result.rss.channel) {
        throw new Error('Invalid WordPress XML format');
    }

    const items = result.rss.channel.item;
    if (!items) return [];

    const posts = Array.isArray(items) ? items : [items];
    
    return posts
        .filter(item => {
            // Check for wp:post_type if available, otherwise assume post if it has content
            const postType = item['wp:post_type'];
            const status = item['wp:status'];
            // If strict WP export, use these checks. If generic RSS, might need to be looser.
            if (postType && status) {
                return postType === 'post' && status === 'publish';
            }
            return true; // Fallback for generic RSS feeds
        })
        .map(item => {
            const content = item['content:encoded'] || item.description || '';
            const summary = item['excerpt:encoded'] || content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';
            
            // Extract image
            let image = '';
            // Try to find featured image ID then look it up? Too complex for simple import.
            // Just grab first image from content.
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) image = imgMatch[1];

            let category = 'Uncategorized';
            if (item.category) {
                if (Array.isArray(item.category)) {
                    // WP export often has multiple categories, pick the first one that isn't 'Uncategorized' if possible
                    const cat = item.category.find(c => c._ !== 'Uncategorized');
                    category = cat ? cat._ : item.category[0]._;
                } else {
                    category = item.category._ || item.category;
                }
            }

            let slug = item['wp:post_name'];
            if (slug) {
                try {
                    slug = decodeURIComponent(slug);
                } catch (e) {
                    // ignore
                }
            } else {
                slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            return {
                title: item.title,
                slug: slug,
                content: content,
                summary: summary,
                date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                author: item['dc:creator'] || 'Imported',
                category: category,
                image: image,
                status: 'published',
                isFeatured: false,
            };
        });
}

async function parseBlogger(xml) {
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
    const result = await parser.parseStringPromise(xml);
    
    // Safety check for Atom structure
    if (!result.feed || !result.feed.entry) {
        throw new Error('Invalid Blogger XML format');
    }
    
    const entries = result.feed.entry;
    if (!entries) return [];

    const posts = Array.isArray(entries) ? entries : [entries];

    return posts
        .filter(entry => {
            // Blogger specific: filter out templates/settings/comments
            // Look for category with term containing 'kind#post'
            if (entry.category) {
                const cats = Array.isArray(entry.category) ? entry.category : [entry.category];
                return cats.some(c => c.$ && c.$.term && c.$.term.includes('kind#post'));
            }
            return false;
        })
        .map(entry => {
            const content = entry.content && (entry.content._ || entry.content); // Content can be object or string
            const summary = content ? content.substring(0, 150).replace(/<[^>]+>/g, '') + '...' : '';
            
            // Extract image
            let image = '';
            const imgMatch = content ? content.match(/<img[^>]+src="([^">]+)"/) : null;
            if (imgMatch) image = imgMatch[1];

            // Categories (tags)
            let category = 'Uncategorized';
            if (entry.category) {
                const cats = Array.isArray(entry.category) ? entry.category : [entry.category];
                // Filter out the 'kind#post' category
                const realCats = cats
                    .filter(c => c.$ && c.$.term && !c.$.term.includes('kind#') && !c.$.term.includes('http'))
                    .map(c => c.$.term);
                
                if (realCats.length > 0) category = realCats[0];
            }
            
            // Link/Slug
            let slug = '';
            if (entry.link) {
                const links = Array.isArray(entry.link) ? entry.link : [entry.link];
                const altLink = links.find(l => l.$ && l.$.rel === 'alternate' && l.$.type === 'text/html');
                if (altLink && altLink.$.href) {
                     const parts = altLink.$.href.split('/');
                     slug = parts[parts.length - 1].replace('.html', '');
                     try { slug = decodeURIComponent(slug); } catch (e) {}
                }
            }
            if (!slug && entry.title) {
                slug = (entry.title._ || entry.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            return {
                title: entry.title._ || entry.title,
                slug: slug,
                content: content || '',
                summary: summary,
                date: entry.published ? new Date(entry.published).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                author: entry.author && entry.author.name ? entry.author.name : 'Imported',
                category: category,
                image: image,
                status: 'published',
                isFeatured: false,
            };
        });
}
