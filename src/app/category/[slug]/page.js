
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { optimizeCdn } from '@/lib/images';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateStaticParams() {
  await dbConnect();
  const categories = await Category.find({}, { slug: 1 }).lean();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }) {
  await dbConnect();
  const { slug } = await params;
  const category = await Category.findOne({ slug }).lean();
  
  if (!category) {
    notFound();
  }

  const categoryArticles = await Article.find({ category: category.name }).sort({ date: -1 }).lean();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8 border-b border-black pb-2 uppercase tracking-wider">
        {category.name}
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {categoryArticles.length > 0 ? (
          categoryArticles.map((article) => (
            <div key={article._id.toString()} className="group">
               <Link href={`/article/${article.slug}`}>
                 <div className="aspect-video bg-gray-100 mb-4 overflow-hidden flex items-center justify-center relative">
                   {article.image ? (
                      <Image
                        src={optimizeCdn(article.image)}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-gray-400 font-serif italic text-lg text-center p-4">
                         {article.title}
                      </div>
                    )}
                 </div>
                 <h2 className="text-xl font-serif font-bold mb-2 group-hover:underline leading-snug">
                   {article.title}
                 </h2>
               </Link>
               <p className="text-sm text-gray-600 mb-2">
                 {article.summary}
               </p>
               <div className="text-xs text-gray-400">
                 {article.date}
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No articles found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
