
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  await dbConnect();
  const { q } = await searchParams;
  const query = q || '';

  let results = [];
  if (query) {
    results = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ]
    }).sort({ date: -1 }).lean();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold mb-6">Search Results for {query}</h1>
      
      {results.length === 0 ? (
        <div className="text-gray-500 italic">No articles found matching your query.</div>
      ) : (
        <div className="space-y-8">
          {results.map((article) => (
            <div key={article._id} className="border-b border-gray-200 pb-8 last:border-0">
              <Link href={`/article/${article.slug}`} className="group block">
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="w-full md:w-1/3 aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
                      {article.image ? (
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="text-gray-400 font-serif italic text-center p-4">
                          {article.title}
                        </div>
                      )}
                   </div>
                   <div className="w-full md:w-2/3">
                      <div className="text-xs text-red-700 font-bold mb-2 uppercase">{article.category}</div>
                      <h2 className="text-2xl font-serif font-bold mb-3 group-hover:underline leading-tight">{article.title}</h2>
                      <p className="text-gray-600 line-clamp-3 mb-3">{article.summary}</p>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                         By {article.author} • {article.date}
                      </div>
                   </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
