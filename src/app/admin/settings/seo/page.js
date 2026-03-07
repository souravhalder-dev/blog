
'use client';
import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';

export default function SeoSettings() {
  const [googleVerification, setGoogleVerification] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/seo')
      .then(res => res.json())
      .then(data => {
        setGoogleVerification(data.googleVerification || '');
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleVerification }),
      });
      if (res.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SEO Settings</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Site Verification Code</label>
          <p className="text-xs text-gray-500 mb-2">
            Enter the verification code from Google Search Console (e.g., the value of the content attribute in the meta tag).
          </p>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="e.g. 45J8..."
            value={googleVerification}
            onChange={(e) => setGoogleVerification(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
