import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: 'Enterprise All-in-One Digital Ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        <Providers>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
