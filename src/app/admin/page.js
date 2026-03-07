
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import Photo from '@/models/Photo';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await dbConnect();
  const articleCount = await Article.countDocuments();
  const categoryCount = await Category.countDocuments();
  const photoCount = await Photo.countDocuments();
  const videoCount = await Video.countDocuments();

  const stats = [
    { label: 'Total Articles', value: articleCount },
    { label: 'Categories', value: categoryCount },
    { label: 'Photos', value: photoCount },
    { label: 'Videos', value: videoCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <p className="text-gray-500">Database connected. System operational.</p>
      </div>
    </div>
  );
}
