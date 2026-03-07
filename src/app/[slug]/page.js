
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  await dbConnect();
  const { slug } = await params;
  const page = await Page.findOne({ slug }).lean();
  
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
  };
}

export default async function DynamicPage({ params }) {
  await dbConnect();
  const { slug } = await params;
  const page = await Page.findOne({ slug, isPublished: true }).lean();

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl md:text-5xl font-serif font-bold mb-8">{page.title}</h1>
      <div 
        className="prose prose-lg mx-auto font-serif"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
