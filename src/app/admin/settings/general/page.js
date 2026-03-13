 'use client';
import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteTitle: '',
    siteDescription: '',
    siteLogoUrl: '',
    faviconUrl: '',
    siteUrl: '',
    cookieNoticeText: '',
    maintenanceMode: false,
    sliderEnabled: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/general', { cache: 'no-store' });
        const data = await res.json();
        setForm(prev => ({ ...prev, ...data }));
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      alert('Settings saved');
    } catch (e) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">General Settings</h1>
      <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium mb-1">Site Title</label>
          <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.siteTitle} onChange={e=>setForm({...form, siteTitle:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Site Description</label>
          <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} value={form.siteDescription} onChange={e=>setForm({...form, siteDescription:e.target.value})} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.siteLogoUrl} onChange={e=>setForm({...form, siteLogoUrl:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Favicon URL</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.faviconUrl} onChange={e=>setForm({...form, faviconUrl:e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Site URL (https://example.com)</label>
          <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.siteUrl} onChange={e=>setForm({...form, siteUrl:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cookie Notice Text</label>
          <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows={2} value={form.cookieNoticeText} onChange={e=>setForm({...form, cookieNoticeText:e.target.value})} />
        </div>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.maintenanceMode} onChange={e=>setForm({...form, maintenanceMode:e.target.checked})} />
            <span>Enable Maintenance Mode</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.sliderEnabled} onChange={e=>setForm({...form, sliderEnabled:e.target.checked})} />
            <span>Enable Homepage Slider</span>
          </label>
        </div>
        <button type="submit" disabled={saving} className="bg-black text-white px-4 py-2 rounded-md inline-flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}

