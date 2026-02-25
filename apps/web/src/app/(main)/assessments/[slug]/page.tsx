import type { Metadata } from 'next';
import AssessmentDetailContent from './AssessmentDetailContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirebangla.com';

async function getAssessment(slug: string) {
  try {
    const res = await fetch(`${API_URL}/assessments/slug/${slug}`, {
      next: { revalidate: 3600 },
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
  const assessment = await getAssessment(slug);

  if (!assessment) {
    return { title: 'Assessment Not Found' };
  }

  const desc = assessment.description
    || `Take the ${assessment.title} assessment and earn a verified ${assessment.skillName} badge on HireBangla.`;

  return {
    title: `${assessment.title} Assessment`,
    description: desc,
    openGraph: {
      title: `${assessment.title} - Skill Assessment`,
      description: desc,
      url: `${SITE_URL}/assessments/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${assessment.title} Assessment | HireBangla`,
      description: desc,
    },
  };
}

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <AssessmentDetailContent params={params} />;
}
