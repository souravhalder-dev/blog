
export const categories = [
  { id: '1', name: 'World', slug: 'world' },
  { id: '2', name: 'Technology', slug: 'technology' },
  { id: '3', name: 'Opinion', slug: 'opinion' },
  { id: '4', name: 'Culture', slug: 'culture' },
];

export const articles = [
  {
    id: '1',
    title: 'The Future of Writing in the Digital Age',
    slug: 'future-of-writing',
    summary: 'How technology is reshaping the way we tell stories and consume information.',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
    author: 'Sourav Halder',
    date: '2023-10-25',
    category: 'Technology',
    image: '/placeholder.jpg',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Understanding Global Markets',
    slug: 'understanding-global-markets',
    summary: 'A deep dive into the economic shifts happening around the world.',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>',
    author: 'Sourav Halder',
    date: '2023-10-24',
    category: 'World',
    image: '/placeholder.jpg',
    isFeatured: false,
  },
  {
    id: '3',
    title: 'The Art of Minimalist Living',
    slug: 'art-of-minimalist-living',
    summary: 'Why less is more in a world of abundance.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    author: 'Sourav Halder',
    date: '2023-10-23',
    category: 'Culture',
    image: '/placeholder.jpg',
    isFeatured: false,
  },
  {
    id: '4',
    title: 'Opinion: Why We Need More Empathy',
    slug: 'why-we-need-more-empathy',
    summary: 'In a divided world, understanding each other is more crucial than ever.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    author: 'Sourav Halder',
    date: '2023-10-22',
    category: 'Opinion',
    image: '/placeholder.jpg',
    isFeatured: false,
  },
];

export const photos = [
  { id: '1', title: 'Sunset over the City', url: '/placeholder.jpg', date: '2023-10-20' },
  { id: '2', title: 'Mountain Peak', url: '/placeholder.jpg', date: '2023-10-19' },
  { id: '3', title: 'Urban Life', url: '/placeholder.jpg', date: '2023-10-18' },
];

export const videos = [
  { id: '1', title: 'Documentary: The Writer\'s Journey', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '2023-10-15' },
];
