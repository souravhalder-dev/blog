import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function getBaseUrl(h) {
  await dbConnect();
  const s = await Settings.findOne({ key: 'site_url' });
  let base = (s?.value || '').toString().trim();
  if (!base && h) {
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    base = `${proto}://${host}`;
  }
  return base.replace(/\/+$/, '');
}

