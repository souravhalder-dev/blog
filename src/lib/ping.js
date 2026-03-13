export async function pingSitemaps(baseUrl) {
  const b = baseUrl.replace(/\/+$/, '');
  const sitemap = `${b}/sitemap.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`
  ];
  await Promise.all(targets.map(u => fetch(u).catch(() => null)));
}

