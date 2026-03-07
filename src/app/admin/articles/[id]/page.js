
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditArticle({ params }) {
  // Use React.use() to unwrap params in Next.js 15 client components if needed, 
  // but typically params are passed as props. 
  // However, in Client Components in Next.js 15, accessing params might require unwrapping.
  // Let's use the React.use() hook pattern which is the new standard.
  const { id } = use(params);
  
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    isFeatured: false,
    author: '',
    date: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, articleRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/articles/${id}`)
        ]);

        if (!articleRes.ok) {
           throw new Error('Article not found');
        }

        const categoriesData = await categoriesRes.json();
        const articleData = await articleRes.json();

        setCategories(categoriesData);
        setFormData({
          ...articleData,
          // Ensure checkbox boolean is handled
          isFeatured: !!articleData.isFeatured
        });
      } catch (error) {
        console.error(error);
        alert('Error loading data');
        router.push('/admin/articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update article');

      router.push('/admin/articles');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error updating article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Article</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              name="title"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input 
              type="text" 
              name="slug"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              name="category"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
             <input 
               type="date" 
               name="date"
               className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
               value={formData.date}
               onChange={handleChange}
             />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea 
            name="summary"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            value={formData.summary}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
          <textarea 
            name="content"
            rows={15}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
            value={formData.content}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="isFeatured"
            id="isFeatured"
            className="rounded border-gray-300 text-black focus:ring-black"
            checked={formData.isFeatured}
            onChange={handleChange}
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Feature this article on homepage</label>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Update Article
          </button>
        </div>
      </form>
    </div>
  );
}
