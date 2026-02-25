import type { Metadata } from 'next';
import CompanyDetailContent from './CompanyDetailContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirebangla.com';

async function getCompany(slug: string) {
  try {
    const res = await fetch(`${API_URL}/companies/${slug}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) {
    return { title: 'Company Not Found' };
  }

  const desc = company.description
    ? company.description.slice(0, 160)
    : `View ${company.name}'s profile and open positions on HireBangla.`;

  return {
    title: company.name,
    description: desc,
    openGraph: {
      title: `${company.name} - Jobs & Company Profile`,
      description: desc,
      url: `${SITE_URL}/companies/${slug}`,
      type: 'profile',
      ...(company.logo && { images: [{ url: company.logo }] }),
    },
    twitter: {
      card: 'summary',
      title: `${company.name} | HireBangla`,
      description: desc,
    },
  };
}

export default function CompanyDetailPage() {
  return <CompanyDetailContent />;
}
