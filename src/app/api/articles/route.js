
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Subscriber from '@/models/Subscriber';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    await dbConnect();
    const articles = await Article.find({}).sort({ date: -1 }).lean();
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Clean up body: remove empty strings for optional fields so defaults apply
    if (body.image === '') delete body.image;
    
    // Create the article
    const article = await Article.create({
      ...body,
      date: body.date || new Date().toISOString().split('T')[0]
    });

    // Notify subscribers if published
    if (body.status === 'published') {
        const subscribers = await Subscriber.find({ isActive: true }).select('email').lean();
        const emails = subscribers.map(sub => sub.email);

        if (emails.length > 0) {
            const subject = `New Story: ${article.title}`;
            const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/article/${article.slug}`;
            
            const html = `
                <div style="font-family: serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #000;">${article.title}</h1>
                    <p style="color: #666; font-style: italic;">${article.summary}</p>
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width: 100%; border-radius: 8px; margin: 20px 0;" />` : ''}
                    <p>A new story has just been published on Writer's Chronicle.</p>
                    <a href="${articleUrl}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-family: sans-serif;">Read Full Story</a>
                    <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        You received this email because you subscribed to Writer's Chronicle. 
                        <a href="#" style="color: #999;">Unsubscribe</a>
                    </p>
                </div>
            `;

            // Send emails
            Promise.all(emails.map(email => sendEmail({ to: email, subject, html })))
                .catch(err => console.error('Failed to send notification emails:', err));
        }
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
