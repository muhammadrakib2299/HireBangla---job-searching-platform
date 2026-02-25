import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skill Assessments',
  description:
    'Take skill assessments to earn verified badges and stand out to employers. JavaScript, Python, Excel, and more.',
  openGraph: {
    title: 'Skill Assessments | HireBangla',
    description:
      'Take skill assessments to earn verified badges and stand out to employers.',
  },
};

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
