
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  await dbConnect();
  const articles = await Article.find({}, { slug: 1 }).lean();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }) {
  await dbConnect();
  const { slug } = await params;
  const article = await Article.findOne({ slug: decodeURIComponent(slug) }).lean();

  if (!article) {
    notFound();
  }

  // Convert _id to string
  article._id = article._id.toString();

  // Fetch admin user details for "About the Author"
  const adminUser = await UserModel.findOne({ role: 'admin' }).lean();

  // Helper to format content (handle plain text newlines if not HTML)
  const formatContent = (content) => {
    if (!content) return '';
    // Simple check if it looks like HTML
    if (content.trim().startsWith('<')) {
      return content;
    }
    // Convert newlines to <br/> for plain text
    return content.replace(/\n/g, '<br/>');
  };

  const relatedArticles = await Article.find({ 
    category: article.category,
    _id: { $ne: article._id }
  }).sort({ date: -1 }).limit(3).lean();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black mb-8">
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
        
        <header className="mb-8 text-center">
          <div className="text-red-700 font-bold uppercase text-sm tracking-widest mb-4">
            {article.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-gray-600 font-serif italic mb-6">
            {article.summary}
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500 font-bold uppercase tracking-wider border-t border-b border-gray-200 py-4">
            By <span className="text-black mx-1">{article.author}</span> • {article.date}
          </div>
        </header>

        <div className="aspect-video bg-gray-100 mb-8 relative overflow-hidden flex items-center justify-center">
            {article.image ? (
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 font-serif italic text-lg">
                 {article.title}
              </div>
            )}
        </div>

        <div 
          className="prose prose-lg mx-auto font-serif first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left"
          dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
        />
        
        <div className="mt-12 pt-8 border-t border-black">
           <h3 className="font-bold mb-4">About the Author</h3>
           <div className="flex gap-4 items-center bg-gray-50 p-6 rounded-lg">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                 {adminUser?.photo ? (
                    <img src={adminUser.photo} alt={adminUser.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                       <User size={32} />
                    </div>
                 )}
              </div>
              <div>
                 <p className="font-bold">{adminUser?.name || article.author}</p>
                 <p className="text-sm text-gray-600 whitespace-pre-line">
                    {adminUser?.description || 'Journalist and storyteller based in New York. Covering technology, culture, and the human experience.'}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-serif font-bold mb-8 text-center">Related Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map(related => (
              <div key={related._id.toString()} className="group">
                <Link href={`/article/${related.slug}`}>
                  <div className="aspect-video bg-gray-100 mb-4 overflow-hidden flex items-center justify-center">
                    {related.image ? (
                      <img 
                        src={related.image} 
                        alt={related.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="text-gray-400 text-xs font-serif italic text-center p-2">{related.title}</div>
                    )}
                  </div>
                  <div className="text-xs text-red-700 font-bold mb-2 uppercase">{related.category}</div>
                  <h4 className="font-serif font-bold text-lg leading-tight mb-2 group-hover:underline">{related.title}</h4>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2">{related.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
