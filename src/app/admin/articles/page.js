
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, Loader2, Search } from 'lucide-react';

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticles, setSelectedArticles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
          fetch('/api/articles'),
          fetch('/api/categories')
      ]);
      
      const articlesData = await articlesRes.json();
      const categoriesData = await categoriesRes.json();

      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await fetch(`/api/articles/${id}`, { method: 'DELETE' });
        setArticles(articles.filter(a => (a._id || a.id) !== id));
        setSelectedArticles(selectedArticles.filter(sid => sid !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) {
        try {
            // Delete one by one (or implement bulk API)
            // For simplicity in this demo, parallel requests
            await Promise.all(selectedArticles.map(id => 
                fetch(`/api/articles/${id}`, { method: 'DELETE' })
            ));
            
            setArticles(articles.filter(a => !selectedArticles.includes(a.id)));
            setSelectedArticles([]);
        } catch (error) {
            console.error('Error deleting articles:', error);
            alert('Failed to delete some articles.');
        }
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (e) => {
      if (e.target.checked) {
          setSelectedArticles(filteredArticles.map(a => a._id || a.id));
      } else {
          setSelectedArticles([]);
      }
  };

  const handleSelectOne = (id) => {
      if (selectedArticles.includes(id)) {
          setSelectedArticles(selectedArticles.filter(sid => sid !== id));
      } else {
          setSelectedArticles([...selectedArticles, id]);
      }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        
        <div className="flex w-full md:w-auto gap-4 items-center">
            {selectedArticles.length > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 flex-shrink-0 text-sm"
                >
                    <Trash2 size={16} /> Delete ({selectedArticles.length})
                </button>
            )}

            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Search articles..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <select 
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                ))}
            </select>

            <Link href="/admin/articles/new" className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 flex-shrink-0">
              <Plus size={16} /> New Article
            </Link>
        </div>
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
                <th className="px-6 py-3 w-4">
                    <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredArticles.length > 0 && selectedArticles.length === filteredArticles.length}
                        className="rounded border-gray-300 text-black focus:ring-black"
                    />
                </th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No articles found matching {searchQuery}
                    </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <input 
                            type="checkbox" 
                        checked={selectedArticles.includes(article._id || article.id)}
                        onChange={() => handleSelectOne(article._id || article.id)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                        />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 text-gray-500">{article.category}</td>
                    <td className="px-6 py-4 text-gray-500">{article.date}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {article.isFeatured ? 'Featured' : 'Published'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link href={`/admin/articles/${article._id || article.id}`} className="text-blue-600 hover:text-blue-900 p-1">
                        <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(article._id || article.id)} className="text-red-600 hover:text-red-900 p-1">
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
