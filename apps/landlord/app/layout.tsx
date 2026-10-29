import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { AuthProvider } from '@/components/providers/auth-provider';
import { StripEmojisGuard } from '@/components/providers/strip-emojis-guard';
import { LandlordDataProvider } from '@/components/providers/landlord-data-provider';
import { ProviderErrorBoundary } from '@/components/providers/provider-error-boundary';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CROSSUB | Landlord App',
  description:
    'Property owner portal — portfolio visibility, approvals, financial transparency, and communication.',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0f10',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <StripEmojisGuard />
          <ProviderErrorBoundary>
            <LandlordDataProvider>
              {children}
            </LandlordDataProvider>
          </ProviderErrorBoundary>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
