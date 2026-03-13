export function optimizeCdn(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes('res.cloudinary.com') && u.pathname.includes('/upload/')) {
      u.pathname = u.pathname.replace('/upload/', '/upload/f_auto,q_auto/');
      return u.toString();
    }
  } catch {}
  return url;
}

