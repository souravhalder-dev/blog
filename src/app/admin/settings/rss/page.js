 'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Trash2, Copy, RefreshCcw } from 'lucide-react';

export default function RssSitemapSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [siteUrl, setSiteUrl] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [feedsRes, genRes, catsRes] = await Promise.all([
          fetch('/api/rss/feeds', { cache: 'no-store' }),
          fetch('/api/settings/general', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
        ]);
        const feedsData = await feedsRes.json();
        const gen = await genRes.json();
        const cats = await catsRes.json();
        setSiteUrl(gen.siteUrl || '');
        setFeeds(feedsData.feeds || []);
        setCategories(cats || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const addFeed = () => setFeeds([...feeds, '']);
  const updateFeed = (i, v) => setFeeds(feeds.map((f, idx) => (idx === i ? v : f)));
  const removeFeed = (i) => setFeeds(feeds.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/rss/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeds }),
      });
      alert('Saved');
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const runAggregator = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/rss/aggregate', { cache: 'no-store' });
      const data = await res.json();
      alert(`Import complete: ${data.imported} imported, ${data.skipped} skipped.`);
    } catch {
      alert('Aggregator failed');
    } finally {
      setRunning(false);
    }
  };

  const origin = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const sitemapUrl = `${origin.replace(/\/+$/, '')}/sitemap.xml`;
  const mainRssUrl = `${origin.replace(/\/+$/, '')}/rss`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied');
    } catch {}
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">RSS & Sitemap</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-2">Sitemap</h2>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
            <span className="text-sm truncate">{sitemapUrl}</span>
            <button onClick={() => copy(sitemapUrl)} className="text-gray-600 hover:text-black p-1"><Copy size={16} /></button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Submit this URL to Google Search Console and Bing Webmaster.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-2">Main RSS</h2>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
            <span className="text-sm truncate">{mainRssUrl}</span>
            <button onClick={() => copy(mainRssUrl)} className="text-gray-600 hover:text-black p-1"><Copy size={16} /></button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Use this feed for newsletter services and syndication.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Category Feeds</h2>
          <Link href="/admin/categories" className="text-sm underline">Manage Categories</Link>
        </div>
        {categories.length === 0 ? (
          <div className="text-sm text-gray-500">No categories found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {categories.map(c => {
              const url = `${origin.replace(/\/+$/, '')}/rss/${c.slug}`;
              return (
                <div key={c.id || c._id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                  <span className="text-sm truncate">{url}</span>
                  <button onClick={() => copy(url)} className="text-gray-600 hover:text-black p-1"><Copy size={16} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">RSS Aggregator Feeds</h2>
          <button onClick={addFeed} className="text-sm inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
            <Plus size={14} /> Add Feed
          </button>
        </div>
        <div className="space-y-3">
          {feeds.length === 0 && <div className="text-sm text-gray-500">No feeds added yet.</div>}
          {feeds.map((f, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                value={f}
                onChange={e => updateFeed(idx, e.target.value)}
                placeholder="https://example.com/feed"
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />
              <button onClick={() => removeFeed(idx)} className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={runAggregator} disabled={running} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50">
            {running ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />} Run Aggregator
          </button>
          <button onClick={save} disabled={saving} className="bg-black text-white px-4 py-2 rounded-md inline-flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : null} Save Feeds
          </button>
        </div>
      </div>
    </div>
  );
}

