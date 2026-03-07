
'use client';

import { useState } from 'react';
import { Download, Database, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function BackupPage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBackup = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/backup');
      if (!response.ok) throw new Error('Backup failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `writer-chronicle-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download backup. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Backup</h1>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start gap-4 mb-6">
           <div className="p-3 bg-blue-50 rounded-full">
              <Database className="text-blue-600" size={32} />
           </div>
           <div>
              <h2 className="text-lg font-bold mb-2">Export All Data</h2>
              <p className="text-gray-600 mb-4">
                 Download a complete JSON backup of your database. This includes all articles, categories, pages, users, subscribers, photos, and videos.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 flex gap-3">
                 <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                 <p className="text-sm text-yellow-800">
                    <strong>Security Note:</strong> The backup file contains sensitive data (like user emails and hashed passwords). Store this file securely and do not share it publicly.
                 </p>
              </div>

              <button 
                onClick={handleBackup}
                disabled={isDownloading}
                className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2"
              >
                {isDownloading ? (
                    <>Processing...</>
                ) : (
                    <>
                        <Download size={20} /> Download Backup
                    </>
                )}
              </button>
           </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6 mt-6">
           <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" /> 
              Backup Contents
           </h3>
           <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <li>• Articles & Blog Posts</li>
              <li>• Pages & Content</li>
              <li>• Categories</li>
              <li>• User Accounts</li>
              <li>• Subscribers List</li>
              <li>• Photo Gallery Data</li>
              <li>• Video Gallery Data</li>
              <li>• Site Settings</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
