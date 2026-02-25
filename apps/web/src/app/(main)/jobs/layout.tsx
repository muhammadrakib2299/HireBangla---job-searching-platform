import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Jobs',
  description:
    'Search and browse thousands of job listings in Bangladesh. Filter by location, category, job type, and salary range.',
  openGraph: {
    title: 'Browse Jobs | HireBangla',
    description:
      'Search and browse thousands of job listings in Bangladesh.',
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
