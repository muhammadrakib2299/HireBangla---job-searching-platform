import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'HireBangla - Find Your Dream Job in Bangladesh',
  description:
    "Bangladesh's leading job searching platform. Search thousands of jobs from top employers, NGOs, and international organizations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
