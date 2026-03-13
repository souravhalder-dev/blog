
'use client';

import { useState } from 'react';
import Link from 'next/link';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoPlayer({ currentVideo, allVideos }) {
  const [playingVideo, setPlayingVideo] = useState(currentVideo || allVideos[0]);
  
  const otherVideos = allVideos.filter(v => v._id !== playingVideo?._id);

  if (!playingVideo) {
      return <div className="container mx-auto px-4 py-8">No videos found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Player (Left/Top - 2/3 width) */}
        <div className="lg:col-span-2">
            <div className="aspect-video bg-black w-full rounded-lg overflow-hidden shadow-lg mb-4">
                {playingVideo.type === 'upload' ? (
                    <video 
                    src={playingVideo.url} 
                    controls 
                    autoPlay
                    className="w-full h-full object-cover"
                    key={playingVideo.url} // Force reload on change
                    />
                ) : (
                    getYouTubeId(playingVideo.url) ? (
                    <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeId(playingVideo.url)}?autoplay=1`}
                        title={playingVideo.title}
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
            <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight mb-2">{playingVideo.title}</h1>
            <p className="text-sm text-gray-500 mb-4">{playingVideo.date}</p>
        </div>

        {/* Sidebar List (Right/Bottom - 1/3 width) */}
        <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-4">Up Next</h3>
            <div className="space-y-4">
                {otherVideos.map(video => (
                    <div 
                        key={video._id} 
                        className="flex gap-3 cursor-pointer group"
                        onClick={() => setPlayingVideo(video)}
                    >
                        <div className="w-40 aspect-video bg-gray-100 flex-shrink-0 rounded-md overflow-hidden relative">
                             {video.type === 'upload' ? (
                                <video src={video.url} className="w-full h-full object-cover" />
                             ) : (
                                getYouTubeId(video.url) ? (
                                    <img 
                                      src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/hqdefault.jpg`} 
                                      alt={video.title} 
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black"></div>
                                )
                             )}
                             <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors">
                                {/* Play icon overlay could go here */}
                             </div>
                        </div>
                        <div>
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
    </div>
  );
}
