
'use client';
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Check, Loader2 } from 'lucide-react';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', showInMenu: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // We need to create this API
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newCategory.name && newCategory.slug) {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCategory),
        });
        if (res.ok) {
          const addedCategory = await res.json();
          setCategories([...categories, addedCategory]);
          setIsAdding(false);
          setNewCategory({ name: '', slug: '', showInMenu: true });
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleToggleMenu = async (category) => {
    try {
      const updated = { ...category, showInMenu: !category.showInMenu };
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      
      if (res.ok) {
        setCategories(categories.map(c => c._id === category._id ? updated : c));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        setCategories(categories.filter(c => c._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={16} /> New Category
        </button>
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
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">In Menu</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleToggleMenu(category)}
                      className={`px-2 py-1 rounded text-xs font-bold ${category.showInMenu ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {category.showInMenu ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-900 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {isAdding && (
                 <tr className="bg-blue-50">
                    <td className="px-6 py-4">
                       <input 
                         type="text" 
                         placeholder="Category Name" 
                         className="border border-gray-300 px-2 py-1 rounded w-full"
                         value={newCategory.name}
                         onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                       />
                    </td>
                    <td className="px-6 py-4">
                       <input 
                         type="text" 
                         placeholder="slug" 
                         className="border border-gray-300 px-2 py-1 rounded w-full"
                         value={newCategory.slug}
                         onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                       />
                    </td>
                    <td className="px-6 py-4 text-center">
                       <input 
                         type="checkbox" 
                         checked={newCategory.showInMenu}
                         onChange={(e) => setNewCategory({...newCategory, showInMenu: e.target.checked})}
                       />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <button onClick={handleAdd} className="text-green-600 hover:text-green-900 p-1">
                         <Check size={16} />
                       </button>
                       <button onClick={() => setIsAdding(false)} className="text-gray-600 hover:text-gray-900 p-1">
                         <X size={16} />
                       </button>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
