import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Briefcase className="h-8 w-8 text-blue-600" />
        <span className="text-2xl font-bold text-gray-900">
          Hire<span className="text-blue-600">Bangla</span>
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
