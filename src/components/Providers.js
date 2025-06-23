'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/hooks/useLanguage';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
} 