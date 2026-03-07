const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let mongoUri = '';

try {
  if (fs.existsSync(envPath)) {
    console.log('Found .env.local at:', envPath);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const lines = envConfig.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('MONGODB_URI=')) {
        const parts = line.trim().split('=');
        mongoUri = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if (mongoUri.startsWith('"') && mongoUri.endsWith('"')) {
          mongoUri = mongoUri.slice(1, -1);
        }
        break;
      }
    }
  } else {
    console.log('Could not find .env.local at:', envPath);
  }
} catch (err) {
  console.error('Error reading .env.local:', err);
}

if (!mongoUri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('Connecting to MongoDB...');

// Define Schemas (matching src/models structure)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true, collection: 'user' });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true }, // Store category name/slug for simplicity in seed
  image: { type: String, default: '/placeholder.jpg' },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

const PhotoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

// Models
// Note: We use mongoose.models to check if compiled, though in a script it's usually fresh.
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
const Photo = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);
const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

// Data to Seed
const categories = [
  { name: 'World', slug: 'world' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Opinion', slug: 'opinion' },
  { name: 'Culture', slug: 'culture' },
];

const articles = [
  {
    title: 'The Future of Writing in the Digital Age',
    slug: 'future-of-writing',
    summary: 'How technology is reshaping the way we tell stories and consume information.',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
    author: 'Sourav Halder',
    date: '2023-10-25',
    category: 'Technology',
    image: 'https://placehold.co/600x400',
    isFeatured: true,
  },
  {
    title: 'Understanding Global Markets',
    slug: 'understanding-global-markets',
    summary: 'A deep dive into the economic shifts happening around the world.',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>',
    author: 'Sourav Halder',
    date: '2023-10-24',
    category: 'World',
    image: 'https://placehold.co/600x400',
    isFeatured: false,
  },
  {
    title: 'The Art of Minimalist Living',
    slug: 'art-of-minimalist-living',
    summary: 'Why less is more in a world of abundance.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    author: 'Sourav Halder',
    date: '2023-10-23',
    category: 'Culture',
    image: 'https://placehold.co/600x400',
    isFeatured: false,
  },
  {
    title: 'Opinion: Why We Need More Empathy',
    slug: 'why-we-need-more-empathy',
    summary: 'In a divided world, understanding each other is more crucial than ever.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    author: 'Sourav Halder',
    date: '2023-10-22',
    category: 'Opinion',
    image: 'https://placehold.co/600x400',
    isFeatured: false,
  },
];

const photos = [
  { title: 'Sunset over the City', url: 'https://placehold.co/600x400', date: '2023-10-20' },
  { title: 'Mountain Peak', url: 'https://placehold.co/600x400', date: '2023-10-19' },
  { title: 'Urban Life', url: 'https://placehold.co/600x400', date: '2023-10-18' },
];

const videos = [
  { title: 'Documentary: The Writer\'s Journey', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '2023-10-15' },
];

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // 1. Seed User
    const email = 'skhsouravhalder@gmail.com';
    const password = 'bXm8dm0phhbekJ0Q';

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating password...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('Password updated successfully.');
    } else {
      console.log(`Creating new admin user ${email}...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        role: 'admin',
      });
      await newUser.save();
      console.log('Admin user created successfully.');
    }

    // 2. Seed Categories
    console.log('Seeding categories...');
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log(`Seeded ${categories.length} categories.`);

    // 3. Seed Articles
    console.log('Seeding articles...');
    await Article.deleteMany({});
    await Article.insertMany(articles);
    console.log(`Seeded ${articles.length} articles.`);

    // 4. Seed Photos
    console.log('Seeding photos...');
    await Photo.deleteMany({});
    await Photo.insertMany(photos);
    console.log(`Seeded ${photos.length} photos.`);

    // 5. Seed Videos
    console.log('Seeding videos...');
    await Video.deleteMany({});
    await Video.insertMany(videos);
    console.log(`Seeded ${videos.length} videos.`);

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
