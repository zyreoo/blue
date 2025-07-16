import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';

export const metadata = {
  title: 'Blue - Find Your Perfect Stay',
  description: 'Discover and book the perfect accommodation for your next trip.',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
