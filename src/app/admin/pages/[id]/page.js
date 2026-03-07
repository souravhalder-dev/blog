
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: true,
  });

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.json();
      })
      .then(data => {
        setFormData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        router.push('/admin/pages');
      });
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update page');

      router.push('/admin/pages');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error updating page');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/pages" className="text-gray-500 hover:text-black">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Edit Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            type="text" 
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">/</span>
            <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
          <textarea 
            required
            rows={15}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isPublished"
            className="rounded border-gray-300 text-black focus:ring-black"
            checked={formData.isPublished}
            onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Publish immediately</label>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <Link href="/admin/pages" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
