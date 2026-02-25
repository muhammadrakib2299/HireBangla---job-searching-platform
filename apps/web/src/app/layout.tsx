import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import '@/styles/globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirebangla.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'HireBangla - Find Your Dream Job in Bangladesh',
    template: '%s | HireBangla',
  },
  description:
    "Bangladesh's leading job searching platform. Search thousands of jobs from top employers, NGOs, and international organizations.",
  keywords: [
    'jobs in Bangladesh',
    'Bangladesh jobs',
    'Dhaka jobs',
    'career Bangladesh',
    'job search',
    'HireBangla',
    'NGO jobs Bangladesh',
    'IT jobs Dhaka',
    'remote jobs Bangladesh',
  ],
  authors: [{ name: 'HireBangla' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'HireBangla',
    title: 'HireBangla - Find Your Dream Job in Bangladesh',
    description:
      "Bangladesh's leading job searching platform. Search thousands of jobs from top employers, NGOs, and international organizations.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireBangla - Find Your Dream Job in Bangladesh',
    description:
      "Bangladesh's leading job searching platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
