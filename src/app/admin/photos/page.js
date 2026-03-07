
'use client';
import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, Upload, Link as LinkIcon, Image as ImageIcon, Search, Edit, X } from 'lucide-react';

export default function PhotosAdmin() {
  const [photos, setPhotos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPhoto, setNewPhoto] = useState({ 
    title: '', 
    description: '',
    url: '', 
    date: new Date().toISOString().split('T')[0],
    type: 'url' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setNewPhoto(prev => ({ ...prev, url: data.url }));
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async () => {
    if (newPhoto.title && newPhoto.url) {
      try {
        let res;
        if (editingPhoto) {
          res = await fetch(`/api/photos/${editingPhoto._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPhoto),
          });
        } else {
          res = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPhoto),
          });
        }

        if (res.ok) {
          const savedPhoto = await res.json();
          if (editingPhoto) {
             setPhotos(photos.map(p => p._id === savedPhoto._id ? savedPhoto : p));
          } else {
             setPhotos([savedPhoto, ...photos]);
          }
          resetForm();
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Please provide a title and an image.');
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setNewPhoto({
      title: photo.title,
      description: photo.description || '',
      url: photo.url,
      date: photo.date,
      type: photo.type || 'url'
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingPhoto(null);
    setNewPhoto({ 
      title: '', 
      description: '',
      url: '', 
      date: new Date().toISOString().split('T')[0],
      type: 'url' 
    });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      try {
        await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        setPhotos(photos.filter(p => p._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredPhotos = photos.filter(photo => 
    photo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Photos</h1>
        
        <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Search photos..." 
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
            <Plus size={16} /> Add Photo
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="space-y-6">
          {isAdding && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold">{editingPhoto ? 'Edit Photo' : 'Add New Photo'}</h3>
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
                      placeholder="Photo Title" 
                      className="w-full border border-gray-300 px-3 py-2 rounded-md"
                      value={newPhoto.title}
                      onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                      placeholder="Photo Description" 
                      className="w-full border border-gray-300 px-3 py-2 rounded-md h-24 resize-none"
                      value={newPhoto.description}
                      onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Source</label>
                    <div className="flex gap-4 mb-3">
                      <button 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${newPhoto.type === 'url' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setNewPhoto({...newPhoto, type: 'url', url: ''})}
                      >
                        <LinkIcon size={14} /> Image URL
                      </button>
                      <button 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${newPhoto.type === 'upload' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setNewPhoto({...newPhoto, type: 'upload', url: ''})}
                      >
                        <Upload size={14} /> Upload Image
                      </button>
                    </div>

                    {newPhoto.type === 'url' ? (
                      <input 
                        type="text" 
                        placeholder="Paste Image URL here..." 
                        className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        value={newPhoto.url}
                        onChange={(e) => setNewPhoto({...newPhoto, url: e.target.value})}
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors">
                        {newPhoto.url ? (
                          <div className="text-green-600 flex items-center justify-center gap-2">
                            <ImageIcon size={16} />
                            <span className="text-sm font-medium">Image uploaded successfully</span>
                            <button onClick={() => setNewPhoto({...newPhoto, url: ''})} className="text-xs underline text-gray-500 ml-2">Change</button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            {isUploading ? (
                              <div className="flex items-center justify-center gap-2 text-gray-500">
                                <Loader2 className="animate-spin" size={16} /> Uploading...
                              </div>
                            ) : (
                              <>
                                <span className="text-blue-600 text-sm font-medium">Click to upload image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
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
                        value={newPhoto.date}
                        onChange={(e) => setNewPhoto({...newPhoto, date: e.target.value})}
                      />
                   </div>
                   
                   {/* Preview */}
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                      <div className="aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center text-gray-500 border border-gray-200">
                         {newPhoto.url ? (
                            <img src={newPhoto.url} alt="Preview" className="w-full h-full object-cover" />
                         ) : (
                            <span className="text-xs">No image selected</span>
                         )}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">Cancel</button>
                <button onClick={handleAdd} disabled={!newPhoto.url} className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {editingPhoto ? 'Update Photo' : 'Save Photo'}
                </button>
              </div>
            </div>
          )}

          {filteredPhotos.length === 0 ? (
             <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                {searchQuery ? 'No photos match your search.' : 'No photos found. Add one to get started.'}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((photo) => (
                <div key={photo._id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs relative">
                        {photo.url ? <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" /> : 'No Image'}
                        
                        {/* Type Badge */}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded text-white ${photo.type === 'upload' ? 'bg-blue-600' : 'bg-black'}`}>
                            {photo.type === 'upload' ? 'Upload' : 'Link'}
                        </span>
                    </div>
                    <div className="p-3">
                    <h3 className="font-bold text-sm truncate">{photo.title}</h3>
                    <p className="text-xs text-gray-500">{photo.date}</p>
                 </div>
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                        onClick={() => handleEdit(photo)}
                        className="bg-white p-1.5 rounded-full text-blue-600 shadow-sm hover:bg-blue-50"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                    <button 
                        onClick={() => handleDelete(photo._id)}
                        className="bg-white p-1.5 rounded-full text-red-600 shadow-sm hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 size={14} />
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
