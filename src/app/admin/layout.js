
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, FolderTree, Image, Video, LogOut, Users, User, File, Settings, Import, Database } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [userRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { return JSON.parse(stored).role; } catch {}
      }
    }
    return null;
  });

  const allNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { href: '/admin/articles', label: 'Articles', icon: FileText, roles: ['admin'] },
    { href: '/admin/pages', label: 'Pages', icon: File, roles: ['admin'] },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree, roles: ['admin'] },
    { href: '/admin/settings/general', label: 'General Settings', icon: Settings, roles: ['admin'] },
    { href: '/admin/settings/homepage', label: 'Homepage Layout', icon: Settings, roles: ['admin'] },
    { href: '/admin/settings/seo', label: 'SEO Settings', icon: Settings, roles: ['admin'] },
    { href: '/admin/settings/rss', label: 'RSS & Sitemap', icon: Settings, roles: ['admin'] },
    { href: '/admin/import', label: 'Import Content', icon: Import, roles: ['admin'] },
    { href: '/admin/backup', label: 'Backup', icon: Database, roles: ['admin'] },
    { href: '/admin/photos', label: 'Photos', icon: Image, roles: ['admin'] },
    { href: '/admin/videos', label: 'Videos', icon: Video, roles: ['admin'] },
    { href: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
    { href: '/admin/profile', label: 'Profile', icon: User, roles: ['admin', 'user'] },
  ];

  // If role is not loaded yet, maybe show nothing or just Profile?
  // Let's filter items.
  const navItems = allNavItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold font-serif">Writer Admin</h2>
          <p className="text-xs text-gray-400 mt-1">Sourav Halder</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = pathname === item.href;
             return (
               <Link 
                 key={item.href} 
                 href={item.href}
                 className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                 }`}
               >
                 <Icon size={18} />
                 {item.label}
               </Link>
             );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900 rounded-md text-sm">
             <LogOut size={18} />
             Exit to Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
