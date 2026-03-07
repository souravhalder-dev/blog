
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import PhotoGallery from '@/components/PhotoGallery';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  await dbConnect();
  const { id } = await params;
  
  // Try to find by ID
  let photo;
  try {
      photo = await Photo.findById(id).lean();
  } catch (e) {
      return { title: 'Photo Not Found' };
  }

  if (!photo) return { title: 'Photo Not Found' };

  return {
    title: `${photo.title} | In Pictures`,
    description: photo.description || `View ${photo.title} on Sourav Halder's website.`,
    openGraph: {
      images: [photo.url],
    },
  };
}

export default async function PhotoPage({ params }) {
  await dbConnect();
  const { id } = await params;
  
  // Fetch all photos for the gallery context
  const photos = await Photo.find({}).sort({ date: -1 }).lean();
  const serializedPhotos = photos.map(p => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt?.toString(),
    updatedAt: p.updatedAt?.toString(),
  }));

  // Fetch admin user
  const adminUser = await User.findOne({ role: 'admin' }).lean();
  const serializedUser = adminUser ? {
    name: adminUser.name,
    photo: adminUser.photo,
    description: adminUser.description
  } : null;

  return (
    <PhotoGallery 
        photos={serializedPhotos} 
        user={serializedUser} 
        initialPhotoId={id} 
    />
  );
}
