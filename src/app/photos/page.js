
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import User from '@/models/User';
import PhotoGallery from '@/components/PhotoGallery';

export const dynamic = 'force-dynamic';

export default async function PhotosPage() {
  await dbConnect();
  
  // Fetch photos and serialize _id
  const photos = await Photo.find({}).sort({ date: -1 }).lean();
  const serializedPhotos = photos.map(p => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt?.toString(),
    updatedAt: p.updatedAt?.toString(),
  }));

  // Fetch Admin user for profile header
  const adminUser = await User.findOne({ role: 'admin' }).lean();
  const serializedUser = adminUser ? {
    name: adminUser.name,
    photo: adminUser.photo,
    description: adminUser.description,
    email: adminUser.email
  } : null;

  return <PhotoGallery photos={serializedPhotos} user={serializedUser} />;
}
