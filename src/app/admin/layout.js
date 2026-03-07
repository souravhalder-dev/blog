
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, FolderTree, Image, Video, LogOut, Users, User, File, Settings } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/articles', label: 'Articles', icon: FileText },
    { href: '/admin/pages', label: 'Pages', icon: File },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/settings/homepage', label: 'Homepage Layout', icon: Settings },
    { href: '/admin/settings/seo', label: 'SEO Settings', icon: Settings },
    { href: '/admin/photos', label: 'Photos', icon: Image },
    { href: '/admin/videos', label: 'Videos', icon: Video },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/profile', label: 'Profile', icon: User },
  ];

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
