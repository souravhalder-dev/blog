
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-300 mt-12 py-8 bg-gray-50 text-gray-700">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-xl font-black mb-4 tracking-tighter">SOURAV HALDER<span className="text-red-600">.</span></h3>
          <p className="text-sm">
            Independent journalism and storytelling from around the globe.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 text-xs tracking-wider">SECTIONS</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/category/world" className="hover:underline">World</Link></li>
            <li><Link href="/category/technology" className="hover:underline">Technology</Link></li>
            <li><Link href="/photos" className="hover:underline">Photos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-xs tracking-wider">ABOUT</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About Sourav</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-xs tracking-wider">SUBSCRIBE</h4>
          <p className="text-sm mb-2">Get the latest stories delivered to your inbox.</p>
          <form className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="border border-gray-300 px-3 py-1 text-sm w-full rounded-sm"
            />
            <button className="bg-black text-white px-4 py-1 text-sm font-bold rounded-sm hover:bg-gray-800">
              SIGN UP
            </button>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        &copy; {currentYear} Sourav Halder. All rights reserved.
      </div>
    </footer>
  );
}
