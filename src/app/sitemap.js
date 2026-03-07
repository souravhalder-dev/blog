
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Video from '@/models/Video';
import Photo from '@/models/Photo';
import Page from '@/models/Page';

const baseUrl = 'http://localhost:3000'; // In production, this should be your actual domain

export default async function sitemap() {
  await dbConnect();

  const articles = await Article.find({}, { slug: 1, updatedAt: 1 }).lean();
  const pages = await Page.find({ isPublished: true }, { slug: 1, updatedAt: 1 }).lean();
  const videos = await Video.find({}, { updatedAt: 1 }).lean();
  const photos = await Photo.find({}, { updatedAt: 1 }).lean();

  const routes = [
    '',
    '/videos',
    '/photos',
    '/search',
    '/login',
    '/subscribe',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const pageRoutes = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...routes, ...articleRoutes, ...pageRoutes];
}
