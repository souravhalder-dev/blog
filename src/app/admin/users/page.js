
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Loader2, User, Mail, Shield } from 'lucide-react';

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        console.error(error);
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link 
          href="/admin/users/new" 
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={16} /> New User
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
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                       {user.photo ? (
                          <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                          <User size={16} className="text-gray-500" />
                       )}
                    </div>
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                     <div className="flex items-center gap-2">
                        <Mail size={14} /> {user.email}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user._id)} 
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
