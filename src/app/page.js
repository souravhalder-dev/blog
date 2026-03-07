
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Photo from '@/models/Photo';
import Video from '@/models/Video';
import HomepageSetting from '@/models/HomepageSetting';

export const dynamic = 'force-dynamic'; // For demo purposes, to see updates instantly

async function getData() {
  await dbConnect();
  
  // Use .lean() to get plain JS objects instead of Mongoose documents
  // and manually convert _id to string to avoid serialization issues
  const articles = await Article.find({}).sort({ date: -1 }).lean();
  const photos = await Photo.find({}).sort({ date: -1 }).limit(3).lean();
  const videos = await Video.find({}).sort({ date: -1 }).limit(1).lean();
  const featuredVideo = await Video.findOne({ isFeatured: true }).lean() || videos[0];
  const inPictures = await Photo.find({}).sort({ date: -1 }).limit(4).lean();
  
  // Initialize default settings if they don't exist
  const count = await HomepageSetting.countDocuments();
  if (count === 0) {
     const DEFAULT_SECTIONS = [
       { section: 'featured_story', title: 'Featured Story', order: 0, isVisible: true, type: 'static' },
       { section: 'latest_stories', title: 'Latest Stories', order: 1, isVisible: true, type: 'static' },
       { section: 'in_pictures', title: 'In Pictures', order: 2, isVisible: true, type: 'static' },
       { section: 'featured_video', title: 'Featured Video', order: 3, isVisible: true, type: 'static' },
     ];
     await HomepageSetting.insertMany(DEFAULT_SECTIONS);
  }

  const settings = await HomepageSetting.find({ isVisible: true }).sort({ order: 1 }).lean();

  // Fetch category articles for dynamic sections
  const dynamicSections = settings.filter(s => s.type === 'category');
  const categoryArticlesMap = {};
  
  for (const section of dynamicSections) {
      if (section.categorySlug) {
          // Find category by slug first to get name if needed, but we store slug
          // Actually let's just query articles by category (assuming we stored category name or slug in article)
          // In seed-db.js we stored category Name (e.g. "Technology").
          // But our new Category model has slug.
          // Let's find the Category document first to get the Name matching the Article schema
          // OR better: Update Article schema to store slug or ObjectId. 
          // Current Article schema stores "category" as String (Name).
          // So we need to map slug -> Name.
          
          // Let's assume we can fetch 3 articles for each category section
          // First get the category name from the slug
          // This is a bit inefficient inside a loop, but for a few sections it's fine. 
          // Optimization: fetch all categories at once.
          
          // Simplified approach: find articles where category matches the name corresponding to the slug
          // But wait, Article.category stores the Name (e.g. "World"). 
          // The setting stores the slug (e.g. "world").
          // We need to resolve slug to name.
      }
  }
  
  // Optimization: Fetch all categories to map slug -> name
  // This is needed because Article.category stores the Name, not the Slug.
  const allCategories = await import('@/models/Category').then(mod => mod.default.find({}).lean());
  const slugToName = allCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat.name;
      return acc;
  }, {});

  for (const section of dynamicSections) {
      if (section.categorySlug && slugToName[section.categorySlug]) {
          const catName = slugToName[section.categorySlug];
          const catArticles = await Article.find({ category: catName })
              .sort({ date: -1 })
              .limit(4)
              .lean();
          categoryArticlesMap[section._id.toString()] = catArticles.map(doc => ({...doc, _id: doc._id.toString()}));
      }
  }

  return {
    articles: articles.map(doc => ({...doc, _id: doc._id.toString()})),
    photos: photos.map(doc => ({...doc, _id: doc._id.toString()})),
    inPictures: inPictures.map(doc => ({...doc, _id: doc._id.toString()})),
    videos: videos.map(doc => ({...doc, _id: doc._id.toString()})),
    featuredVideo: featuredVideo ? {...featuredVideo, _id: featuredVideo._id.toString()} : null,
    settings: settings.map(doc => ({...doc, _id: doc._id.toString()})),
    categoryArticlesMap
  };
}

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function Home() {
  const { articles, photos, inPictures, videos, featuredVideo, settings, categoryArticlesMap } = await getData();

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const otherArticles = articles.filter(a => a._id !== featuredArticle?._id);

  if (!featuredArticle) {
    return <div className="container mx-auto px-4 py-8">No articles found.</div>;
  }

  const renderSection = (setting) => {
    if (setting.type === 'category') {
        const catArticles = categoryArticlesMap[setting._id];
        
        // Show section even if empty to confirm layout to admin
        // if (!catArticles || catArticles.length === 0) return null;

        return (
            <section key={setting._id} className="mb-12 border-t border-black pt-6">
                <div className="flex justify-between items-end mb-6">
                   <h3 className="font-bold text-lg font-serif uppercase tracking-widest">{setting.title}</h3>
                   <Link href={`/category/${setting.categorySlug}`} className="text-xs font-bold uppercase hover:underline text-red-700">View All</Link>
                </div>
                
                {(!catArticles || catArticles.length === 0) ? (
                    <div className="bg-gray-50 border border-dashed border-gray-300 p-8 text-center rounded-lg">
                        <p className="text-gray-500 font-serif italic">No articles found in this category yet.</p>
                        <Link href="/admin/articles/new" className="text-xs font-bold uppercase text-black mt-2 inline-block hover:underline">
                            + Add Article
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {catArticles.map(article => (
                            <div key={article._id} className="group">
                            <Link href={`/article/${article.slug}`}>
                                <div className="aspect-video bg-gray-100 mb-3 overflow-hidden flex items-center justify-center">
                                    {article.image ? (
                                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                    <div className="text-gray-400 text-xs font-serif italic text-center p-2">{article.title}</div>
                                    )}
                                </div>
                                <h4 className="font-serif font-bold text-lg leading-tight mb-2 group-hover:underline">{article.title}</h4>
                            </Link>
                            <p className="text-xs text-gray-500">{article.date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        );
    }

    switch(setting.section) {
        case 'featured_story':
            return (
              <section key={setting._id} className="mb-12 border-b border-gray-200 pb-12">
                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-8">
                    <Link href={`/article/${featuredArticle.slug}`} className="group">
                      <div className="relative aspect-video mb-4 overflow-hidden bg-gray-100 flex items-center justify-center">
                         {featuredArticle.image ? (
                           <img 
                             src={featuredArticle.image} 
                             alt={featuredArticle.title} 
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <div className="text-gray-400 font-serif italic text-2xl text-center p-4">
                              {featuredArticle.title}
                           </div>
                         )}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 group-hover:underline leading-tight">
                        {featuredArticle.title}
                      </h2>
                    </Link>
                    <p className="text-lg text-gray-600 font-sans leading-relaxed mb-4">
                      {featuredArticle.summary}
                    </p>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                      By {featuredArticle.author} <span className="mx-2">•</span> {featuredArticle.date}
                    </div>
                  </div>
                  <div className="md:col-span-4 border-l border-gray-200 pl-8 hidden md:block">
                    <h3 className="font-bold text-sm tracking-widest mb-6 border-b border-black pb-1 inline-block">
                      LATEST STORIES
                    </h3>
                    <div className="space-y-8">
                      {otherArticles.slice(0, 5).map(article => (
                        <div key={article._id} className="group">
                          <div className="text-xs text-red-700 font-bold mb-1 uppercase">{article.category}</div>
                          <Link href={`/article/${article.slug}`}>
                            <h4 className="text-xl font-serif font-bold mb-2 group-hover:underline leading-snug">
                              {article.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {article.summary}
                          </p>
                          <div className="text-xs text-gray-400">
                            {article.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
        case 'latest_stories':
            return (
              <section key={setting._id} className="mb-12 md:hidden">
                <h3 className="font-bold text-sm tracking-widest mb-6 border-b border-black pb-1 inline-block">
                  MORE STORIES
                </h3>
                <div className="grid gap-8">
                  {otherArticles.map(article => (
                    <div key={article._id} className="border-b border-gray-100 pb-6 last:border-0">
                       <div className="text-xs text-red-700 font-bold mb-1 uppercase">{article.category}</div>
                       <Link href={`/article/${article.slug}`}>
                        <h3 className="text-xl font-serif font-bold mb-2 leading-snug">
                          {article.title}
                        </h3>
                       </Link>
                       <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
        case 'in_pictures':
            return (
              <section key={setting._id} className="mb-12 border-t border-black pt-6">
                 <div className="flex justify-between items-end mb-6">
                     <h3 className="font-bold text-lg font-serif uppercase tracking-widest">{setting.title}</h3>
                     <Link href="/photos" className="text-xs font-bold uppercase hover:underline text-red-700">View All</Link>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {inPictures.map((photo) => (
                   <Link key={photo._id} href={`/photos/${photo._id}`} className="group">
                       <div className="aspect-square bg-gray-100 relative overflow-hidden">
                           {photo.url ? (
                                     <img 
                                       src={photo.url} 
                                       alt={photo.title} 
                                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                     />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                 )}
                                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                     <p className="text-white text-xs font-bold truncate w-full">{photo.title}</p>
                                 </div>
                             </div>
                         </Link>
                     ))}
                 </div>
              </section>
            );
        case 'featured_video':
            return (
              <section key={setting._id} className="mb-12 border-t border-black pt-6">
                 <div className="flex justify-between items-end mb-6">
                     <h3 className="font-bold text-lg font-serif uppercase tracking-widest">{setting.title}</h3>
                     <Link href="/videos" className="text-xs font-bold uppercase hover:underline text-red-700">View All</Link>
                 </div>
                 
                 {featuredVideo ? (
                     <div className="bg-black text-white p-4 md:p-8">
                         <div className="grid md:grid-cols-2 gap-8 items-center">
                             <div className="aspect-video bg-gray-900 w-full overflow-hidden">
                                {featuredVideo.type === 'upload' ? (
                                    <video 
                                    src={featuredVideo.url} 
                                    controls 
                                    className="w-full h-full object-contain"
                                    />
                                ) : (
                                    getYouTubeId(featuredVideo.url) ? (
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${getYouTubeId(featuredVideo.url)}`}
                                        title={featuredVideo.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                    ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        Invalid Video URL
                                    </div>
                                    )
                                )}
                             </div>
                             <div>
                                 <div className="text-red-500 font-bold uppercase text-xs tracking-widest mb-2">Featured Video</div>
                                 <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 leading-tight">{featuredVideo.title}</h2>
                                 <div className="text-gray-400 text-sm mb-6">{featuredVideo.date}</div>
                                 <Link href="/videos" className="inline-block bg-white text-black px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                     Watch More
                                 </Link>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300">
                         <p className="text-gray-500">No videos available.</p>
                     </div>
                 )}
              </section>
            );
        default:
            return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {settings.map(setting => renderSection(setting))}
    </div>
  );
}
