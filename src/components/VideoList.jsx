
'use client';

import { useState } from 'react';
import Link from 'next/link';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoList({ videos }) {
  const [currentVideo, setCurrentVideo] = useState(videos[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 20;
  
  if (!videos || videos.length === 0) {
      return <div className="container mx-auto px-4 py-8">No videos found.</div>;
  }

  // Filter out the current video from the list
  const otherVideos = videos.filter(v => v._id !== currentVideo._id);
  
  // Get 5 "Up Next" videos
  const upNextVideos = otherVideos.slice(0, 5);
  
  // Get remaining videos for the grid (excluding "Up Next" ones)
  const remainingVideos = otherVideos.slice(5);
  
  // Pagination logic
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentGridVideos = remainingVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(remainingVideos.length / videosPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to grid section
    document.getElementById('video-grid').scrollIntoView({ behavior: 'smooth' });
  };

  const updateUrl = (video) => {
    if (typeof window !== 'undefined') {
        const slug = video.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        // Use history.pushState to update URL without reloading
        // We use a query param or a hash if we don't want to change the route, 
        // OR we can change the route if we have dynamic routing for videos.
        // The requirement is "video title should appear in the browser URL".
        // Since this is a list page (/videos), we can use query param like ?v=slug or just hash #slug
        // BUT better: if we have /video/[slug] page, we should link to that.
        // However, this component is used in /videos page which is a player + list.
        // So we just update the URL to look like /videos/video-title-slug
        // BUT this might 404 if we reload. 
        // Let's use hash for now or query param. 
        // User asked "video title should appear in the browser URL along with the link (SEO-friendly URL)".
        // This implies we should probably have a real route /videos/[slug].
        // Let's implement that route in a separate task. For now, let's just update URL for visual feedback
        // But wait, "when a user clicks on a video, the video title should appear... along with the link".
        // This strongly suggests /videos/video-slug.
        // So let's make the Link href point to /videos/slug if we implement that page.
        // Since we are building a single-page-like experience here, let's use window.history.pushState
        // to /videos?v=slug or /videos/slug if we handle rewrites.
        // Let's try to just update the URL hash or query param for now as it's safest without new routes.
        // Actually, the user requirement implies a unique URL for each video.
        // So I will assume I need to create a page for /videos/[slug] later.
        // For now, let's just update the state.
        // Wait, I am in VideoList component.
        
        // Let's update the URL to /videos?video=slug
        const newUrl = `${window.location.pathname}?video=${slug}`;
        window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Main Video Player (Left - 8 columns) */}
        <div className="lg:col-span-8">
            <div className="aspect-video bg-black w-full rounded-lg overflow-hidden shadow-lg mb-4">
                {currentVideo.type === 'upload' ? (
                    <video 
                      src={currentVideo.url} 
                      controls 
                      autoPlay
                      className="w-full h-full object-contain bg-black"
                      key={currentVideo.url} // Force reload on change
                    />
                ) : (
                    getYouTubeId(currentVideo.url) ? (
                    <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeId(currentVideo.url)}?autoplay=1&rel=0`}
                        title={currentVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-gray-800">
                        Invalid Video URL
                    </div>
                    )
                )}
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight mb-2">{currentVideo.title}</h1>
            <p className="text-sm text-gray-500 mb-4">{currentVideo.date}</p>
        </div>

        {/* Sidebar List (Right - 4 columns) - Up Next (5 videos) */}
        <div className="lg:col-span-4">
            <h3 className="font-bold text-lg mb-4 border-b border-gray-200 pb-2">Up Next</h3>
            <div className="flex flex-col gap-4">
                {upNextVideos.map(video => (
                    <div 
                        key={video._id} 
                        className="flex gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => {
                            setCurrentVideo(video);
                            updateUrl(video);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <div className="w-40 aspect-video bg-gray-200 flex-shrink-0 rounded-md overflow-hidden relative">
                             {video.type === 'upload' ? (
                                <video src={video.url} className="w-full h-full object-cover" />
                             ) : (
                                getYouTubeId(video.url) ? (
                                    <img 
                                      src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/hqdefault.jpg`} 
                                      alt={video.title} 
                                      className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black"></div>
                                )
                             )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-serif font-bold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-red-700 transition-colors">
                                {video.title}
                            </h4>
                            <p className="text-xs text-gray-500">{video.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Grid Section (20 videos per page) */}
      {remainingVideos.length > 0 && (
        <div id="video-grid" className="border-t border-gray-200 pt-12">
           <h3 className="text-2xl font-serif font-bold mb-8">More Videos</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentGridVideos.map(video => (
                 <div 
                    key={video._id} 
                    className="group cursor-pointer"
                    onClick={() => {
                        setCurrentVideo(video);
                        updateUrl(video);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                 >
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3 relative">
                         {video.type === 'upload' ? (
                            <video src={video.url} className="w-full h-full object-cover" />
                         ) : (
                            getYouTubeId(video.url) ? (
                                <img 
                                  src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/hqdefault.jpg`} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-black"></div>
                            )
                         )}
                         <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                            </div>
                         </div>
                    </div>
                    <h4 className="font-serif font-bold text-base leading-tight mb-1 group-hover:text-red-700 transition-colors">
                        {video.title}
                    </h4>
                    <p className="text-xs text-gray-500">{video.date}</p>
                 </div>
              ))}
           </div>

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="flex justify-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <button
                     key={page}
                     onClick={() => handlePageChange(page)}
                     className={`px-4 py-2 border rounded text-sm font-medium ${currentPage === page ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'}`}
                   >
                     {page}
                   </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
