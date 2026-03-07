
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100"
      >
        <div className="text-center">
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
             className="mx-auto h-16 w-16 bg-black text-white rounded-full flex items-center justify-center mb-4"
          >
             <Mail size={32} />
          </motion.div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 font-serif">
            Join the Newsletter
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Get the latest stories, essays, and updates delivered straight to your inbox. No spam, just words.
          </p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900">Subscribed!</h3>
            <p className="mt-2 text-sm text-green-700">
              {message}
            </p>
            <button 
              onClick={() => {
                  setStatus('idle');
                  setEmail('');
              }}
              className="mt-4 text-sm font-medium text-green-700 hover:text-green-600 underline"
            >
                Subscribe another email
            </button>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm transition-all"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            {status === 'error' && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                    {message}
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 transition-colors"
              >
                {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} /> Subscribing...
                    </span>
                ) : (
                    'Subscribe'
                )}
              </button>
            </div>
            
            <p className="text-xs text-center text-gray-400">
                By subscribing, you agree to receive emails from me. You can unsubscribe at any time.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
