
'use client';
import { useState, useEffect } from 'react';
import { X, ZoomIn, Grid, Film, Bookmark, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoGallery({ photos, user, initialPhotoId }) {
  const [selectedPhoto, setSelectedPhoto] = useState(() => {
    if (initialPhotoId) {
      const idx = photos.findIndex(p => p._id === initialPhotoId);
      if (idx !== -1) return photos[idx];
    }
    return null;
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialPhotoId) {
      const idx = photos.findIndex(p => p._id === initialPhotoId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const openLightbox = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    // Update URL without reloading
    window.history.pushState(null, '', `/photos/${photo._id}`);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    // Revert URL to /photos
    window.history.pushState(null, '', '/photos');
  };

  const showNext = (e) => {
    e?.stopPropagation();
    const nextIndex = (currentIndex + 1) % photos.length;
    setCurrentIndex(nextIndex);
    const nextPhoto = photos[nextIndex];
    setSelectedPhoto(nextPhoto);
    window.history.pushState(null, '', `/photos/${nextPhoto._id}`);
  };

  const showPrev = (e) => {
    e?.stopPropagation();
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setCurrentIndex(prevIndex);
    const prevPhoto = photos[prevIndex];
    setSelectedPhoto(prevPhoto);
    window.history.pushState(null, '', `/photos/${prevPhoto._id}`);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentIndex]);

  // Lock page scroll when lightbox open
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    }
  }, [selectedPhoto]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 border-b border-gray-200 pb-12">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                 {user?.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                       <User size={40} />
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left pt-4">
           <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
           <div className="text-sm">
              <p className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                {user?.description || 'Visual storyteller capturing moments from around the world.'}
              </p>
           </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {photos.map((photo, index) => (
          <div 
            key={photo._id} 
            className="group relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(photo, index)}
          >
            {photo.url ? (
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
               <div className="flex items-center gap-2 font-bold">
                  <ZoomIn size={20} />
                  <span>View</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50 p-2"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Nav Buttons */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={showPrev}
            aria-label="Previous photo"
          >
            <ChevronLeft size={40} />
          </button>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={showNext}
            aria-label="Next photo"
          >
            <ChevronRight size={40} />
          </button>
          
          {/* Main Content */}
          <div 
            className="max-w-6xl w-full h-full flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-0 md:gap-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="relative w-full h-[50vh] md:h-[80vh] flex items-center justify-center bg-black">
                <img 
                    src={selectedPhoto.url} 
                    alt={selectedPhoto.title} 
                    className="max-w-full max-h-full object-contain"
                    fetchPriority="high"
                    decoding="sync"
                />
            </div>

            {/* Info Side (Desktop only usually, but let's keep it simple for now or show below on mobile) */}
            <div className="w-full md:w-[350px] bg-white h-auto md:h-[80vh] flex flex-col p-4 md:p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {user?.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                            <User size={20} className="m-auto mt-1 text-gray-400" />
                        )}
                    </div>
                    <span className="font-bold text-sm">{user?.name}</span>
                </div>

                <div className="flex-1">
                    <h2 className="font-bold text-sm mb-2">{selectedPhoto.title}</h2>
                    {selectedPhoto.description && (
                        <p className="text-gray-800 text-sm mb-2 whitespace-pre-line">{selectedPhoto.description}</p>
                    )}
                    <p className="text-gray-600 text-sm">{selectedPhoto.date}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-wide">
                        <span>{indexToDate(currentIndex)}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to fake dates if needed, but we have real dates
function indexToDate(index) {
    return 'Just now'; 
}
