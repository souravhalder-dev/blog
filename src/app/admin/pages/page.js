
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, Eye, Loader2, File } from 'lucide-react';

export default function PagesAdmin() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages')
      .then(res => res.json())
      .then(data => {
        setPages(data);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await fetch(`/api/pages/${id}`, { method: 'DELETE' });
        setPages(pages.filter(p => p._id !== id));
      } catch (error) {
        console.error(error);
        alert('Failed to delete page');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link 
          href="/admin/pages/new" 
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={16} /> New Page
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No pages found. Create one to get started.
                    </td>
                </tr>
              ) : (
                pages.map((page) => (
                    <tr key={page._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                        <File size={16} className="text-gray-400" />
                        {page.title}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">/{page.slug}</td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {page.isPublished ? 'Published' : 'Draft'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link href={`/${page.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600 p-1">
                            <Eye size={16} />
                        </Link>
                        <Link href={`/admin/pages/${page._id}`} className="text-blue-600 hover:text-blue-900 p-1">
                            <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(page._id)} className="text-red-600 hover:text-red-900 p-1">
                            <Trash2 size={16} />
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
