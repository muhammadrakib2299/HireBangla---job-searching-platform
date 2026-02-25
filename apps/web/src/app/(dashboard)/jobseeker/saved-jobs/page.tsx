'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSavedJobs, useUnsaveJob } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  BookmarkCheck,
  MapPin,
  Building2,
  Banknote,
  Briefcase,
  Trash2,
} from 'lucide-react';

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
  remote: 'Remote',
};

export default function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSavedJobs(page);
  const unsaveMutation = useUnsaveJob();

  const handleUnsave = (jobId: string) => {
    unsaveMutation.mutate(jobId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
      <p className="mt-1 text-sm text-gray-500">
        Jobs you&apos;ve bookmarked for later
      </p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !data?.savedJobs?.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <BookmarkCheck className="h-16 w-16 text-gray-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No saved jobs
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Save jobs while browsing to find them easily later.
          </p>
          <Link href="/jobs" className="mt-4">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {data.savedJobs.map((item: any) => {
              const job = item.job;
              if (!job) return null;

              const formatSalary = () => {
                if (!job.salary) return null;
                if (job.salary.isNegotiable) return 'Negotiable';
                if (!job.salary.min && !job.salary.max) return null;
                const c = job.salary.currency || 'BDT';
                if (job.salary.min && job.salary.max)
                  return `${c} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`;
                if (job.salary.min)
                  return `${c} ${job.salary.min.toLocaleString()}+`;
                return `Up to ${c} ${job.salary.max.toLocaleString()}`;
              };

              return (
                <Card
                  key={item._id}
                  className="transition-all hover:shadow-md"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            {job.companyLogo ? (
                              <img
                                src={job.companyLogo}
                                alt=""
                                className="h-8 w-8 rounded-lg object-contain"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/jobs/${job.slug}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {job.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {job.companyName}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          {job.location?.division && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location.division}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {jobTypeLabels[job.jobType] || job.jobType}
                            </span>
                          )}
                          {formatSalary() && (
                            <span className="flex items-center gap-1">
                              <Banknote className="h-3.5 w-3.5" />
                              {formatSalary()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {job.status === 'active' ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {job.status || 'Closed'}
                          </Badge>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnsave(job._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                          <Link href={`/jobs/${job.slug}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-3 text-sm text-gray-500">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
