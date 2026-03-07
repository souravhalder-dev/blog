
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import VideoList from '@/components/VideoList';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  await dbConnect();
  // Fetch videos and convert _id to string for serialization
  const videos = await Video.find({}).sort({ date: -1 }).lean();
  const serializedVideos = videos.map(video => ({
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
