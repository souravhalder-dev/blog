
'use client';
import Link from 'next/link';
import { Menu, Search, User, X, Facebook, Twitter, Instagram } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState([]);
  const [user] = useState(() => {
    if (typeof document !== 'undefined') {
      const hasAuthCookie = document.cookie.split(';').some(item => item.trim().startsWith('auth='));
      if (hasAuthCookie) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try { return JSON.parse(storedUser); } catch {}
        }
      }
    }
    return null;
  });
  const [site, setSite] = useState({ title: 'SOURAV HALDER', logo: '' });
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  // Handle scroll effect for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load general settings for logo/title
  useEffect(() => {
    fetch('/api/settings/general', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setSite({ title: d.siteTitle || 'SOURAV HALDER', logo: d.siteLogoUrl || '' }))
      .catch(() => {});
  }, []);

  // Fetch menu categories
  useEffect(() => {
    fetch('/api/categories?menuOnly=true')
      .then(res => res.json())
      .then(data => {
        // Map categories to nav link format
        const links = data.map(cat => ({
            name: cat.name,
            href: `/category/${cat.slug}`
        }));
        
        // Add static links if needed (like Photos/Videos) - optional based on requirement
        // For now, let's keep Photos and Videos as static or maybe they should be categories too?
        // User asked to "add section category and remove", implying total control.
        // But Photos/Videos are specific pages. Let's append them for now or assume admin will create them as categories if they want.
        // To be safe and keep existing functionality, I will append Photos and Videos if they are not in the list.
        
        setNavLinks([
            ...links,
            { name: 'Photos', href: '/photos' },
            { name: 'Videos', href: '/videos' }
        ]);
      })
      .catch(err => console.error('Failed to fetch menu categories', err));
  }, []);

  return (
    <header className="font-sans relative bg-white">
      {/* Top Utility Bar */}
      <div className="border-b border-gray-100 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs font-medium tracking-wider text-gray-500">
          <div className="hidden md:block">{today}</div>
          <div className="flex items-center gap-4 mx-auto md:mx-0">
             <a href="#" aria-label="Twitter" className="hover:text-black transition-colors"><Twitter size={14} /></a>
             <a href="#" aria-label="Facebook" className="hover:text-black transition-colors"><Facebook size={14} /></a>
             <a href="#" aria-label="Instagram" className="hover:text-black transition-colors"><Instagram size={14} /></a>
             <span className="w-px h-3 bg-gray-300 mx-2"></span>
             {user ? (
                <Link href="/admin" className="text-black font-bold hover:underline">Admin Dashboard</Link>
             ) : (
                <Link href="/login" className="hover:text-black transition-colors">Sign In</Link>
             )}
             <Link href="/subscribe" className="text-red-600 hover:text-red-700 transition-colors font-bold">Subscribe</Link>
          </div>
        </div>
      </div>
      
      {/* Main Logo Area */}
      <div className="py-6 md:py-8 text-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
            <span className="text-[8rem] font-serif font-black">SH</span>
        </div>

        <Link href="/" className="relative z-10 inline-block group">
          {site.logo ? (
            <img src={site.logo} alt={site.title} className="h-12 md:h-16 mx-auto" />
          ) : (
            <>
              <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tighter leading-none mb-1 group-hover:opacity-90 transition-opacity">
                {site.title}
              </h1>
              <div className="h-0.5 w-16 bg-black mx-auto mt-2 mb-1 group-hover:w-full transition-all duration-500 ease-out"></div>
              <p className="text-xs md:text-sm font-serif italic text-gray-500 tracking-widest uppercase">The Writer&rsquo;s Chronicle</p>
            </>
          )}
        </Link>
      </div>

      {/* Navigation Bar */}
      <div className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md py-2' : 'border-t border-b border-black py-4'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-1 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center justify-center gap-8 w-full">
                <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-red-600 transition-colors relative group">
                    Home
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
                </Link>
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-xs font-bold uppercase tracking-[0.2em] hover:text-red-600 transition-colors relative group">
                        {link.name}
                        <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
                    </Link>
                ))}
            </nav>

            {/* Search Icon (Always visible) */}
            <div className="md:absolute md:right-4 flex items-center">
                {isSearchOpen && (
                    <form onSubmit={handleSearch} className="mr-2" aria-label="Site search">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="border-b border-black px-2 py-1 text-sm focus:outline-none"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search"
                        />
                    </form>
                )}
                <button 
                    className="p-1 hover:text-red-600 transition-colors"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                >
                    {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
            </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden pt-24 px-8`}>
          <nav className="flex flex-col gap-6 text-center">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif font-bold hover:text-red-600">Home</Link>
            {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif font-bold hover:text-red-600">
                    {link.name}
                </Link>
            ))}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                {user ? (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Admin Dashboard</Link>
                ) : (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Sign In</Link>
                )}
                <Link href="/subscribe" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-red-600">Subscribe</Link>
            </div>
          </nav>
      </div>
    </header>
  );
}
