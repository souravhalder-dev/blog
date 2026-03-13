export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">We’ll Be Right Back</h1>
        <p className="text-gray-600 mb-6">
          Our site is temporarily down for maintenance. Please check back soon.
        </p>
        <div className="text-xs text-gray-400 uppercase tracking-widest">Maintenance Mode</div>
      </div>
    </div>
  );
}

