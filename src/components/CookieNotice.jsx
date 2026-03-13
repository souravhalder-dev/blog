'use client';
import { useEffect, useState } from 'react';

export default function CookieNotice() {
  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('cookie_consent');
    }
    return false;
  });
  const [text, setText] = useState('This website uses cookies to enhance the user experience.');

  useEffect(() => {
    if (!open) return;
    fetch('/api/settings/general', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data?.cookieNoticeText) setText(data.cookieNoticeText);
      })
      .catch(() => {});
  }, [open]);

  function accept() {
    localStorage.setItem('cookie_consent', '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-5xl bg-black text-white rounded-t-lg p-4 md:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <p className="text-sm opacity-90">{text}</p>
          <button onClick={accept} className="bg-white text-black px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
