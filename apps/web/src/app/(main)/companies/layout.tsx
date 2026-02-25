import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'Explore top employers, NGOs, and organizations hiring in Bangladesh. View company profiles and open positions.',
  openGraph: {
    title: 'Companies | HireBangla',
    description:
      'Explore top employers, NGOs, and organizations hiring in Bangladesh.',
  },
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
