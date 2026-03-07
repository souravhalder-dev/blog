
'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('wordpress'); // 'wordpress' or 'blogger'
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [message, setMessage] = useState('');
  const [importStats, setImportStats] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/xml' || selectedFile.name.endsWith('.xml'))) {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    } else {
      alert('Please upload a valid XML file.');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    setMessage('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('platform', platform);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setImportStats(data.stats);
      } else {
        setStatus('error');
        setMessage(data.error || 'Import failed.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Network error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import Content</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Select Platform</h2>
            <div className="flex gap-4">
                <button 
                    onClick={() => setPlatform('wordpress')}
                    className={`flex-1 p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${platform === 'wordpress' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="w-10 h-10 bg-[#21759b] text-white rounded-full flex items-center justify-center font-bold text-xl">W</div>
                    <span className="font-medium">WordPress</span>
                </button>
                <button 
                    onClick={() => setPlatform('blogger')}
                    className={`flex-1 p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${platform === 'blogger' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className="w-10 h-10 bg-[#f57d00] text-white rounded-full flex items-center justify-center font-bold text-xl">B</div>
                    <span className="font-medium">Blogger</span>
                </button>
            </div>
        </div>

        <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Upload XML File</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                    type="file" 
                    accept=".xml"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={status === 'uploading' || status === 'processing'}
                />
                {file ? (
                    <div className="flex flex-col items-center">
                        <FileText size={48} className="text-blue-500 mb-2" />
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        <button 
                            type="button" 
                            onClick={(e) => {
                                e.preventDefault();
                                setFile(null);
                            }}
                            className="text-red-500 text-sm mt-2 hover:underline z-10 relative"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <Upload size={48} className="mb-2" />
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm">XML files only</p>
                    </div>
                )}
            </div>
        </div>

        {status === 'success' && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-green-900">Import Successful!</h3>
                    <p className="text-green-700 text-sm">{message}</p>
                    {importStats && (
                        <ul className="mt-2 text-sm text-green-800 list-disc list-inside">
                            <li>Articles imported: {importStats.imported}</li>
                            <li>Skipped (duplicates): {importStats.skipped}</li>
                            <li>Failed: {importStats.failed}</li>
                        </ul>
                    )}
                </div>
            </div>
        )}

        {status === 'error' && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-red-900">Import Failed</h3>
                    <p className="text-red-700 text-sm">{message}</p>
                </div>
            </div>
        )}

        <div className="flex justify-end">
            <button 
                onClick={handleImport}
                disabled={!file || status === 'uploading' || status === 'processing'}
                className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {status === 'uploading' || status === 'processing' ? (
                    <>
                        <Loader2 className="animate-spin" size={18} /> Processing...
                    </>
                ) : (
                    'Start Import'
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
