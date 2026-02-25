'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJobBySlug, useSimilarJobs } from '@/hooks/useJobs';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { JobCard } from '@/components/jobs/JobCard';
import { PageSpinner } from '@/components/ui/Spinner';
import {
  MapPin,
  Banknote,
  Clock,
  Calendar,
  Building2,
  Briefcase,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  Share2,
  Bookmark,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
  remote: 'Remote',
};

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: job, isLoading, error } = useJobBySlug(slug);
  const { data: similarJobs } = useSimilarJobs(slug);
  const { isAuthenticated } = useAuth();

  if (isLoading) return <PageSpinner />;

  if (error || !job) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900">Job not found</h2>
        <Link href="/jobs" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const locationText = [job.location?.district, job.location?.division]
    .filter(Boolean)
    .join(', ');

  const formatSalary = () => {
    if (!job.salary) return null;
    if (job.salary.isNegotiable) return 'Negotiable';
    if (!job.salary.min && !job.salary.max) return null;
    const c = job.salary.currency || 'BDT';
    if (job.salary.min && job.salary.max) {
      return `${c} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`;
    }
    if (job.salary.min) return `${c} ${job.salary.min.toLocaleString()}+`;
    return `Up to ${c} ${job.salary.max.toLocaleString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-gray-600">
                    <Building2 className="h-5 w-5" />
                    <span className="text-lg">{job.companyName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                    onClick={() => toast.info('Save feature coming soon')}
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button
                    className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied!');
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="default">
                  {jobTypeLabels[job.jobType] || job.jobType}
                </Badge>
                {job.experienceLevel && (
                  <Badge variant="secondary" className="capitalize">
                    {job.experienceLevel} Level
                  </Badge>
                )}
                {job.isFeatured && <Badge variant="warning">Featured</Badge>}
                {job.source && job.source !== 'original' && (
                  <Badge variant="secondary">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    via {job.source}
                  </Badge>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {locationText && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {locationText}
                      {job.location?.isRemote && ' (Remote)'}
                    </span>
                  </div>
                )}
                {formatSalary() && (
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-gray-400" />
                    <span>{formatSalary()}/{job.salary?.period || 'month'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    Posted{' '}
                    {job.publishedAt
                      ? formatDistanceToNow(new Date(job.publishedAt), {
                          addSuffix: true,
                        })
                      : 'recently'}
                  </span>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Job Description
                </h2>
                <div
                  className="prose mt-3 max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>

              {/* Responsibilities */}
              {job.responsibilities?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Responsibilities
                  </h2>
                  <ul className="mt-3 list-inside list-disc space-y-1.5 text-gray-600">
                    {job.responsibilities.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Requirements
                  </h2>
                  <ul className="mt-3 list-inside list-disc space-y-1.5 text-gray-600">
                    {job.requirements.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education */}
              {job.education && (job.education.degree || job.education.field) && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Education
                  </h2>
                  <div className="mt-3 flex items-center gap-2 text-gray-600">
                    <GraduationCap className="h-5 w-5" />
                    <span>
                      {[job.education.degree, job.education.field]
                        .filter(Boolean)
                        .join(' in ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Skills */}
              {job.skillNames?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Skills
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skillNames.map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Benefits
                  </h2>
                  <ul className="mt-3 list-inside list-disc space-y-1.5 text-gray-600">
                    {job.benefits.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              <div className="mt-10 border-t border-gray-200 pt-6">
                {job.applicationMethod === 'external' && job.applicationUrl ? (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg">
                      Apply on {job.source || 'External Site'}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                ) : isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() =>
                      toast.info('Application feature coming in Phase 3')
                    }
                  >
                    <Briefcase className="h-5 w-5" />
                    Apply Now
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button size="lg">Login to Apply</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Similar Jobs */}
        <aside className="hidden w-80 flex-shrink-0 lg:block">
          {similarJobs && similarJobs.length > 0 && (
            <div className="sticky top-24">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Similar Jobs
              </h2>
              <div className="space-y-3">
                {similarJobs.map((sj: any) => (
                  <JobCard key={sj._id || sj.slug} job={sj} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
