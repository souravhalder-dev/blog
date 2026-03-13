
'use client';
import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, Upload, Link as LinkIcon, Video as VideoIcon, Search, Edit, X } from 'lucide-react';

export default function VideosAdmin() {
  const [videos, setVideos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    url: '', 
    date: new Date().toISOString().split('T')[0],
    type: 'youtube', // 'youtube' or 'upload'
    isFeatured: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      
      if (res.ok) {
        setFormData(prev => ({ ...prev, url: json.url }));
      } else {
        alert('Upload failed: ' + (json.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.url) {
      alert('Please provide a title and a video URL/file.');
      return;
    }

    try {
      if (editingVideo) {
        // Update existing video
        const res = await fetch(`/api/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedVideo = await res.json();
          setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
          resetForm();
        }
      } else {
        // Create new video
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const addedVideo = await res.json();
          setVideos([addedVideo, ...videos]);
          resetForm();
        } else {
            const errorData = await res.json();
            alert('Failed to save video: ' + (errorData.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save video: ' + error.message);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      date: video.date,
      type: video.type || 'youtube',
      isFeatured: video.isFeatured || false
    });
    setIsAdding(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await fetch(`/api/videos/${id}`, { method: 'DELETE' });
        setVideos(videos.filter(v => v.id !== id));
        setSelectedVideos(selectedVideos.filter(sid => sid !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedVideos.length} videos?`)) {
        try {
            await Promise.all(selectedVideos.map(id => 
                fetch(`/api/videos/${id}`, { method: 'DELETE' })
            ));
            
            setVideos(videos.filter(v => !selectedVideos.includes(v.id)));
            setSelectedVideos([]);
        } catch (error) {
            console.error('Error deleting videos:', error);
            alert('Failed to delete some videos.');
        }
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({ 
      title: '', 
      description: '',
      url: '', 
      date: new Date().toISOString().split('T')[0],
      type: 'youtube',
      isFeatured: false
    });
    setIsAdding(false);
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (e) => {
      if (e.target.checked) {
          setSelectedVideos(filteredVideos.map(v => v.id));
      } else {
          setSelectedVideos([]);
      }
  };

  const handleSelectOne = (id) => {
      if (selectedVideos.includes(id)) {
          setSelectedVideos(selectedVideos.filter(sid => sid !== id));
      } else {
          setSelectedVideos([...selectedVideos, id]);
      }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Videos</h1>
        
        <div className="flex w-full md:w-auto gap-4 items-center">
            {selectedVideos.length > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 flex-shrink-0 text-sm"
                >
                    <Trash2 size={16} /> Delete ({selectedVideos.length})
                </button>
            )}

            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Search videos..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button 
                onClick={() => {
                    resetForm();
                    setIsAdding(true);
                }} 
                className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 flex-shrink-0"
            >
                <Plus size={16} /> Add Video
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-md border border-gray-200 w-fit">
              <input 
                  type="checkbox" 
                  id="selectAll"
                  onChange={handleSelectAll}
                  checked={filteredVideos.length > 0 && selectedVideos.length === filteredVideos.length}
                  className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Select All Videos</label>
          </div>

          {selectedVideos.length > 0 && (
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-gray-700">Selected Videos ({selectedVideos.length})</h3>
                    <button onClick={() => setSelectedVideos([])} className="text-xs text-gray-500 hover:text-black">
                        Clear Selection
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {videos.filter(v => selectedVideos.includes(v.id)).map(video => (
                        <div key={video.id} className="relative group w-24 h-16 rounded-md overflow-hidden border border-gray-200 bg-black">
                            {video.type === 'youtube' ? (
                                <img src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/default.jpg`} alt={video.title} className="w-full h-full object-cover opacity-70" loading="lazy" decoding="async" />
                            ) : (
                                <video src={video.url} className="w-full h-full object-cover opacity-70" />
                            )}
                            <button 
                                onClick={() => handleSelectOne(video.id)}
                                className="absolute top-0 right-0 bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
          )}

          {isAdding && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">{editingVideo ? 'Edit Video' : 'Add New Video'}</h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-black">
                      <X size={20} />
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                      type="text" 
                      placeholder="Video Title" 
                      className="w-full border border-gray-300 px-3 py-2 rounded-md"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                      placeholder="Video Description" 
                      className="w-full border border-gray-300 px-3 py-2 rounded-md h-24 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Source</label>
                    <div className="flex gap-4 mb-3">
                      <button 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${formData.type === 'youtube' ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setFormData({...formData, type: 'youtube', url: ''})}
                      >
                        <LinkIcon size={14} /> YouTube Link
                      </button>
                      <button 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${formData.type === 'upload' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setFormData({...formData, type: 'upload', url: ''})}
                      >
                        <Upload size={14} /> Upload Video
                      </button>
                    </div>

                    {formData.type === 'youtube' ? (
                      <input 
                        type="text" 
                        placeholder="Paste YouTube URL here..." 
                        className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors">
                        {formData.url ? (
                          <div className="text-green-600 flex items-center justify-center gap-2">
                            <VideoIcon size={16} />
                            <span className="text-sm font-medium">Video uploaded successfully</span>
                            <button onClick={() => setFormData({...formData, url: ''})} className="text-xs underline text-gray-500 ml-2">Change</button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            {isUploading ? (
                              <div className="flex items-center justify-center gap-2 text-gray-500">
                                <Loader2 className="animate-spin" size={16} /> Uploading...
                              </div>
                            ) : (
                              <>
                                <span className="text-blue-600 text-sm font-medium">Click to upload video</span>
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-black focus:ring-black"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        />
                        <span className="text-sm font-medium text-gray-700">Set as Featured Video</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 pl-6">Featured video will be displayed on the homepage.</p>
                   </div>
                   
                   {/* Preview */}
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                      <div className="aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center text-gray-500 bg-gray-100">
                         {formData.url ? (
                            formData.type === 'youtube' ? (
                              getYouTubeId(formData.url) ? (
                                <img 
                                  src={`https://img.youtube.com/vi/${getYouTubeId(formData.url)}/hqdefault.jpg`} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : <span className="text-xs">Invalid YouTube URL</span>
                            ) : (
                              <video src={formData.url} controls className="w-full h-full" />
                            )
                         ) : (
                            <span className="text-xs">No video selected</span>
                         )}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">Cancel</button>
                <button onClick={handleSubmit} disabled={!formData.url} className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {editingVideo ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </div>
          )}

          {filteredVideos.length === 0 ? (
             <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                {searchQuery ? 'No videos match your search.' : 'No videos found. Add one to get started.'}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                <div key={video.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                     <div className="absolute top-2 left-2 z-10">
                        <input 
                            type="checkbox" 
                            checked={selectedVideos.includes(video.id)}
                            onChange={() => handleSelectOne(video.id)}
                            className="rounded border-gray-300 text-black focus:ring-black h-4 w-4 bg-white/80 backdrop-blur-sm shadow-sm cursor-pointer"
                        />
                     </div>
                     <div className="aspect-video bg-black flex items-center justify-center relative">
                        {video.type === 'youtube' ? (
                            <img src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/default.jpg`} alt={video.title} className="w-full h-full object-cover opacity-70" />
                        ) : (
                            <video src={video.url} className="w-full h-full object-cover opacity-70" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                <VideoIcon className="text-white" size={24} />
                            </div>
                        </div>
                     </div>
                     <div className="p-3">
                     <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm truncate flex-1">{video.title}</h3>
                        {video.isFeatured && (
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-medium">Featured</span>
                        )}
                     </div>
                     <p className="text-xs text-gray-500">{video.date}</p>
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(video)} className="text-gray-500 hover:text-black p-1">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="text-gray-500 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
