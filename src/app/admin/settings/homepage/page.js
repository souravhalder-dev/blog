
'use client';
import { useState, useEffect } from 'react';
import { Loader2, Save, Eye, EyeOff, MoveUp, MoveDown, Plus, Trash2 } from 'lucide-react';

export default function HomepageSettings() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    type: 'category',
    categorySlug: ''
  });

  useEffect(() => {
    Promise.all([
        fetch('/api/settings/homepage').then(res => res.json()),
        fetch('/api/categories').then(res => res.json())
    ])
      .then(([sectionsData, categoriesData]) => {
        setSections(sectionsData);
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
            setNewSection(prev => ({ ...prev, categorySlug: categoriesData[0].slug }));
        }
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddSection = async () => {
    if (!newSection.title || !newSection.categorySlug) return;

    const payload = {
        section: `category_${newSection.categorySlug}_${Date.now()}`, // Unique ID
        title: newSection.title,
        type: 'category',
        categorySlug: newSection.categorySlug,
        isVisible: true
    };

    try {
        const res = await fetch('/api/settings/homepage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const added = await res.json();
            setSections([...sections, added]);
            setIsAdding(false);
            setNewSection({ ...newSection, title: '' });
        } else {
            // Log error from server if needed
            const error = await res.json();
            console.error('Failed to add section:', error);
            alert('Failed to add section: ' + (error.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('Failed to add section: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this section?')) return;
    try {
        await fetch(`/api/settings/homepage?id=${id}`, { method: 'DELETE' });
        setSections(sections.filter(s => s._id !== id));
    } catch (err) {
        console.error(err);
    }
  };

  const handleToggleVisibility = async (section) => {
    const updated = { ...section, isVisible: !section.isVisible };
    try {
      await fetch('/api/settings/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setSections(sections.map(s => s._id === section._id ? updated : s));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + (direction === 'up' ? -1 : 1)];
    newSections[index + (direction === 'up' ? -1 : 1)] = temp;

    // Update orders locally
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);

    // Persist changes
    try {
      await Promise.all(reordered.map(s => 
        fetch('/api/settings/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
        })
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Homepage Sections</h1>
          <p className="text-gray-600">Manage the visibility and order of sections on the homepage.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={16} /> Add Category Section
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-bold mb-4">Add New Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Section Title</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="e.g. World News"
                        value={newSection.title}
                        onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Category Source</label>
                    <select 
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={newSection.categorySlug}
                        onChange={(e) => setNewSection({...newSection, categorySlug: e.target.value})}
                    >
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                <button onClick={handleAddSection} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Section</button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Section Name</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Visibility</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Order</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sections.map((section, index) => (
              <tr key={section._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                  {section.title || section.section.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                  {section.type || 'static'}
                  {section.type === 'category' && <span className="text-xs ml-1 text-gray-400">({section.categorySlug})</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleToggleVisibility(section)}
                    className={`p-2 rounded-full ${section.isVisible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {section.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button 
                    disabled={index === sections.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <MoveDown size={16} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                    {section.type === 'category' && (
                        <button onClick={() => handleDelete(section._id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16} />
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
