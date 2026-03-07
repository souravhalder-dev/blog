
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Image as ImageIcon, Save, ChevronDown, ChevronRight, Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';

export default function NewArticle() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    image: '',
    isFeatured: false,
    status: 'published',
    author: 'Sourav Halder', // Default author
    date: new Date().toISOString().split('T')[0],
  });
  const [uploading, setUploading] = useState(false);
  
  // Editor Toolbar State
  const [showEditor, setShowEditor] = useState(true);
  // UI State for collapsible sections
  const [sections, setSections] = useState({
    gallery: false,
    seo: true
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Insert image into content at cursor or end
  const insertImage = (url) => {
    const imgTag = `<img src="${url}" alt="Article Image" class="w-full h-auto rounded-lg my-4" />`;
    setFormData(prev => ({ ...prev, content: prev.content + '\n' + imgTag }));
  };

  const handleEditorUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      insertImage(json.url);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInsert = () => {
    const url = prompt("Enter image URL:");
    if (url) insertImage(url);
  };

  useEffect(() => {
    // Fetch categories for the dropdown
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      })
      .catch(err => console.error('Failed to fetch categories', err));
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title) {
        // Simple slug generation that preserves Unicode characters (for Bengali etc)
        const slug = formData.title
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/-+/g, '-');     // Replace multiple - with single -
            
        setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.category) {
        alert('Please select a category');
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to create article');

      router.push('/admin/articles');
      router.refresh(); // Refresh server components
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      
      setFormData(prev => ({
        ...prev,
        image: json.url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Name"
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Permalink */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permalink <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="slug"
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  value={formData.slug}
                  onChange={handleChange}
                />
                <p className="text-xs text-blue-500 mt-1">Preview: https://your-site.com/article/{formData.slug}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="summary"
                  placeholder="Short description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  value={formData.summary}
                  onChange={handleChange}
                />
                <div className="flex justify-end">
                   <span className="text-gray-400 text-xs">/</span>
                </div>
              </div>

              {/* Content Editor Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  {/* Fake Toolbar */}
                  <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2 items-center">
                     <button type="button" onClick={() => setShowEditor(!showEditor)} className="p-1 hover:bg-gray-200 rounded text-gray-600 font-medium text-sm px-2 border border-gray-300 bg-white">
                        {showEditor ? 'Hide Editor' : 'Show Editor'}
                     </button>
                     <div className="relative inline-block">
                        <label className="p-1 hover:bg-gray-200 rounded text-gray-600 font-medium text-sm px-2 border border-gray-300 bg-white flex items-center gap-1 cursor-pointer">
                           <ImageIcon size={14}/> Add media
                           <input type="file" className="hidden" onChange={handleEditorUpload} accept="image/*" />
                        </label>
                     </div>
                     <button type="button" onClick={handleUrlInsert} className="p-1 hover:bg-gray-200 rounded text-gray-600 font-medium text-sm px-2 border border-gray-300 bg-white flex items-center gap-1">
                        <Link size={14}/> URL
                     </button>
                     <div className="h-4 w-px bg-gray-300 mx-1"></div>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Bold size={16}/></button>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Italic size={16}/></button>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Underline size={16}/></button>
                     <div className="h-4 w-px bg-gray-300 mx-1"></div>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={16}/></button>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignCenter size={16}/></button>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignRight size={16}/></button>
                     <div className="h-4 w-px bg-gray-300 mx-1"></div>
                     <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Link size={16}/></button>
                  </div>
                  <textarea 
                    name="content"
                    rows={12}
                    className="w-full p-4 focus:outline-none font-mono text-sm"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your article content here..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Images (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <button 
               type="button"
               onClick={() => toggleSection('gallery')}
               className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 text-left"
             >
                <span className="font-medium text-gray-700">Gallery images</span>
                {sections.gallery ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />}
             </button>
             {sections.gallery && (
                 <div className="p-6 border-t border-gray-200">
                    <p className="text-sm text-blue-500 cursor-pointer">Select images</p>
                 </div>
             )}
          </div>

          {/* SEO (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <button 
               type="button"
               onClick={() => toggleSection('seo')}
               className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 text-left"
             >
                <span className="font-medium text-gray-700">Search Engine Optimize</span>
                <span className="text-xs text-blue-500">Edit SEO meta</span>
             </button>
             {sections.seo && (
                 <div className="p-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Setup meta title & description to make your site easy to discovered on search engines such as Google</p>
                 </div>
             )}
          </div>

        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Publish Card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">Publish</h3>
             <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                <button 
                  type="button"
                  onClick={() => router.push('/admin/articles')}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} /> & Exit
                </button>
             </div>
          </div>

          {/* Status Card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">Status <span className="text-red-500">*</span></h3>
             <select 
               name="status" 
               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={formData.status}
               onChange={handleChange}
             >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
             </select>
          </div>

           {/* Category Card (Moved from main form to sidebar for better UX, though not strictly in screenshot, it fits 'Template' or similar slot) */}
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">Category <span className="text-red-500">*</span></h3>
             <select 
               name="category"
               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={formData.category}
               onChange={handleChange}
             >
               <option value="" disabled>Select a category</option>
               {categories.map(cat => (
                 <option key={cat._id} value={cat.name}>{cat.name}</option>
               ))}
             </select>
          </div>

          {/* Feature Card */}
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">Featured</h3>
             <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    name="isFeatured"
                    id="isFeatured"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">Feature on homepage</label>
             </div>
          </div>

          {/* Image Card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">Image</h3>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                {formData.image ? (
                    <div className="relative">
                        <img src={formData.image} alt="Preview" className="w-full h-auto rounded-md" />
                        <button 
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, image: ''}))}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-red-500"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="py-8">
                        <div className="mx-auto w-12 h-12 text-gray-400 mb-2">
                            <ImageIcon size={48} strokeWidth={1} />
                        </div>
                        <p className="text-sm text-blue-500 font-medium">Choose image</p>
                        <p className="text-xs text-gray-400">or Add from URL</p>
                    </div>
                )}
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
             </div>
             {uploading && <p className="text-xs text-center text-blue-500 mt-2">Uploading...</p>}
          </div>

        </div>

      </form>
    </div>
  );
}
