import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME } from '@nexora/shared';

export const metadata: Metadata = {
  title: `${APP_NAME} — Super Admin Command Center`,
  description: 'Enterprise Central Management & Dynamic Application Control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}

