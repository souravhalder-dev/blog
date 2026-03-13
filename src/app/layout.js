import { Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NextTopLoader from 'nextjs-toploader';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import CookieNotice from "@/components/CookieNotice";

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
  await dbConnect();
  const googleVerification = await getGoogleVerification();
  const [titleSetting, descSetting, faviconSetting] = await Promise.all([
    Settings.findOne({ key: 'site_title' }),
    Settings.findOne({ key: 'site_description' }),
    Settings.findOne({ key: 'favicon_url' }),
  ]);
  const title = titleSetting?.value || 'Writer';
  const description = descSetting?.value || 'Stories, photos and videos';
  const icons = faviconSetting?.value ? { icon: [{ url: faviconSetting.value }] } : undefined;
  return {
    title,
    description,
    verification: { google: googleVerification },
    icons,
  };
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${merriweather.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <NextTopLoader color="#000" height={3} showSpinner={false} />
        <Header />
        <CookieNotice />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
