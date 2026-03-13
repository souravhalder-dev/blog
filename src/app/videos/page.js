
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoList from '@/components/VideoList';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  await dbConnect();
  // Fetch featured first if any, then the rest by date
  const [featured, latest] = await Promise.all([
    Video.findOne({ isFeatured: true }).sort({ date: -1 }).lean(),
    Video.find({}).sort({ date: -1 }).lean(),
  ]);
  const ordered = featured
    ? [featured, ...latest.filter(v => v._id.toString() !== featured._id.toString())]
    : latest;
  const serializedVideos = ordered.map(video => ({
      ...video,
      _id: video._id.toString(),
      createdAt: video.createdAt?.toString(),
      updatedAt: video.updatedAt?.toString(),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8 border-b border-black pb-2">Videos</h1>
      <VideoList videos={serializedVideos} />
    </div>
  );
}
