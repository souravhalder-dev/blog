
export default function robots() {
  const baseUrl = 'http://localhost:3000'; // In production, replace with actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
