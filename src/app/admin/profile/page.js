
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, User, Camera } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    photo: '',
    password: '', // Only for updating
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserData(parsedUser._id);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchUserData = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          description: data.description || '',
          photo: data.photo || '',
          password: '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
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

      if (res.ok) {
        const json = await res.json();
        setFormData(prev => ({ ...prev, photo: json.url }));
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedUser = await res.json();
      
      // Update local storage
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      alert('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field
    } catch (error) {
      console.error(error);
      alert('Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
           <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-4 border border-gray-200">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                   <User size={40} />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                   <Loader2 size={20} className="animate-spin" />
                </div>
              )}
           </div>
           <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
              <Camera size={14} /> Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
           </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            type="text" 
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-gray-50 text-gray-500 cursor-not-allowed"
            value={formData.email}
            readOnly
            title="Email cannot be changed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
          <textarea 
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
           <h3 className="text-sm font-bold mb-4">Change Password</h3>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
             <input 
               type="password" 
               className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
               placeholder="New password"
             />
           </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
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
