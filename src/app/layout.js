import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LanguageProvider } from '@/components/LanguageProvider';
import Providers from '@/components/Providers';
import './globals.css';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Blue - Find Your Perfect Stay',
  description: 'Discover and book the perfect accommodation for your next trip.',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Only revalidate when necessary
export const revalidate = 3600; // 1 hour

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
