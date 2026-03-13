import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const base = await getBaseUrl(headers());
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

