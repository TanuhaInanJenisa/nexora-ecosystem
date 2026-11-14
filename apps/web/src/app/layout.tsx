import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { Providers } from '../components/providers';

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
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
