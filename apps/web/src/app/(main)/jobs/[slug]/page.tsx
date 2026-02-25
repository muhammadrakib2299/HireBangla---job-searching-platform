import type { Metadata } from 'next';
import JobDetailContent from './JobDetailContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirebangla.com';

async function getJob(slug: string) {
  try {
    const res = await fetch(`${API_URL}/jobs/slug/${slug}`, {
      next: { revalidate: 300 },
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
  const job = await getJob(slug);

  if (!job) {
    return { title: 'Job Not Found' };
  }

  const location = [job.location?.district, job.location?.division]
    .filter(Boolean)
    .join(', ');

  const description = [
    job.companyName && `at ${job.companyName}`,
    location && `in ${location}`,
    job.jobType && `(${job.jobType})`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    title: job.title,
    description: `${job.title} ${description}. Apply now on HireBangla.`,
    openGraph: {
      title: `${job.title} - ${job.companyName || 'HireBangla'}`,
      description: `${job.title} ${description}. Apply now on HireBangla.`,
      url: `${SITE_URL}/jobs/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${job.title} - ${job.companyName || 'HireBangla'}`,
      description: `${job.title} ${description}`,
    },
  };
}

export default function JobDetailPage() {
  return <JobDetailContent />;
}
