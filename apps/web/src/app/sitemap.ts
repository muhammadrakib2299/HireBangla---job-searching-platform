import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirebangla.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchSlugs(endpoint: string, key: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data?.[key] || json.data || [];
    return items.map((item: any) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobSlugs, companySlugs, assessmentSlugs] = await Promise.all([
    fetchSlugs('/jobs?limit=500&status=active', 'jobs'),
    fetchSlugs('/companies?limit=500', 'companies'),
    fetchSlugs('/assessments?limit=100', 'assessments'),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/companies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/assessments`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  const jobPages: MetadataRoute.Sitemap = jobSlugs.map((slug) => ({
    url: `${SITE_URL}/jobs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const companyPages: MetadataRoute.Sitemap = companySlugs.map((slug) => ({
    url: `${SITE_URL}/companies/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const assessmentPages: MetadataRoute.Sitemap = assessmentSlugs.map((slug) => ({
    url: `${SITE_URL}/assessments/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...jobPages, ...companyPages, ...assessmentPages];
}
