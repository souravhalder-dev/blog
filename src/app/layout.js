
import { Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NextTopLoader from 'nextjs-toploader';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

async function getGoogleVerification() {
  try {
    await dbConnect();
    const setting = await Settings.findOne({ key: 'google_verification' });
    return setting ? setting.value : null;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
}

export async function generateMetadata() {
  const googleVerification = await getGoogleVerification();
  
  return {
    title: "Sourav Halder | Writer & Journalist",
    description: "Official website of writer Sourav Halder. Explore articles, photos, and videos.",
    verification: {
      google: googleVerification,
    },
  };
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${merriweather.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <NextTopLoader color="#000" height={3} showSpinner={false} />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
